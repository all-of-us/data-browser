package org.pmiops.workbench.publicapi;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.web.bind.annotation.RestController;
import org.pmiops.workbench.service.AchillesAnalysisService;
import org.pmiops.workbench.service.CdrVersionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.pmiops.workbench.model.Analysis;
import org.pmiops.workbench.model.Variant;
import org.pmiops.workbench.model.VariantInfo;
import org.pmiops.workbench.model.GenomicFilters;
import org.pmiops.workbench.model.GenomicFilterOption;
import org.pmiops.workbench.model.GenomicFilterOptionList;
import org.pmiops.workbench.model.VariantListResponse;
import org.pmiops.workbench.exceptions.ServerErrorException;
import org.pmiops.workbench.service.BigQueryService;
import com.google.cloud.bigquery.FieldValue;
import com.google.cloud.bigquery.QueryJobConfiguration;
import com.google.cloud.bigquery.QueryParameterValue;
import com.google.cloud.bigquery.TableResult;
import com.google.common.base.Strings;
import org.pmiops.workbench.model.AnalysisListResponse;
import com.google.common.collect.ImmutableList;
import org.pmiops.workbench.model.AnalysisIdConstant;
import org.pmiops.workbench.model.CommonStorageEnums;
import org.pmiops.workbench.model.SearchVariantsRequest;
import org.pmiops.workbench.model.VariantResultSizeRequest;
import org.pmiops.workbench.model.SortMetadata;
import org.pmiops.workbench.model.SortColumnDetails;

@RestController
public class GenomicsController implements GenomicsApiDelegate {

    @Autowired
    private AchillesAnalysisService achillesAnalysisService;
    @Autowired
    private CdrVersionService cdrVersionService;
    @Autowired
    private BigQueryService bigQueryService;

    private static final String genomicRegionRegex = "(?i)([\"]*)(chr([0-9]{1,})*[XYxy]*:{0,}).*";
    private static final String variantIdRegex = "(?i)([\"]*)((\\d{1,}|X|Y)-\\d{5,}-[A,C,T,G]{1,}-[A,C,T,G]{1,}).*";
    private static final String rsNumberRegex = "(?i)(rs)(\\d{1,})";
    private static final String COUNT_SQL_TEMPLATE = "SELECT count(*) as count FROM ${projectId}.${dataSetId}.wgs_variant";
    private static final String WHERE_CONTIG = " where contig = @contig";
    private static final String AND_POSITION = " and position <= @high and position >= @low";
    private static final String WHERE_VARIANT_ID = " where variant_id = @variant_id";

    // private static final String WHERE_GENE = ", unnest(split(genes, ', ')) AS gene\n" +
    //         " where REGEXP_CONTAINS(gene, @genes)";
    private static final String WHERE_RS_NUMBER_CONTAINS = ", unnest(rs_number) AS rsid\n" +
            " where REGEXP_CONTAINS(rsid, @rs_id)";
    private static final String WHERE_RS_NUMBER_EXACT = " where @rs_id in unnest(rs_number)";
    private static final String WHERE_GENE_REGEX = " where REGEXP_CONTAINS(genes, @genes)";
    // private static final String WHERE_GENE_EXACT = " where @genes in unnest(split(lower(genes), ', '))";
    private static final String VARIANT_LIST_SQL_TEMPLATE = "SELECT variant_id, genes, (SELECT STRING_AGG(distinct d, \", \" order by d asc) FROM UNNEST(consequence) d) as cons_agg_str, " +
            "protein_change, (SELECT STRING_AGG(distinct d, \", \" order by d asc) FROM UNNEST(clinical_significance) d) as clin_sig_agg_str, allele_count, allele_number, allele_frequency FROM ${projectId}.${dataSetId}.wgs_variant";
    private static final String VARIANT_DETAIL_SQL_TEMPLATE = "SELECT dna_change, transcript, ARRAY_TO_STRING(rs_number, ', ') as rs_number, gvs_afr_ac as afr_allele_count, gvs_afr_an as afr_allele_number, gvs_afr_af as afr_allele_frequency, gvs_eas_ac as eas_allele_count, gvs_eas_an as eas_allele_number, gvs_eas_af as eas_allele_frequency, " +
            "gvs_eur_ac as eur_allele_count, gvs_eur_an as eur_allele_number, gvs_eur_af as eur_allele_frequency, " +
            "gvs_amr_ac as amr_allele_count, gvs_amr_an as amr_allele_number, gvs_amr_af as amr_allele_frequency, " +
            "gvs_mid_ac as mid_allele_count, gvs_mid_an as mid_allele_number, gvs_mid_af as mid_allele_frequency, " +
            "gvs_sas_ac as sas_allele_count, gvs_sas_an as sas_allele_number, gvs_sas_af as sas_allele_frequency, " +
            "gvs_oth_ac as oth_allele_count, gvs_oth_an as oth_allele_number, gvs_oth_af as oth_allele_frequency, " +
            "gvs_all_ac as total_allele_count, gvs_all_an as total_allele_number, gvs_all_af as total_allele_frequency from ${projectId}.${dataSetId}.wgs_variant";

    private static final String FILTER_OPTION_SQL_TEMPLATE_GENE = "with a as\n" +
            "(select 'Gene' as option, genes as genes, '' as conseq, '' as clin_significance, count(*) as gene_count, " +
            "0 as con_count, " +
            "0 as clin_count, 0 as min_count, 0 as max_count\n" +
            "from ${projectId}.${dataSetId}.wgs_variant tj, \n" +
            " unnest(split(genes, ', ')) gene\n";
    private static final String FILTER_OPTION_SQL_TEMPLATE_CON = " group by genes),\n" +
            "b as\n" +
            "(select 'Consequence' as option, '' as genes, conseq, '' as clin_significance, 0 as gene_count, count(*) as con_count, 0 as clin_count, 0 as min_count, 0 as max_count\n" +
            "from ${projectId}.${dataSetId}.wgs_variant left join unnest(consequence) AS conseq\n";
    private static final String FILTER_OPTION_SQL_TEMPLATE_CLIN = " group by conseq),\n" +
            "c as\n" +
            "(select 'Clinical Significance' as option, '' as genes, '' as consequence, clin as clin_significance, \n" +
            "0 as gene_count, 0 as con_count, count(*) as clin_count, 0 as min_count, 0 as max_count\n" +
            "from ${projectId}.${dataSetId}.wgs_variant left join unnest(clinical_significance) AS clin\n";
    private static final String FILTER_OPTION_SQL_TEMPLATE_ALLELE_COUNT = " group by clin),\n" +
            "d as \n" +
            "(select 'Allele Count' as option, '' as genes, '' as consequence, '' as clin_significance, \n" +
            "0 as gene_count, 0 as con_count, 0 as clin_count,\n" +
            "min(allele_count) as min_count, max(allele_count) as max_count\n" +
            "from ${projectId}.${dataSetId}.wgs_variant\n";
    private static final String FILTER_OPTION_SQL_TEMPLATE_ALLELE_NUMBER = "),\n" +
            "e as \n" +
            "(select 'Allele Number' as option, '' as genes, '' as consequence, '' as clin_significance, \n" +
            "0 as gene_count, 0 as con_count, 0 as clin_count,\n" +
            "min(allele_number) as min_count, max(allele_number) as max_count\n" +
            "from ${projectId}.${dataSetId}.wgs_variant\n";
    private static final String FILTER_OPTION_SQL_TEMPLATE_UNION = ")" +
            "select * from a \n" +
            "union all \n" +
            "select * from b \n" +
            "union all \n" +
            "select * from c \n" +
            "union all \n" +
            "select * from d \n" +
            "union all \n" +
            "select * from e;";

    public GenomicsController() {}

    public GenomicsController(AchillesAnalysisService achillesAnalysisService, CdrVersionService cdrVersionService,
                              BigQueryService bigQueryService) {
        this.achillesAnalysisService = achillesAnalysisService;
        this.cdrVersionService = cdrVersionService;
        this.bigQueryService = bigQueryService;
    }

    @Override
    public ResponseEntity<Analysis> getParticipantCounts() {
        try {
            cdrVersionService.setDefaultCdrVersion();
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }
        return ResponseEntity.ok(achillesAnalysisService.findAnalysisByIdAndDomain(3000L, "Genomics"));
    }

    @Override
    public ResponseEntity<Long> getVariantSearchResultSize(VariantResultSizeRequest variantResultSizeRequest) {
        try {
            cdrVersionService.setDefaultCdrVersion();
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }
        String finalSql = COUNT_SQL_TEMPLATE;
        String genes = "";
        Long low = 0L;
        Long high = 0L;
        String variant_id = "";
        String rs_id = "";
        String variantSearchTerm = variantResultSizeRequest.getQuery().trim();
        GenomicFilters filters = variantResultSizeRequest.getFilterMetadata();
        String searchTerm = variantSearchTerm;
        boolean whereGeneFlag = false;
        if (variantSearchTerm.startsWith("~")) {
            searchTerm = variantSearchTerm.substring(1);
        }
        String contig = "(?i)(" + searchTerm + ")$";
        // Make sure the search term is not empty
        if (!Strings.isNullOrEmpty(searchTerm)) {
            // Check if the search term matches genomic region search term pattern
            if (searchTerm.matches(genomicRegionRegex)) {
                String[] regionTermSplit = new String[0];
                if (searchTerm.contains(":")) {
                    regionTermSplit = searchTerm.split(":");
                    contig = regionTermSplit[0].substring(0, 3).toLowerCase() + regionTermSplit[0].substring(3).toUpperCase();
                }
                finalSql = COUNT_SQL_TEMPLATE + WHERE_CONTIG;
                if (regionTermSplit.length > 1) {
                    String[] rangeSplit = regionTermSplit[1].split("-");
                    try {
                        if (rangeSplit.length == 2) {
                            low = Math.min(Long.valueOf(rangeSplit[0]), Long.valueOf(rangeSplit[1]));
                            high = Math.max(Long.valueOf(rangeSplit[0]), Long.valueOf(rangeSplit[1]));
                            finalSql += AND_POSITION;
                        }
                    } catch(NumberFormatException e) {
                        System.out.println("Trying to convert bad number.");
                    }
                }
            } else if (searchTerm.matches(variantIdRegex)) {
                // Check if the search term matches variant id pattern
                variant_id = searchTerm;
                finalSql += WHERE_VARIANT_ID;
            } else if (searchTerm.matches(rsNumberRegex)) {
                if (variantSearchTerm.startsWith("~")) {
                    rs_id = "(?i)" + searchTerm;
                    finalSql += WHERE_RS_NUMBER_CONTAINS;
                } else {
                    rs_id = searchTerm;
                    finalSql += WHERE_RS_NUMBER_EXACT;
                }
            } else {// Check if the search term matches gene coding pattern
                whereGeneFlag = true;
                if (variantSearchTerm.startsWith("~")) {
                    genes = searchTerm.toUpperCase();
                } else {
                    genes = "\\b" + searchTerm.toUpperCase() + "\\b";
                }
                finalSql += WHERE_GENE_REGEX;
            }
        }
        String WHERE_GENE_IN = " AND genes in (";
        String WHERE_CON_IN = " AND (EXISTS (SELECT con FROM UNNEST (consequence) as con where con in (";
        String WHERE_CON_NULL = "";
        String WHERE_CLIN_IN = " AND (EXISTS (SELECT clin FROM UNNEST (clinical_significance) as clin where clin in (";
        String WHERE_CLIN_NULL = "";
        String ALLELE_COUNT_FILTER = "";
        String ALLELE_NUMBER_FILTER = "";
        String ALLELE_FREQUENCY_FILTER = "";
        boolean geneFilterFlag = false;
        boolean conFilterFlag = false;
        boolean clinFilterFlag = false;
        if (filters != null) {
            GenomicFilterOptionList geneFilterList = filters.getGene();
            List<GenomicFilterOption> geneFilters = geneFilterList.getItems();
            if (geneFilters != null && geneFilters.size() > 0 && geneFilterList.getFilterActive()) {
                for(int i=0; i < geneFilters.size(); i++) {
                    GenomicFilterOption filter = geneFilters.get(i);
                    if (filter.getChecked() && !Strings.isNullOrEmpty(filter.getOption())) {
                        WHERE_GENE_IN += "\"" + filter.getOption().toUpperCase() + "\",";
                    }
                }
            }
            GenomicFilterOptionList conFilterList = filters.getConsequence();
            List<GenomicFilterOption> conFilters = conFilterList.getItems();
            if (conFilters != null && conFilters.size() > 0 && conFilterList.getFilterActive()) {
                for(int i=0; i < conFilters.size(); i++) {
                    GenomicFilterOption filter = conFilters.get(i);
                    if (filter.getChecked()) {
                        if (!Strings.isNullOrEmpty(filter.getOption())) {
                            WHERE_CON_IN += "\"" + filter.getOption() + "\",";
                        } else {
                            WHERE_CON_NULL = " OR ARRAY_LENGTH(consequence) = 0";
                        }
                    }
                }
            }
            GenomicFilterOptionList clinFilterList = filters.getClinicalSignificance();
            List<GenomicFilterOption> clinFilters = clinFilterList.getItems();
            if (clinFilters != null && clinFilters.size() > 0 && clinFilterList.getFilterActive()) {
                for(int i=0; i < clinFilters.size(); i++) {
                    GenomicFilterOption filter = clinFilters.get(i);
                    if (filter.getChecked()) {
                        if (!Strings.isNullOrEmpty(filter.getOption())) {
                            WHERE_CLIN_IN += "\"" + filter.getOption() + "\",";
                        } else {
                            WHERE_CLIN_NULL = " OR ARRAY_LENGTH(clinical_significance) = 0";
                        }
                    }
                }
            }
            GenomicFilterOption acFilter = filters.getAlleleCount();
            if (acFilter != null && acFilter.getChecked()) {
                Long minVal = acFilter.getMin();
                Long maxVal = acFilter.getMax();
                ALLELE_COUNT_FILTER = " AND allele_count BETWEEN " + minVal + " AND " + maxVal;
            }
            GenomicFilterOption anFilter = filters.getAlleleNumber();
            if (anFilter != null && anFilter.getChecked()) {
                Long minVal = anFilter.getMin();
                Long maxVal = anFilter.getMax();
                ALLELE_NUMBER_FILTER = " AND allele_number BETWEEN " + minVal + " AND " + maxVal;
            }
            GenomicFilterOption afFilter = filters.getAlleleFrequency();
            if (afFilter != null && afFilter.getChecked()) {
                Float minVal = afFilter.getMinFreq();
                Float maxVal = afFilter.getMaxFreq();
                ALLELE_FREQUENCY_FILTER = " AND allele_frequency BETWEEN " + minVal + " AND " + maxVal;
            }
        }
        if (WHERE_GENE_IN.substring(WHERE_GENE_IN.length() - 1).equals(",")) {
            geneFilterFlag = true;
            WHERE_GENE_IN = WHERE_GENE_IN.substring(0, WHERE_GENE_IN.length()-1);
            WHERE_GENE_IN += ") ";
        }
        if (WHERE_CON_IN.substring(WHERE_CON_IN.length() - 1).equals(",")) {
            conFilterFlag = true;
            WHERE_CON_IN = WHERE_CON_IN.substring(0, WHERE_CON_IN.length()-1);
            WHERE_CON_IN += ")) ";
        }
        if (WHERE_CLIN_IN.substring(WHERE_CLIN_IN.length() - 1).equals(",")) {
            clinFilterFlag = true;
            WHERE_CLIN_IN = WHERE_CLIN_IN.substring(0, WHERE_CLIN_IN.length()-1);
            WHERE_CLIN_IN += ")) ";
        }
        if (geneFilterFlag) {
            if (whereGeneFlag) {
                finalSql = finalSql.replace(WHERE_GENE_REGEX, "");
                WHERE_GENE_IN = " WHERE" + WHERE_GENE_IN.substring(4);
            }
            finalSql += WHERE_GENE_IN;
        }
        if (conFilterFlag) {
            finalSql += WHERE_CON_IN;
            if (WHERE_CON_NULL.length() > 0) {
                finalSql += WHERE_CON_NULL;
            }
            finalSql += ") ";
        } else {
            if (WHERE_CON_NULL.length() > 0) {
                finalSql += " AND ARRAY_LENGTH(consequence) = 0";
            }
        }
        if (clinFilterFlag) {
            finalSql += WHERE_CLIN_IN;
            if (WHERE_CLIN_NULL.length() > 0) {
                finalSql += WHERE_CLIN_NULL;
            }
            finalSql += ") ";
        } else {
            if (WHERE_CLIN_NULL.length() > 0) {
                finalSql += " AND ARRAY_LENGTH(clinical_significance) = 0";
            }
        }
        if (ALLELE_COUNT_FILTER.length() > 0) {
            finalSql += ALLELE_COUNT_FILTER;
        }
        if (ALLELE_NUMBER_FILTER.length() > 0) {
            finalSql += ALLELE_NUMBER_FILTER;
        }
        if (ALLELE_FREQUENCY_FILTER.length() > 0) {
            finalSql += ALLELE_FREQUENCY_FILTER;
        }

        System.out.println("**************************************************************");
        System.out.println(finalSql);
        System.out.println("**************************************************************");

        QueryJobConfiguration qjc = QueryJobConfiguration.newBuilder(finalSql)
                .addNamedParameter("contig", QueryParameterValue.string(contig))
                .addNamedParameter("high", QueryParameterValue.int64(high))
                .addNamedParameter("low", QueryParameterValue.int64(low))
                .addNamedParameter("variant_id", QueryParameterValue.string(variant_id))
                .addNamedParameter("genes", QueryParameterValue.string(genes))
                .addNamedParameter("rs_id", QueryParameterValue.string(rs_id))
                .setUseLegacySql(false)
                .build();
        qjc = bigQueryService.filterBigQueryConfig(qjc);
        TableResult result = bigQueryService.executeQuery(qjc);
        Map<String, Integer> rm = bigQueryService.getResultMapper(result);
        List<FieldValue> row = result.iterateAll().iterator().next();
        return ResponseEntity.ok(bigQueryService.getLong(row, rm.get("count")));
    }

    @Override
    public ResponseEntity<VariantListResponse> searchVariants(SearchVariantsRequest searchVariantsRequest) {
        try {
            cdrVersionService.setDefaultCdrVersion();
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }
        String variantSearchTerm = searchVariantsRequest.getQuery().trim();
        Integer page = searchVariantsRequest.getPageNumber();
        Integer rowCount = searchVariantsRequest.getRowCount();
        SortMetadata sortMetadata = searchVariantsRequest.getSortMetadata();
        GenomicFilters filters = searchVariantsRequest.getFilterMetadata();
        String ORDER_BY_CLAUSE = " ORDER BY variant_id ASC";
        if (sortMetadata != null) {
            SortColumnDetails variantIdColumnSortMetadata = sortMetadata.getVariantId();
            if (variantIdColumnSortMetadata != null && variantIdColumnSortMetadata.getSortActive()) {
                if (variantIdColumnSortMetadata.getSortDirection().equals("desc")) {
                    ORDER_BY_CLAUSE = " ORDER BY variant_id DESC";
                }
            }
            SortColumnDetails geneColumnSortMetadata = sortMetadata.getGene();
            if (geneColumnSortMetadata != null && geneColumnSortMetadata.getSortActive()) {
                if (geneColumnSortMetadata.getSortDirection().equals("asc")) {
                    ORDER_BY_CLAUSE = " ORDER BY genes ASC";
                } else {
                    ORDER_BY_CLAUSE = " ORDER BY genes DESC";
                }
            }
            SortColumnDetails consequenceColumnSortMetadata = sortMetadata.getConsequence();
            if (consequenceColumnSortMetadata != null && consequenceColumnSortMetadata.getSortActive()) {
                if (consequenceColumnSortMetadata.getSortDirection().equals("asc")) {
                    ORDER_BY_CLAUSE = " ORDER BY (SELECT STRING_AGG(distinct d, \", \" order by d asc) FROM UNNEST(consequence) d) ASC";
                } else {
                    ORDER_BY_CLAUSE = " ORDER BY (SELECT STRING_AGG(distinct d, \", \" order by d asc) FROM UNNEST(consequence) d) DESC";
                }
            }
            SortColumnDetails proteinChangeColumnSortMetadata = sortMetadata.getProteinChange();
            if (proteinChangeColumnSortMetadata != null && proteinChangeColumnSortMetadata.getSortActive()) {
                if (proteinChangeColumnSortMetadata.getSortDirection().equals("asc")) {
                    ORDER_BY_CLAUSE = " ORDER BY protein_change ASC";
                } else {
                    ORDER_BY_CLAUSE = " ORDER BY protein_change DESC";
                }
            }
            SortColumnDetails clinSigColumnSortMetadata = sortMetadata.getClinicalSignificance();
            if (clinSigColumnSortMetadata != null && clinSigColumnSortMetadata.getSortActive()) {
                if (clinSigColumnSortMetadata.getSortDirection().equals("asc")) {
                    ORDER_BY_CLAUSE = " ORDER BY (SELECT STRING_AGG(distinct d, \", \" order by d asc) FROM UNNEST(clinical_significance) d) ASC";
                } else {
                    ORDER_BY_CLAUSE = " ORDER BY (SELECT STRING_AGG(distinct d, \", \" order by d asc) FROM UNNEST(clinical_significance) d) DESC";
                }
            }
            SortColumnDetails alleleCountColumnSortMetadata = sortMetadata.getAlleleCount();
            if (alleleCountColumnSortMetadata != null && alleleCountColumnSortMetadata.getSortActive()) {
                if (alleleCountColumnSortMetadata.getSortDirection().equals("asc")) {
                    ORDER_BY_CLAUSE = " ORDER BY allele_count ASC";
                } else {
                    ORDER_BY_CLAUSE = " ORDER BY allele_count DESC";
                }
            }
            SortColumnDetails alleleNumberColumnSortMetadata = sortMetadata.getAlleleNumber();
            if (alleleNumberColumnSortMetadata != null && alleleNumberColumnSortMetadata.getSortActive()) {
                if (alleleNumberColumnSortMetadata.getSortDirection().equals("asc")) {
                    ORDER_BY_CLAUSE = " ORDER BY allele_number ASC";
                } else {
                    ORDER_BY_CLAUSE = " ORDER BY allele_number DESC";
                }
            }
            SortColumnDetails alleleFrequencyColumnSortMetadata = sortMetadata.getAlleleFrequency();
            if (alleleFrequencyColumnSortMetadata != null && alleleFrequencyColumnSortMetadata.getSortActive()) {
                if (alleleFrequencyColumnSortMetadata.getSortDirection().equals("asc")) {
                    ORDER_BY_CLAUSE = " ORDER BY allele_frequency ASC";
                } else {
                    ORDER_BY_CLAUSE = " ORDER BY allele_frequency DESC";
                }
            }
        }
        String finalSql = VARIANT_LIST_SQL_TEMPLATE;
        String genes = "";
        Long low = 0L;
        Long high = 0L;
        String variant_id = "";
        String rs_id = "";
        String searchTerm = variantSearchTerm;
        boolean whereGeneFlag = false;
        if (variantSearchTerm.startsWith("~")) {
            searchTerm = variantSearchTerm.substring(1);
        }
        String contig = searchTerm;
        // Make sure the search term is not empty
        if (!Strings.isNullOrEmpty(searchTerm)) {
            // Check if the search term matches genomic region search term pattern
            if (searchTerm.matches(genomicRegionRegex)) {
                String[] regionTermSplit = new String[0];
                if (searchTerm.contains(":")) {
                    regionTermSplit = searchTerm.split(":");
                    contig = regionTermSplit[0].substring(0, 3).toLowerCase() + regionTermSplit[0].substring(3).toUpperCase();
                }
                finalSql = VARIANT_LIST_SQL_TEMPLATE + WHERE_CONTIG;
                if (regionTermSplit.length > 1) {
                    String[] rangeSplit = regionTermSplit[1].split("-");
                    try {
                        if (rangeSplit.length == 2) {
                            low = Math.min(Long.valueOf(rangeSplit[0]), Long.valueOf(rangeSplit[1]));
                            high = Math.max(Long.valueOf(rangeSplit[0]), Long.valueOf(rangeSplit[1]));
                            finalSql += AND_POSITION;
                        }
                    } catch(NumberFormatException e) {
                        System.out.println("Trying to convert bad number.");
                    }
                }
            } else if (searchTerm.matches(variantIdRegex)) {
                // Check if the search term matches variant id pattern
                variant_id = searchTerm;
                finalSql += WHERE_VARIANT_ID;
            } else if (searchTerm.matches(rsNumberRegex)) {
                if (variantSearchTerm.startsWith("~")) {
                    rs_id = "(?i)" + searchTerm;
                    finalSql += WHERE_RS_NUMBER_CONTAINS;
                } else {
                    rs_id = searchTerm;
                    finalSql += WHERE_RS_NUMBER_EXACT;
                }
            } else {// Check if the search term matches gene coding pattern
                whereGeneFlag = true;
                if (variantSearchTerm.startsWith("~")) {
                    genes = searchTerm.toUpperCase();
                } else {
                    genes = "\\b" + searchTerm.toUpperCase() + "\\b";
                }
                finalSql += WHERE_GENE_REGEX;
            }
        }
        String WHERE_GENE_IN = " AND genes in (";
        String WHERE_CON_IN = " AND (EXISTS (SELECT con FROM UNNEST (consequence) as con where con in (";
        String WHERE_CON_NULL = "";
        String WHERE_CLIN_IN = " AND (EXISTS (SELECT clin FROM UNNEST (clinical_significance) as clin where clin in (";
        String WHERE_CLIN_NULL = "";
        String ALLELE_COUNT_FILTER = "";
        String ALLELE_NUMBER_FILTER = "";
        String ALLELE_FREQUENCY_FILTER = "";
        boolean geneFilterFlag = false;
        boolean conFilterFlag = false;
        boolean clinFilterFlag = false;
        if (filters != null) {
            GenomicFilterOptionList geneFilterList = filters.getGene();
            List<GenomicFilterOption> geneFilters = geneFilterList.getItems();
            if (geneFilters != null && geneFilters.size() > 0 && geneFilterList.getFilterActive()) {
                for(int i=0; i < geneFilters.size(); i++) {
                    GenomicFilterOption filter = geneFilters.get(i);
                    if (filter.getChecked() && !Strings.isNullOrEmpty(filter.getOption())) {
                        WHERE_GENE_IN += "\"" + filter.getOption().toUpperCase() + "\",";
                    }
                }
            }
            GenomicFilterOptionList conFilterList = filters.getConsequence();
            List<GenomicFilterOption> conFilters = conFilterList.getItems();
            if (conFilters != null && conFilters.size() > 0 && conFilterList.getFilterActive()) {
                for(int i=0; i < conFilters.size(); i++) {
                    GenomicFilterOption filter = conFilters.get(i);
                    if (filter.getChecked()) {
                        if (!Strings.isNullOrEmpty(filter.getOption())) {
                            WHERE_CON_IN += "\"" + filter.getOption() + "\",";
                        } else {
                            WHERE_CON_NULL = " OR ARRAY_LENGTH(consequence) = 0";
                        }
                    }
                }
            }
            GenomicFilterOptionList clinFilterList = filters.getClinicalSignificance();
            List<GenomicFilterOption> clinFilters = clinFilterList.getItems();
            if (clinFilters != null && clinFilters.size() > 0 && clinFilterList.getFilterActive()) {
                for(int i=0; i < clinFilters.size(); i++) {
                    GenomicFilterOption filter = clinFilters.get(i);
                    if (filter.getChecked()) {
                        if (!Strings.isNullOrEmpty(filter.getOption())) {
                            WHERE_CLIN_IN += "\"" + filter.getOption() + "\",";
                        } else {
                            WHERE_CLIN_NULL = " OR ARRAY_LENGTH(clinical_significance) = 0";
                        }
                    }
                }
            }
            GenomicFilterOption acFilter = filters.getAlleleCount();
            if (acFilter != null && acFilter.getChecked()) {
                Long minVal = acFilter.getMin();
                Long maxVal = acFilter.getMax();
                ALLELE_COUNT_FILTER = " AND allele_count BETWEEN " + minVal + " AND " + maxVal;
            }
            GenomicFilterOption anFilter = filters.getAlleleNumber();
            if (anFilter != null && anFilter.getChecked()) {
                Long minVal = anFilter.getMin();
                Long maxVal = anFilter.getMax();
                ALLELE_NUMBER_FILTER = " AND allele_number BETWEEN " + minVal + " AND " + maxVal;
            }
            GenomicFilterOption afFilter = filters.getAlleleFrequency();
            if (afFilter != null && afFilter.getChecked()) {
                Float minVal = afFilter.getMinFreq();
                Float maxVal = afFilter.getMaxFreq();
                ALLELE_FREQUENCY_FILTER = " AND allele_frequency BETWEEN " + minVal + " AND " + maxVal;
            }
        }
        if (WHERE_GENE_IN.substring(WHERE_GENE_IN.length() - 1).equals(",")) {
            geneFilterFlag = true;
            WHERE_GENE_IN = WHERE_GENE_IN.substring(0, WHERE_GENE_IN.length()-1);
            WHERE_GENE_IN += ") ";
        }
        if (WHERE_CON_IN.substring(WHERE_CON_IN.length() - 1).equals(",")) {
            conFilterFlag = true;
            WHERE_CON_IN = WHERE_CON_IN.substring(0, WHERE_CON_IN.length()-1);
            WHERE_CON_IN += ")) ";
        }
        if (WHERE_CLIN_IN.substring(WHERE_CLIN_IN.length() - 1).equals(",")) {
            clinFilterFlag = true;
            WHERE_CLIN_IN = WHERE_CLIN_IN.substring(0, WHERE_CLIN_IN.length()-1);
            WHERE_CLIN_IN += ")) ";
        }
        if (geneFilterFlag) {
            if (whereGeneFlag) {
                finalSql = finalSql.replace(WHERE_GENE_REGEX, "");
                WHERE_GENE_IN = " WHERE" + WHERE_GENE_IN.substring(4);
            }
            finalSql += WHERE_GENE_IN;
        }
        if (conFilterFlag) {
            finalSql += WHERE_CON_IN;
            if (WHERE_CON_NULL.length() > 0) {
                finalSql += WHERE_CON_NULL;
            }
            finalSql += ") ";
        } else {
            if (WHERE_CON_NULL.length() > 0) {
                finalSql += " AND ARRAY_LENGTH(consequence) = 0";
            }
        }

        if (clinFilterFlag) {
            finalSql += WHERE_CLIN_IN;
            if (WHERE_CLIN_NULL.length() > 0) {
                finalSql += WHERE_CLIN_NULL;
            }
            finalSql += ") ";
        } else {
            if (WHERE_CLIN_NULL.length() > 0) {
                finalSql += " AND ARRAY_LENGTH(clinical_significance) = 0";
            }
        }
        if (ALLELE_COUNT_FILTER.length() > 0) {
            finalSql += ALLELE_COUNT_FILTER;
        }
        if (ALLELE_NUMBER_FILTER.length() > 0) {
            finalSql += ALLELE_NUMBER_FILTER;
        }
        if (ALLELE_FREQUENCY_FILTER.length() > 0) {
            finalSql += ALLELE_FREQUENCY_FILTER;
        }
        finalSql += ORDER_BY_CLAUSE;
        finalSql += " LIMIT " + rowCount + " OFFSET " + ((Optional.ofNullable(page).orElse(1)-1)*rowCount);

        System.out.println("**************************************************************");
        System.out.println(finalSql);
        System.out.println("**************************************************************");

        QueryJobConfiguration qjc = QueryJobConfiguration.newBuilder(finalSql)
                .addNamedParameter("contig", QueryParameterValue.string(contig))
                .addNamedParameter("high", QueryParameterValue.int64(high))
                .addNamedParameter("low", QueryParameterValue.int64(low))
                .addNamedParameter("variant_id", QueryParameterValue.string(variant_id))
                .addNamedParameter("genes", QueryParameterValue.string(genes))
                .addNamedParameter("rs_id", QueryParameterValue.string(rs_id))
                .setUseLegacySql(false)
                .build();
        qjc = bigQueryService.filterBigQueryConfig(qjc);
        TableResult result = bigQueryService.executeQuery(qjc);
        Map<String, Integer> rm = bigQueryService.getResultMapper(result);
        List<Variant> variantList = new ArrayList<>();
        for (List<FieldValue> row : result.iterateAll()) {
            variantList.add(new Variant()
                    .variantId(bigQueryService.getString(row, rm.get("variant_id")))
                    .genes(bigQueryService.getString(row, rm.get("genes")))
                    .consequence(bigQueryService.getString(row, rm.get("cons_agg_str")))
                    .proteinChange(bigQueryService.getString(row, rm.get("protein_change")))
                    .clinicalSignificance(bigQueryService.getString(row, rm.get("clin_sig_agg_str")))
                    .alleleCount(bigQueryService.getLong(row, rm.get("allele_count")))
                    .alleleNumber(bigQueryService.getLong(row, rm.get("allele_number")))
                    .alleleFrequency(bigQueryService.getDouble(row, rm.get("allele_frequency"))));
        }
        VariantListResponse variantListResponse = new VariantListResponse();
        variantListResponse.setItems(variantList);
        return ResponseEntity.ok(variantListResponse);
    }

    @Override
    public ResponseEntity<GenomicFilters> getGenomicFilterOptions(String variantSearchTerm) {
        try {
            cdrVersionService.setDefaultCdrVersion();
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }
        String finalSql = FILTER_OPTION_SQL_TEMPLATE_GENE;
        String genes = "";
        Long low = 0L;
        Long high = 0L;
        String variant_id = "";
        String rs_id = "";
        String searchTerm = variantSearchTerm.trim();
        if (variantSearchTerm.startsWith("~")) {
            searchTerm = variantSearchTerm.substring(1);
        }
        String contig = searchTerm;
        // Make sure the search term is not empty
        if (!Strings.isNullOrEmpty(searchTerm)) {
            // Check if the search term matches genomic region search term pattern
            if (searchTerm.matches(genomicRegionRegex)) {
                String[] regionTermSplit = new String[0];
                if (searchTerm.contains(":")) {
                    regionTermSplit = searchTerm.split(":");
                    contig = regionTermSplit[0].substring(0, 3).toLowerCase() + regionTermSplit[0].substring(3).toUpperCase();
                }
                finalSql = FILTER_OPTION_SQL_TEMPLATE_GENE + WHERE_CONTIG
                        + FILTER_OPTION_SQL_TEMPLATE_CON + WHERE_CONTIG
                        + FILTER_OPTION_SQL_TEMPLATE_CLIN + WHERE_CONTIG
                        + FILTER_OPTION_SQL_TEMPLATE_ALLELE_COUNT + WHERE_CONTIG
                        + FILTER_OPTION_SQL_TEMPLATE_ALLELE_NUMBER + WHERE_CONTIG
                        + FILTER_OPTION_SQL_TEMPLATE_UNION;
                if (regionTermSplit.length > 1) {
                    String[] rangeSplit = regionTermSplit[1].split("-");
                    try {
                        if (rangeSplit.length == 2) {
                            low = Math.min(Long.valueOf(rangeSplit[0]), Long.valueOf(rangeSplit[1]));
                            high = Math.max(Long.valueOf(rangeSplit[0]), Long.valueOf(rangeSplit[1]));
                            finalSql = FILTER_OPTION_SQL_TEMPLATE_GENE + WHERE_CONTIG + AND_POSITION +
                                    FILTER_OPTION_SQL_TEMPLATE_CON + WHERE_CONTIG + AND_POSITION +
                                    FILTER_OPTION_SQL_TEMPLATE_CLIN + WHERE_CONTIG + AND_POSITION +
                                    FILTER_OPTION_SQL_TEMPLATE_ALLELE_COUNT + WHERE_CONTIG + AND_POSITION +
                                    FILTER_OPTION_SQL_TEMPLATE_ALLELE_NUMBER + WHERE_CONTIG + AND_POSITION +
                                    FILTER_OPTION_SQL_TEMPLATE_UNION;
                        }
                    } catch(NumberFormatException e) {
                        System.out.println("Trying to convert bad number.");
                    }
                }
            } else if (searchTerm.matches(variantIdRegex)) {
                // Check if the search term matches variant id pattern
                variant_id = searchTerm;
                finalSql = FILTER_OPTION_SQL_TEMPLATE_GENE + WHERE_VARIANT_ID +
                        FILTER_OPTION_SQL_TEMPLATE_CON + WHERE_VARIANT_ID +
                        FILTER_OPTION_SQL_TEMPLATE_CLIN + WHERE_VARIANT_ID +
                        FILTER_OPTION_SQL_TEMPLATE_ALLELE_COUNT + WHERE_VARIANT_ID +
                        FILTER_OPTION_SQL_TEMPLATE_ALLELE_NUMBER + WHERE_VARIANT_ID +
                        FILTER_OPTION_SQL_TEMPLATE_UNION;
            } else if (searchTerm.matches(rsNumberRegex)) {
                if (variantSearchTerm.startsWith("~")) {
                    rs_id = "(?i)" + searchTerm;
                    finalSql = FILTER_OPTION_SQL_TEMPLATE_GENE + WHERE_RS_NUMBER_CONTAINS +
                            FILTER_OPTION_SQL_TEMPLATE_CON + WHERE_RS_NUMBER_CONTAINS +
                            FILTER_OPTION_SQL_TEMPLATE_CLIN + WHERE_RS_NUMBER_CONTAINS +
                            FILTER_OPTION_SQL_TEMPLATE_ALLELE_COUNT + WHERE_RS_NUMBER_CONTAINS +
                            FILTER_OPTION_SQL_TEMPLATE_ALLELE_NUMBER + WHERE_RS_NUMBER_CONTAINS +
                            FILTER_OPTION_SQL_TEMPLATE_UNION;
                } else {
                    rs_id = searchTerm;
                    finalSql = FILTER_OPTION_SQL_TEMPLATE_GENE + WHERE_RS_NUMBER_EXACT +
                            FILTER_OPTION_SQL_TEMPLATE_CON + WHERE_RS_NUMBER_EXACT +
                            FILTER_OPTION_SQL_TEMPLATE_CLIN + WHERE_RS_NUMBER_EXACT +
                            FILTER_OPTION_SQL_TEMPLATE_ALLELE_COUNT + WHERE_RS_NUMBER_EXACT +
                            FILTER_OPTION_SQL_TEMPLATE_ALLELE_NUMBER + WHERE_RS_NUMBER_EXACT +
                            FILTER_OPTION_SQL_TEMPLATE_UNION;
                }
            } else {// Check if the search term matches gene coding pattern
                if (variantSearchTerm.startsWith("~")) {
                    genes = searchTerm.toUpperCase();
                } else {
                    genes = "\\b" + searchTerm.toUpperCase() + "\\b";
                }
                finalSql = FILTER_OPTION_SQL_TEMPLATE_GENE + WHERE_GENE_REGEX +
                        FILTER_OPTION_SQL_TEMPLATE_CON + WHERE_GENE_REGEX +
                        FILTER_OPTION_SQL_TEMPLATE_CLIN + WHERE_GENE_REGEX +
                        FILTER_OPTION_SQL_TEMPLATE_ALLELE_COUNT + WHERE_GENE_REGEX +
                        FILTER_OPTION_SQL_TEMPLATE_ALLELE_NUMBER + WHERE_GENE_REGEX +
                        FILTER_OPTION_SQL_TEMPLATE_UNION;
            }
        }
        QueryJobConfiguration qjc = QueryJobConfiguration.newBuilder(finalSql)
                .addNamedParameter("contig", QueryParameterValue.string(contig))
                .addNamedParameter("high", QueryParameterValue.int64(high))
                .addNamedParameter("low", QueryParameterValue.int64(low))
                .addNamedParameter("variant_id", QueryParameterValue.string(variant_id))
                .addNamedParameter("genes", QueryParameterValue.string(genes))
                .addNamedParameter("rs_id", QueryParameterValue.string(rs_id))
                .setUseLegacySql(false)
                .build();
        qjc = bigQueryService.filterBigQueryConfig(qjc);
        TableResult result = bigQueryService.executeQuery(qjc);
        Map<String, Integer> rm = bigQueryService.getResultMapper(result);
        GenomicFilters genomicFilters = new GenomicFilters();
        GenomicFilterOptionList geneFilterList = new GenomicFilterOptionList();
        GenomicFilterOptionList conseqFilterList = new GenomicFilterOptionList();
        GenomicFilterOptionList clinSigFilterList = new GenomicFilterOptionList();

        List<GenomicFilterOption> geneFilters = new ArrayList<>();
        List<GenomicFilterOption> conseqFilters = new ArrayList<>();
        List<GenomicFilterOption> clinSigFilters = new ArrayList<>();


        GenomicFilterOption alleleCountFilter = new GenomicFilterOption();
        GenomicFilterOption alleleNumberFilter = new GenomicFilterOption();
        for (List<FieldValue> row : result.iterateAll()) {
            String option = bigQueryService.getString(row, rm.get("option"));
            String gene = bigQueryService.getString(row, rm.get("genes"));
            String conseq = bigQueryService.getString(row, rm.get("conseq"));
            String clinSignificance = bigQueryService.getString(row, rm.get("clin_significance"));
            Long geneCount = bigQueryService.getLong(row, rm.get("gene_count"));
            Long conCount = bigQueryService.getLong(row, rm.get("con_count"));
            Long clinCount = bigQueryService.getLong(row, rm.get("clin_count"));
            Long minCount = bigQueryService.getLong(row, rm.get("min_count"));
            Long maxCount = bigQueryService.getLong(row, rm.get("max_count"));
            GenomicFilterOption genomicFilterOption = new GenomicFilterOption();
            if (option.equals("Gene")) {
                genomicFilterOption.setOption(gene);
                genomicFilterOption.setCount(geneCount);
                genomicFilterOption.setChecked(false);
                genomicFilterOption.setMin(0L);
                genomicFilterOption.setMax(0L);
                geneFilters.add(genomicFilterOption);
            } else if (option.equals("Consequence")) {
                genomicFilterOption.setOption(conseq);
                genomicFilterOption.setCount(conCount);
                genomicFilterOption.setChecked(false);
                genomicFilterOption.setMin(0L);
                genomicFilterOption.setMax(0L);
                conseqFilters.add(genomicFilterOption);
            } else if (option.equals("Clinical Significance")) {
                genomicFilterOption.setOption(clinSignificance);
                genomicFilterOption.setCount(clinCount);
                genomicFilterOption.setChecked(false);
                genomicFilterOption.setMin(0L);
                genomicFilterOption.setMax(0L);
                clinSigFilters.add(genomicFilterOption);
            } else if (option.equals("Allele Count")) {
                genomicFilterOption.setOption("");
                genomicFilterOption.setCount(0L);
                genomicFilterOption.setChecked(false);
                genomicFilterOption.setMin(minCount);
                genomicFilterOption.setMax(maxCount);
                alleleCountFilter = genomicFilterOption;
            } else if (option.equals("Allele Number")) {
                genomicFilterOption.setOption("");
                genomicFilterOption.setCount(0L);
                genomicFilterOption.setChecked(false);
                genomicFilterOption.setMin(minCount);
                genomicFilterOption.setMax(maxCount);
                alleleNumberFilter = genomicFilterOption;
            }
        }
        GenomicFilterOption alleleFrequencyFilter = new GenomicFilterOption();
        alleleFrequencyFilter.setOption("");
        alleleFrequencyFilter.setCount(0L);
        alleleFrequencyFilter.setChecked(false);
        alleleFrequencyFilter.setMin(0L);
        alleleFrequencyFilter.setMax(1L);

        geneFilterList.setItems(geneFilters);
        geneFilterList.setFilterActive(false);
        conseqFilterList.setItems(conseqFilters);
        conseqFilterList.setFilterActive(false);
        clinSigFilterList.setItems(clinSigFilters);
        clinSigFilterList.setFilterActive(false);

        genomicFilters.gene(geneFilterList);
        genomicFilters.consequence(conseqFilterList);
        genomicFilters.clinicalSignificance(clinSigFilterList);
        genomicFilters.alleleCount(alleleCountFilter);
        genomicFilters.alleleNumber(alleleNumberFilter);
        genomicFilters.alleleFrequency(alleleFrequencyFilter);

        return ResponseEntity.ok(genomicFilters);
    }

    @Override
    public ResponseEntity<AnalysisListResponse> getChartData() {
        try {
            cdrVersionService.setDefaultCdrVersion();
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }
        ImmutableList<Long> analysisIds = ImmutableList.of(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.GENO_GENDER_ANALYSIS),
                CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.GENO_AGE_ANALYSIS),
                CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.GENO_RACE_ANALYSIS),
                CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.COUNT_ANALYSIS_ID));
        AnalysisListResponse analysisListResponse = new AnalysisListResponse();
        analysisListResponse.setItems(achillesAnalysisService.findAnalysisByIdsAndDomain(analysisIds, "Genomics"));
        return ResponseEntity.ok(analysisListResponse);
    }

    @Override
    public ResponseEntity<VariantInfo> getVariantDetails(String variant_id) {
        try {
            cdrVersionService.setDefaultCdrVersion();
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }
        String finalSql = VARIANT_DETAIL_SQL_TEMPLATE + WHERE_VARIANT_ID;
        QueryJobConfiguration qjc = QueryJobConfiguration.newBuilder(finalSql)
                .addNamedParameter("variant_id", QueryParameterValue.string(variant_id))
                .setUseLegacySql(false)
                .build();
        qjc = bigQueryService.filterBigQueryConfig(qjc);
        TableResult result = bigQueryService.executeQuery(qjc);
        Map<String, Integer> rm = bigQueryService.getResultMapper(result);
        List<FieldValue> row = result.iterateAll().iterator().next();
        VariantInfo variantInfo = new VariantInfo()
                .variantId(variant_id)
                .dnaChange(bigQueryService.getString(row, rm.get("dna_change")))
                .transcript(bigQueryService.getString(row, rm.get("transcript")))
                .rsNumber(bigQueryService.getString(row, rm.get("rs_number")))
                .afrAlleleCount(bigQueryService.getLong(row, rm.get("afr_allele_count")))
                .afrAlleleNumber(bigQueryService.getLong(row, rm.get("afr_allele_number")))
                .afrAlleleFrequency(bigQueryService.getDouble(row, rm.get("afr_allele_frequency")))
                .easAlleleCount(bigQueryService.getLong(row, rm.get("eas_allele_count")))
                .easAlleleNumber(bigQueryService.getLong(row, rm.get("eas_allele_number")))
                .easAlleleFrequency(bigQueryService.getDouble(row, rm.get("eas_allele_frequency")))
                .eurAlleleCount(bigQueryService.getLong(row, rm.get("eur_allele_count")))
                .eurAlleleNumber(bigQueryService.getLong(row, rm.get("eur_allele_number")))
                .eurAlleleFrequency(bigQueryService.getDouble(row, rm.get("eur_allele_frequency")))
                .amrAlleleCount(bigQueryService.getLong(row, rm.get("amr_allele_count")))
                .amrAlleleNumber(bigQueryService.getLong(row, rm.get("amr_allele_number")))
                .amrAlleleFrequency(bigQueryService.getDouble(row, rm.get("amr_allele_frequency")))
                .midAlleleCount(bigQueryService.getLong(row, rm.get("mid_allele_count")))
                .midAlleleNumber(bigQueryService.getLong(row, rm.get("mid_allele_number")))
                .midAlleleFrequency(bigQueryService.getDouble(row, rm.get("mid_allele_frequency")))
                .sasAlleleCount(bigQueryService.getLong(row, rm.get("sas_allele_count")))
                .sasAlleleNumber(bigQueryService.getLong(row, rm.get("sas_allele_number")))
                .sasAlleleFrequency(bigQueryService.getDouble(row, rm.get("sas_allele_frequency")))
                .othAlleleCount(bigQueryService.getLong(row, rm.get("oth_allele_count")))
                .othAlleleNumber(bigQueryService.getLong(row, rm.get("oth_allele_number")))
                .othAlleleFrequency(bigQueryService.getDouble(row, rm.get("oth_allele_frequency")))
                .totalAlleleCount(bigQueryService.getLong(row, rm.get("total_allele_count")))
                .totalAlleleNumber(bigQueryService.getLong(row, rm.get("total_allele_number")))
                .totalAlleleFrequency(bigQueryService.getDouble(row, rm.get("total_allele_frequency")));
        return ResponseEntity.ok(variantInfo);
    }
}