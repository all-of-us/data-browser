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
import org.pmiops.workbench.model.SVVariant;
import org.pmiops.workbench.model.VariantInfo;
import org.pmiops.workbench.model.SVVariantInfo;
import org.pmiops.workbench.model.GenomicFilters;
import org.pmiops.workbench.model.GenomicFilterOption;
import org.pmiops.workbench.model.GenomicFilterOptionList;
import org.pmiops.workbench.model.SVGenomicFilters;
import org.pmiops.workbench.model.SVGenomicFilterOption;
import org.pmiops.workbench.model.SVGenomicFilterOptionList;
import org.pmiops.workbench.model.GenomicSearchTermType;
import org.pmiops.workbench.model.SVGenomicSearchTermType;
import org.pmiops.workbench.model.VariantListResponse;
import org.pmiops.workbench.model.SVVariantListResponse;
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
import org.pmiops.workbench.model.SearchSVVariantsRequest;
import org.pmiops.workbench.model.VariantResultSizeRequest;
import org.pmiops.workbench.model.SVVariantResultSizeRequest;
import org.pmiops.workbench.model.SortMetadata;
import org.pmiops.workbench.model.SortSVMetadata;
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
    private static final String svVariantIdRegexV7 = "(?i)AoUSVPhase[a-zA-Z0-9]{1,2}\\.chr[1-9XY][0-9]?(?:\\.final_cleanup_)?(BND|DUP|DEL)_chr[1-9XY][0-9]?_\\d+";
    private static final String svVariantIdRegexV8 = "(?i)AoUSVPhase[a-zA-Z0-9]{1,2}\\.(BND|DUP|DEL)_chr[1-9XY][0-9]?_shard[0-9][0-9]?_\\d+";

    private static final String svVariantIdRegexRandom = "(?i)(\\d{1,2}|X|Y)-\\d{1,10}-[0-9a-fA-F]{4}";

    private static final String rsNumberRegex = "(?i)(rs)(\\d{1,})";
    private static final String COUNT_SQL_TEMPLATE = "SELECT count(*) as count FROM ${projectId}.${dataSetId}.wgs_variant";

    private static final String SV_COUNT_SQL_TEMPLATE = "SELECT count(*) as count FROM ${projectId}.${dataSetId}.selected_sv_fields_db_with_id";

    private static final String WHERE_CONTIG = " where REGEXP_CONTAINS(contig, @contig)";

    private static final String WHERE_CHROM = " where REGEXP_CONTAINS(chrom, @contig)";
    private static final String AND_POSITION = " and position <= @high and position >= @low \n";

    private static final String AND_POS = " and pos <= @high and pos >= @low";

    private static final String WHERE_VARIANT_ID = " where variant_id = @variant_id";

    // private static final String WHERE_GENE = ", unnest(split(genes, ', ')) AS gene\n" +
    //         " where REGEXP_CONTAINS(gene, @genes)";
    private static final String WHERE_RS_NUMBER_CONTAINS = ", unnest(rs_number) AS rsid\n" +
            " where REGEXP_CONTAINS(rsid, @rs_id)";
    private static final String WHERE_RS_NUMBER_EXACT = " where @rs_id in unnest(rs_number)";
    private static final String WHERE_GENE_REGEX = " where REGEXP_CONTAINS(genes, @genes)";
    // private static final String WHERE_GENE_EXACT = " where @genes in unnest(split(lower(genes), ', '))";
    private static final String VARIANT_LIST_SQL_TEMPLATE = "SELECT variant_id, genes, (SELECT STRING_AGG(distinct d, \", \" order by d asc) FROM UNNEST(consequence) d) as cons_agg_str, " +
            "variant_type, protein_change, (SELECT STRING_AGG(distinct d, \", \" order by d asc) FROM UNNEST(clinical_significance) d) as clin_sig_agg_str, allele_count, allele_number, allele_frequency, homozygote_count FROM ${projectId}.${dataSetId}.wgs_variant";

    private static final String SV_VARIANT_LIST_SQL_TEMPLATE = "SELECT variant_id, variant_type, consequence, position, a.size, \n" +
            "a.allele_count, a.allele_number, a.allele_frequency, a.homozygote_count FROM ${projectId}.${dataSetId}.selected_sv_fields_db_with_id a";
    private static final String VARIANT_DETAIL_SQL_TEMPLATE = "SELECT dna_change, transcript, ARRAY_TO_STRING(rs_number, ', ') as rs_number, gvs_afr_ac as afr_allele_count, gvs_afr_an as afr_allele_number, gvs_afr_af as afr_allele_frequency, gvs_afr_hc as afr_homozygote_count, gvs_eas_ac as eas_allele_count, gvs_eas_an as eas_allele_number, gvs_eas_af as eas_allele_frequency, gvs_eas_hc as eas_homozygote_count, " +
            "gvs_eur_ac as eur_allele_count, gvs_eur_an as eur_allele_number, gvs_eur_af as eur_allele_frequency, gvs_eur_hc as eur_homozygote_count, " +
            "gvs_amr_ac as amr_allele_count, gvs_amr_an as amr_allele_number, gvs_amr_af as amr_allele_frequency, gvs_amr_hc as amr_homozygote_count, " +
            "gvs_mid_ac as mid_allele_count, gvs_mid_an as mid_allele_number, gvs_mid_af as mid_allele_frequency, gvs_mid_hc as mid_homozygote_count, " +
            "gvs_sas_ac as sas_allele_count, gvs_sas_an as sas_allele_number, gvs_sas_af as sas_allele_frequency, gvs_sas_hc as sas_homozygote_count, " +
            "gvs_oth_ac as oth_allele_count, gvs_oth_an as oth_allele_number, gvs_oth_af as oth_allele_frequency, gvs_oth_hc as oth_homozygote_count, " +
            "gvs_all_ac as total_allele_count, gvs_all_an as total_allele_number, gvs_all_af as total_allele_frequency, homozygote_count as total_homozygote_count from ${projectId}.${dataSetId}.wgs_variant";

    private static final String SV_VARIANT_DETAIL_SQL_TEMPLATE = "SELECT variant_type, consequence_genes, position, size, variant_id_vcf, \n" +
            "cpx_intervals as cpx_intervals, cpx_type as cpx_type, a.filter as filter, \n" +
            "afr_ac as afr_allele_count, afr_an as afr_allele_number, afr_af as afr_allele_frequency, afr_n_homalt as afr_homozygote_count, \n" +
            "eas_ac as eas_allele_count, eas_an as eas_allele_number, eas_af as eas_allele_frequency, eas_n_homalt as eas_homozygote_count, \n" +
            "eur_ac as eur_allele_count, eur_an as eur_allele_number, eur_af as eur_allele_frequency, eur_n_homalt as eur_homozygote_count, \n" +
            "amr_ac as amr_allele_count, amr_an as amr_allele_number, amr_af as amr_allele_frequency, amr_n_homalt as amr_homozygote_count, \n" +
            "mid_ac as mid_allele_count, mid_an as mid_allele_number, mid_af as mid_allele_frequency, mid_n_homalt as mid_homozygote_count, \n" +
            "sas_ac as sas_allele_count, sas_an as sas_allele_number, sas_af as sas_allele_frequency, sas_n_homalt as sas_homozygote_count, \n" +
            "oth_ac as oth_allele_count, oth_an as oth_allele_number, oth_af as oth_allele_frequency, oth_n_homalt as oth_homozygote_count, \n" +
            "allele_count as total_allele_count, allele_number as total_allele_number, allele_frequency as total_allele_frequency, homozygote_count as total_homozygote_count from ${projectId}.${dataSetId}.selected_sv_fields_db_with_id a \n";

    private static final String FILTER_OPTION_SQL_TEMPLATE_GENE = "with a as\n" +
            "(select 'Gene' as option, genes as genes, '' as conseq, '' as variant_type, '' as clin_significance, count(*) as gene_count, " +
            "0 as con_count, 0 as variant_type_count, " +
            "0 as clin_count, 0 as min_count, 0 as max_count\n" +
            "from ${projectId}.${dataSetId}.wgs_variant tj, \n" +
            " unnest(split(genes, ', ')) gene\n";
    private static final String FILTER_OPTION_SQL_TEMPLATE_CON = " group by genes),\n" +
            "b as\n" +
            "(select 'Consequence' as option, '' as genes, conseq, '' as variant_type, '' as clin_significance, 0 as gene_count, count(*) as con_count, 0 as variant_type_count, 0 as clin_count, 0 as min_count, 0 as max_count\n" +
            "from ${projectId}.${dataSetId}.wgs_variant left join unnest(consequence) AS conseq\n";

    private static final String FILTER_OPTION_SQL_TEMPLATE_VAR_TYPE = " group by conseq),\n" +
            "c as\n" +
            "(select 'Variant Type' as option, '' as genes, '' as conseq, variant_type as variant_type, '' as clin_significance, 0 as gene_count, 0 as con_count, count(*) as variant_type_count, 0 as clin_count, 0 as min_count, 0 as max_count\n" +
            "from ${projectId}.${dataSetId}.wgs_variant\n";
    private static final String FILTER_OPTION_SQL_TEMPLATE_CLIN = " group by variant_type),\n" +
            "d as\n" +
            "(select 'Clinical Significance' as option, '' as genes, '' as consequence, '' as variant_type, clin as clin_significance, \n" +
            "0 as gene_count, 0 as con_count, 0 as variant_type_count, count(*) as clin_count, 0 as min_count, 0 as max_count\n" +
            "from ${projectId}.${dataSetId}.wgs_variant left join unnest(clinical_significance) AS clin\n";
    private static final String FILTER_OPTION_SQL_TEMPLATE_ALLELE_COUNT = " group by clin),\n" +
            "e as \n" +
            "(select 'Allele Count' as option, '' as genes, '' as consequence, '' as variant_type, '' as clin_significance, \n" +
            "0 as gene_count, 0 as con_count, 0 as variant_type_count, 0 as clin_count,\n" +
            "min(allele_count) as min_count, max(allele_count) as max_count\n" +
            "from ${projectId}.${dataSetId}.wgs_variant\n";
    private static final String FILTER_OPTION_SQL_TEMPLATE_ALLELE_NUMBER = "),\n" +
            "f as \n" +
            "(select 'Allele Number' as option, '' as genes, '' as consequence, '' as variant_type, '' as clin_significance, \n" +
            "0 as gene_count, 0 as con_count, 0 as variant_type_count, 0 as clin_count,\n" +
            "min(allele_number) as min_count, max(allele_number) as max_count\n" +
            "from ${projectId}.${dataSetId}.wgs_variant\n";

    private static final String FILTER_OPTION_SQL_TEMPLATE_HOMOZYGOTE_COUNT = "),\n" +
            "g as \n" +
            "(select 'Homozygote Count' as option, '' as genes, '' as consequence, '' as variant_type, '' as clin_significance, \n" +
            "0 as gene_count, 0 as con_count, 0 as variant_type_count, 0 as clin_count,\n" +
            "min(homozygote_count) as min_count, max(homozygote_count) as max_count\n" +
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
            "select * from e \n" +
            "union all \n" +
            "select * from f \n" +
            "union all \n" +
            "select * from g;";

    private static final String SV_FILTER_OPTION_SQL_TEMPLATE_GENE = "with a as\n" +
            "(select distinct 'Gene' as option, genes as genes, '' as variant_type, '' as consequence, \n" +
            "0 as min_count, 0 as max_count\n" +
            "from ${projectId}.${dataSetId}.selected_sv_fields_db_with_id tj, \n" +
            " unnest(split(genes, ', ')) gene\n";

    private static final String SV_FILTER_OPTION_SQL_TEMPLATE_VAR_TYPE = " group by genes),\n" +
            "b as \n" +
            "(select distinct 'Variant Type' as option, '' as genes, variant_type as variant_type, '' as consequence, 0 as min_count, 0 as max_count\n" +
            "from ${projectId}.${dataSetId}.selected_sv_fields_db_with_id\n";

    private static final String SV_FILTER_OPTION_SQL_TEMPLATE_CON = " group by variant_type), \n" +
            "c as\n" +
            "(select distinct 'Consequence' as option, '' as genes, '' as variant_type, con as consequence,\n" +
            "0 as min_count, 0 as max_count\n" +
            "from ${projectId}.${dataSetId}.selected_sv_fields_db_with_id tj, \n" +
            " unnest(split(consequence, ', ')) con\n";

    private static final String SV_FILTER_OPTION_SQL_TEMPLATE_SIZE = " group by con),\n" +
            "e as \n" +
            "(select distinct 'Size' as option, '' as genes, '' as variant_type, '' as consequence, \n" +
            "min(size) as min_count, max(size) as max_count\n" +
            "from ${projectId}.${dataSetId}.selected_sv_fields_db_with_id\n";
    private static final String SV_FILTER_OPTION_SQL_TEMPLATE_ALLELE_COUNT = "),\n" +
            "f as \n" +
            "(select distinct 'Allele Count' as option, '' as genes, '' as variant_type, '' as consequence, \n" +
            "min(allele_count) as min_count, max(allele_count) as max_count\n" +
            "from ${projectId}.${dataSetId}.selected_sv_fields_db_with_id\n";


    private static final String SV_FILTER_OPTION_SQL_TEMPLATE_ALLELE_NUMBER = "),\n" +
            "g as \n" +
            "(select distinct 'Allele Number' as option, '' as genes, '' as variant_type, '' as consequence, \n" +
            "min(allele_number) as min_count, max(allele_number) as max_count\n" +
            "from ${projectId}.${dataSetId}.selected_sv_fields_db_with_id\n";

    private static final String SV_FILTER_OPTION_SQL_TEMPLATE_HOMOZYGOTE_COUNT = "),\n" +
            "h as \n" +
            "(select distinct 'Homozygote Count' as option, '' as genes, '' as variant_type, '' as consequence, \n" +
            "min(homozygote_count) as min_count, max(homozygote_count) as max_count\n" +
            "from ${projectId}.${dataSetId}.selected_sv_fields_db_with_id\n";
    private static final String SV_FILTER_OPTION_SQL_TEMPLATE_UNION = ")\n" +
            "select * from a \n" +
            "union all \n" +
            "select * from b \n" +
            "union all \n" +
            "select * from c \n" +
            "union all \n" +
            "select * from e \n" +
            "union all \n" +
            "select * from f \n" +
            "union all \n" +
            "select * from g \n" +
            "union all \n" +
            "select * from h;";

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
            GenomicSearchTermType searchTermType = getSearchType(variantSearchTerm, searchTerm);
            finalSql += searchTermType.getSearchSqlQuery();
            genes = searchTermType.getGenes();
            low = searchTermType.getLow();
            high = searchTermType.getHigh();
            contig = "(?i)\\b" + searchTermType.getContig() + "\\b";
            variant_id = searchTermType.getVariantId();
            rs_id = searchTermType.getRsId();
            whereGeneFlag = searchTermType.isWhereGeneFlag();
        }

        String WHERE_GENE_IN = " AND genes in (";
        String WHERE_CON_IN = " AND (EXISTS (SELECT con FROM UNNEST (consequence) as con where con in ( \n";
        String WHERE_CON_NULL = "";
        String WHERE_SV_CON_IN = " AND (EXISTS (SELECT con FROM UNNEST (split(consequence, ', ')) as con where con in ( \n";
        String WHERE_CLIN_IN = " AND (EXISTS (SELECT clin FROM UNNEST (clinical_significance) as clin where clin in (";
        String WHERE_CLIN_NULL = "";
        String WHERE_VAR_TYPE_IN = "AND variant_type in (";
        String ALLELE_COUNT_FILTER = "";
        String ALLELE_NUMBER_FILTER = "";
        String ALLELE_FREQUENCY_FILTER = "";
        String HOMOZYGOTE_COUNT_FILTER = "";
        boolean geneFilterFlag = false;
        boolean conFilterFlag = false;
        boolean varTypeFilterFlag = false;
        boolean clinFilterFlag = false;
        if (filters != null) {
            GenomicFilterOptionList geneFilterList = filters.getGene();
            List<GenomicFilterOption> geneFilters = geneFilterList.getItems();
            if (geneFilters != null && geneFilters.size() > 0 && geneFilterList.isFilterActive()) {
                for(int i=0; i < geneFilters.size(); i++) {
                    GenomicFilterOption filter = geneFilters.get(i);
                    if (filter.isChecked() && !Strings.isNullOrEmpty(filter.getOption())) {
                        WHERE_GENE_IN += "\"" + filter.getOption().toUpperCase() + "\",";
                    }
                }
            }
            GenomicFilterOptionList conFilterList = filters.getConsequence();
            List<GenomicFilterOption> conFilters = conFilterList.getItems();
            if (conFilters != null && conFilters.size() > 0 && conFilterList.isFilterActive()) {
                for(int i=0; i < conFilters.size(); i++) {
                    GenomicFilterOption filter = conFilters.get(i);
                    if (filter.isChecked()) {
                        if (!Strings.isNullOrEmpty(filter.getOption())) {
                            WHERE_CON_IN += "\"" + filter.getOption() + "\",";
                        } else {
                            WHERE_CON_NULL = " OR ARRAY_LENGTH(consequence) = 0";
                        }
                    }
                }
            }
            GenomicFilterOptionList varTypeFilterList = filters.getVariantType();
            List<GenomicFilterOption> varTypeFilters = varTypeFilterList.getItems();
            if (varTypeFilters != null && varTypeFilters.size() > 0 && varTypeFilterList.isFilterActive()) {
                for(int i=0; i < varTypeFilters.size(); i++) {
                    GenomicFilterOption filter = varTypeFilters.get(i);
                    if (filter.isChecked()) {
                        if (!Strings.isNullOrEmpty(filter.getOption())) {
                            WHERE_VAR_TYPE_IN += "\"" + filter.getOption() + "\",";
                        }
                    }
                }
            }
            GenomicFilterOptionList clinFilterList = filters.getClinicalSignificance();
            List<GenomicFilterOption> clinFilters = clinFilterList.getItems();
            if (clinFilters != null && clinFilters.size() > 0 && clinFilterList.isFilterActive()) {
                for(int i=0; i < clinFilters.size(); i++) {
                    GenomicFilterOption filter = clinFilters.get(i);
                    if (filter.isChecked()) {
                        if (!Strings.isNullOrEmpty(filter.getOption())) {
                            WHERE_CLIN_IN += "\"" + filter.getOption() + "\",";
                        } else {
                            WHERE_CLIN_NULL = " OR ARRAY_LENGTH(clinical_significance) = 0";
                        }
                    }
                }
            }
            GenomicFilterOption acFilter = filters.getAlleleCount();
            if (acFilter != null && acFilter.isChecked()) {
                Long minVal = acFilter.getMin();
                Long maxVal = acFilter.getMax();
                ALLELE_COUNT_FILTER = " AND allele_count BETWEEN " + minVal + " AND " + maxVal;
            }
            GenomicFilterOption anFilter = filters.getAlleleNumber();
            if (anFilter != null && anFilter.isChecked()) {
                Long minVal = anFilter.getMin();
                Long maxVal = anFilter.getMax();
                ALLELE_NUMBER_FILTER = " AND allele_number BETWEEN " + minVal + " AND " + maxVal;
            }
            GenomicFilterOption afFilter = filters.getAlleleFrequency();
            if (afFilter != null && afFilter.isChecked()) {
                Float minVal = afFilter.getMinFreq();
                Float maxVal = afFilter.getMaxFreq();
                ALLELE_FREQUENCY_FILTER = " AND allele_frequency BETWEEN " + minVal + " AND " + maxVal;
            }
            GenomicFilterOption hcFilter = filters.getHomozygoteCount();
            if (hcFilter != null && hcFilter.isChecked()) {
                Long minVal = hcFilter.getMin();
                Long maxVal = hcFilter.getMax();
                HOMOZYGOTE_COUNT_FILTER = " AND homozygote_count BETWEEN " + minVal + " AND " + maxVal;
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
        if (WHERE_VAR_TYPE_IN.substring(WHERE_VAR_TYPE_IN.length() - 1).equals(",")) {
            varTypeFilterFlag = true;
            WHERE_VAR_TYPE_IN = WHERE_VAR_TYPE_IN.substring(0, WHERE_VAR_TYPE_IN.length()-1);
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
        if (varTypeFilterFlag) {
            finalSql += WHERE_VAR_TYPE_IN;
            finalSql += ") ";
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
        if (HOMOZYGOTE_COUNT_FILTER.length() > 0) {
            finalSql += HOMOZYGOTE_COUNT_FILTER;
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
        List<FieldValue> row = result.iterateAll().iterator().next();
        return ResponseEntity.ok(bigQueryService.getLong(row, rm.get("count")));
    }

    @Override
    public ResponseEntity<Long> getSVVariantSearchResultSize(SVVariantResultSizeRequest variantResultSizeRequest) {
        try {
            cdrVersionService.setDefaultCdrVersion();
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }

        String finalSql = SV_COUNT_SQL_TEMPLATE;

        String variant_id = "";
        String genes = "";
        Long low = 0L;
        Long high = 0L;
        boolean whereGeneFlag = false;

        String variantSearchTerm = variantResultSizeRequest.getQuery().trim();
        SVGenomicFilters filters = variantResultSizeRequest.getFilterMetadata();
        String searchTerm = variantSearchTerm;

        if (variantSearchTerm.startsWith("~")) {
            searchTerm = variantSearchTerm.substring(1);
        }

        String contig = "(?i)(" + searchTerm + ")$";
        // Make sure the search term is not empty
        if (!Strings.isNullOrEmpty(searchTerm)) {
            SVGenomicSearchTermType searchTermType = getSVSearchType(variantSearchTerm, searchTerm);
            finalSql += searchTermType.getSearchSqlQuery();
            genes = searchTermType.getGenes();
            low = searchTermType.getLow();
            high = searchTermType.getHigh();
            contig = "(?i)\\b" + searchTermType.getContig() + "\\b";
            variant_id = searchTermType.getVariantId();
            whereGeneFlag = searchTermType.isWhereGeneFlag();
        }

        String WHERE_GENE_IN = " AND genes in (";
        String WHERE_VAR_TYPE_IN = "AND variant_type in (";
        String WHERE_CON_NULL = "";
        String WHERE_SV_CON_IN = " AND (EXISTS (SELECT con FROM UNNEST (split(consequence, ', ')) as con where con in ( \n";
        String SIZE_FILTER = "";
        String ALLELE_COUNT_FILTER = "";
        String ALLELE_NUMBER_FILTER = "";
        String ALLELE_FREQUENCY_FILTER = "";
        String HOMOZYGOTE_COUNT_FILTER = "";
        boolean geneFilterFlag = false;
        boolean varTypeFilterFlag = false;
        boolean conFilterFlag = false;
        if (filters != null) {
            SVGenomicFilterOptionList geneFilterList = filters.getGene();
            List<SVGenomicFilterOption> geneFilters = geneFilterList.getItems();
            if (geneFilters != null && geneFilters.size() > 0 && geneFilterList.isFilterActive()) {
                for(int i=0; i < geneFilters.size(); i++) {
                    SVGenomicFilterOption filter = geneFilters.get(i);
                    if (filter.isChecked() && !Strings.isNullOrEmpty(filter.getOption())) {
                        WHERE_GENE_IN += "\"" + filter.getOption().toUpperCase() + "\",";
                    }
                }
            }
            SVGenomicFilterOptionList conFilterList = filters.getConsequence();
            List<SVGenomicFilterOption> conFilters = conFilterList.getItems();
            if (conFilters != null && conFilters.size() > 0 && conFilterList.isFilterActive()) {
                for(int i=0; i < conFilters.size(); i++) {
                    SVGenomicFilterOption filter = conFilters.get(i);
                    if (filter.isChecked()) {
                        if (!Strings.isNullOrEmpty(filter.getOption())) {
                            WHERE_SV_CON_IN += "\"" + filter.getOption() + "\",";
                        } else {
                            WHERE_CON_NULL = " OR ARRAY_LENGTH(consequence) = 0";
                        }
                    }
                }
            }
            SVGenomicFilterOptionList varTypeFilterList = filters.getVariantType();
            List<SVGenomicFilterOption> varTypeFilters = varTypeFilterList.getItems();
            if (varTypeFilters != null && varTypeFilters.size() > 0 && varTypeFilterList.isFilterActive()) {
                for(int i=0; i < varTypeFilters.size(); i++) {
                    SVGenomicFilterOption filter = varTypeFilters.get(i);
                    if (filter.isChecked()) {
                        if (!Strings.isNullOrEmpty(filter.getOption())) {
                            WHERE_VAR_TYPE_IN += "\"" + filter.getOption() + "\",";
                        }
                    }
                }
            }
            SVGenomicFilterOption sizeFilter = filters.getSize();
            if (sizeFilter != null && sizeFilter.isChecked()) {
                Long minVal = sizeFilter.getMin();
                Long maxVal = sizeFilter.getMax();
                SIZE_FILTER = " AND size BETWEEN " + minVal + " AND " + maxVal;
            }
            SVGenomicFilterOption acFilter = filters.getAlleleCount();
            if (acFilter != null && acFilter.isChecked()) {
                Long minVal = acFilter.getMin();
                Long maxVal = acFilter.getMax();
                ALLELE_COUNT_FILTER = " AND allele_count BETWEEN " + minVal + " AND " + maxVal;
            }
            SVGenomicFilterOption anFilter = filters.getAlleleNumber();
            if (anFilter != null && anFilter.isChecked()) {
                Long minVal = anFilter.getMin();
                Long maxVal = anFilter.getMax();
                ALLELE_NUMBER_FILTER = " AND allele_number BETWEEN " + minVal + " AND " + maxVal;
            }
            SVGenomicFilterOption afFilter = filters.getAlleleFrequency();
            if (afFilter != null && afFilter.isChecked()) {
                Float minVal = afFilter.getMinFreq();
                Float maxVal = afFilter.getMaxFreq();
                ALLELE_FREQUENCY_FILTER = " AND allele_frequency BETWEEN " + minVal + " AND " + maxVal;
            }
            SVGenomicFilterOption hcFilter = filters.getHomozygoteCount();
            if (hcFilter != null && hcFilter.isChecked()) {
                Long minVal = hcFilter.getMin();
                Long maxVal = hcFilter.getMax();
                HOMOZYGOTE_COUNT_FILTER = " AND homozygote_count BETWEEN " + minVal + " AND " + maxVal;
            }
        }
        if (WHERE_GENE_IN.substring(WHERE_GENE_IN.length() - 1).equals(",")) {
            geneFilterFlag = true;
            WHERE_GENE_IN = WHERE_GENE_IN.substring(0, WHERE_GENE_IN.length()-1);
            WHERE_GENE_IN += ") ";
        }
        if (WHERE_SV_CON_IN.substring(WHERE_SV_CON_IN.length() - 1).equals(",")) {
            conFilterFlag = true;
            WHERE_SV_CON_IN = WHERE_SV_CON_IN.substring(0, WHERE_SV_CON_IN.length()-1);
            WHERE_SV_CON_IN += ")) ";
        }

        if (WHERE_VAR_TYPE_IN.substring(WHERE_VAR_TYPE_IN.length() - 1).equals(",")) {
            varTypeFilterFlag = true;
            WHERE_VAR_TYPE_IN = WHERE_VAR_TYPE_IN.substring(0, WHERE_VAR_TYPE_IN.length()-1);
        }

        if (geneFilterFlag) {
            if (whereGeneFlag) {
                finalSql = finalSql.replace(WHERE_GENE_REGEX, "");
                WHERE_GENE_IN = " WHERE" + WHERE_GENE_IN.substring(4);
            }
            finalSql += WHERE_GENE_IN;
        }

        if (conFilterFlag) {
            finalSql += WHERE_SV_CON_IN;
            if (WHERE_CON_NULL.length() > 0) {
                finalSql += WHERE_CON_NULL;
            }
            finalSql += ") ";
        } else {
            if (WHERE_CON_NULL.length() > 0) {
                finalSql += " AND ARRAY_LENGTH(consequence) = 0";
            }
        }

        if (varTypeFilterFlag) {
            finalSql += WHERE_VAR_TYPE_IN;
            finalSql += ") ";
        }

        if (SIZE_FILTER.length() > 0) {
            finalSql += SIZE_FILTER;
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
        if (HOMOZYGOTE_COUNT_FILTER.length() > 0) {
            finalSql += HOMOZYGOTE_COUNT_FILTER;
        }

        QueryJobConfiguration qjc = QueryJobConfiguration.newBuilder(finalSql)
                .addNamedParameter("contig", QueryParameterValue.string(contig))
                .addNamedParameter("high", QueryParameterValue.int64(high))
                .addNamedParameter("low", QueryParameterValue.int64(low))
                .addNamedParameter("variant_id", QueryParameterValue.string(variant_id))
                .addNamedParameter("genes", QueryParameterValue.string(genes))
                .setUseLegacySql(false)
                .build();

        qjc = bigQueryService.filterBigQueryConfig(qjc);
        TableResult result = bigQueryService.executeQuery(qjc);
        Map<String, Integer> rm = bigQueryService.getResultMapper(result);
        List<FieldValue> row = result.iterateAll().iterator().next();

        return ResponseEntity.ok(bigQueryService.getLong(row, rm.get("count")));
    }


    @Override
    public ResponseEntity<SVVariantListResponse> searchSVVariants(SearchSVVariantsRequest searchVariantsRequest) {
        try {
            cdrVersionService.setDefaultCdrVersion();
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }

        String variantSearchTerm = searchVariantsRequest.getQuery().trim();
        Integer page = searchVariantsRequest.getPageNumber();
        Integer rowCount = searchVariantsRequest.getRowCount();
        SortSVMetadata sortMetadata = searchVariantsRequest.getSortMetadata();

        SVGenomicFilters filters = searchVariantsRequest.getFilterMetadata();

        String ORDER_BY_CLAUSE = " ORDER BY variant_id ASC";
        if (sortMetadata != null) {
            SortColumnDetails variantIdColumnSortMetadata = sortMetadata.getVariantId();
            if (variantIdColumnSortMetadata != null && variantIdColumnSortMetadata.isSortActive()) {
                if (variantIdColumnSortMetadata.getSortDirection().equals("desc")) {
                    ORDER_BY_CLAUSE = " ORDER BY variant_id DESC";
                } else {
                    ORDER_BY_CLAUSE = " ORDER BY variant_id ASC";
                }
            }

            SortColumnDetails variantTypeColumnSortMetadata = sortMetadata.getVariantType();
            if (variantTypeColumnSortMetadata != null && variantTypeColumnSortMetadata.isSortActive()) {
                if (variantTypeColumnSortMetadata.getSortDirection().equals("desc")) {
                    ORDER_BY_CLAUSE = " ORDER BY variant_type DESC";
                } else {
                    ORDER_BY_CLAUSE = " ORDER BY variant_type ASC";
                }
            }

            SortColumnDetails consequenceColumnSortMetadata = sortMetadata.getConsequence();
            if (consequenceColumnSortMetadata != null && consequenceColumnSortMetadata.isSortActive()) {
                if (consequenceColumnSortMetadata.getSortDirection().equals("desc")) {
                    ORDER_BY_CLAUSE = " ORDER BY consequence DESC";
                } else {
                    ORDER_BY_CLAUSE = " ORDER BY consequence ASC";
                }
            }

            SortColumnDetails positionColumnSortMetadata = sortMetadata.getPosition();
            if (positionColumnSortMetadata != null && positionColumnSortMetadata.isSortActive()) {
                if (positionColumnSortMetadata.getSortDirection().equals("desc")) {
                    ORDER_BY_CLAUSE = " ORDER BY position DESC";
                } else {
                    ORDER_BY_CLAUSE = " ORDER BY position ASC";
                }
            }

            SortColumnDetails sizeColumnSortMetadata = sortMetadata.getSize();
            if (sizeColumnSortMetadata != null && sizeColumnSortMetadata.isSortActive()) {
                if (sizeColumnSortMetadata.getSortDirection().equals("desc")) {
                    ORDER_BY_CLAUSE = " ORDER BY size DESC";
                } else {
                    ORDER_BY_CLAUSE = " ORDER BY size ASC";
                }
            }

            SortColumnDetails alleleCountColumnSortMetadata = sortMetadata.getAlleleCount();
            if (alleleCountColumnSortMetadata != null && alleleCountColumnSortMetadata.isSortActive()) {
                if (alleleCountColumnSortMetadata.getSortDirection().equals("asc")) {
                    ORDER_BY_CLAUSE = " ORDER BY allele_count ASC";
                } else {
                    ORDER_BY_CLAUSE = " ORDER BY allele_count DESC";
                }
            }
            SortColumnDetails alleleNumberColumnSortMetadata = sortMetadata.getAlleleNumber();
            if (alleleNumberColumnSortMetadata != null && alleleNumberColumnSortMetadata.isSortActive()) {
                if (alleleNumberColumnSortMetadata.getSortDirection().equals("asc")) {
                    ORDER_BY_CLAUSE = " ORDER BY allele_number ASC";
                } else {
                    ORDER_BY_CLAUSE = " ORDER BY allele_number DESC";
                }
            }
            SortColumnDetails alleleFrequencyColumnSortMetadata = sortMetadata.getAlleleFrequency();
            if (alleleFrequencyColumnSortMetadata != null && alleleFrequencyColumnSortMetadata.isSortActive()) {
                if (alleleFrequencyColumnSortMetadata.getSortDirection().equals("asc")) {
                    ORDER_BY_CLAUSE = " ORDER BY allele_frequency ASC";
                } else {
                    ORDER_BY_CLAUSE = " ORDER BY allele_frequency DESC";
                }
            }
            SortColumnDetails homozygoteCountColumnSortMetadata = sortMetadata.getHomozygoteCount();
            if (homozygoteCountColumnSortMetadata != null && homozygoteCountColumnSortMetadata.isSortActive()) {
                if (homozygoteCountColumnSortMetadata.getSortDirection().equals("asc")) {
                    ORDER_BY_CLAUSE = " ORDER BY homozygote_count ASC";
                } else {
                    ORDER_BY_CLAUSE = " ORDER BY homozygote_count DESC";
                }
            }

        }
        StringBuilder finalSqlBuilder = new StringBuilder(SV_VARIANT_LIST_SQL_TEMPLATE);
        String searchTerm = variantSearchTerm;
        String variant_id = "";
        String genes = "";
        boolean whereVariantIdFlag = false;
        boolean whereGeneFlag = false;

        Long low = 0L;
        Long high = 0L;

        String finalSql = SV_VARIANT_LIST_SQL_TEMPLATE;

        if (variantSearchTerm.startsWith("~")) {
            searchTerm = variantSearchTerm.substring(1);
        }

        String contig = searchTerm;

        if (!Strings.isNullOrEmpty(searchTerm)) {
            SVGenomicSearchTermType searchTermType = getSVSearchType(variantSearchTerm, searchTerm);
            finalSql += searchTermType.getSearchSqlQuery();
            genes = searchTermType.getGenes();
            variant_id = searchTermType.getVariantId();
            whereGeneFlag = searchTermType.isWhereGeneFlag();
            low = searchTermType.getLow();
            high = searchTermType.getHigh();
            contig = "(?i)\\b" + searchTermType.getContig() + "\\b";
        }

        String WHERE_GENE_IN = " AND genes in (";

        String WHERE_VAR_TYPE_IN = "AND variant_type in (";

        String WHERE_CON_NULL = "";
        String WHERE_SV_CON_IN = " AND (EXISTS (SELECT con FROM UNNEST (split(consequence, ', ')) as con where con in ( \n";

        String SIZE_FILTER = "";
        String ALLELE_COUNT_FILTER = "";
        String ALLELE_NUMBER_FILTER = "";
        String ALLELE_FREQUENCY_FILTER = "";
        String HOMOZYGOTE_COUNT_FILTER = "";
        boolean geneFilterFlag = false;
        boolean conFilterFlag = false;
        boolean varTypeFilterFlag = false;

        if (filters != null) {
            SVGenomicFilterOptionList geneFilterList = filters.getGene();
            List<SVGenomicFilterOption> geneFilters = geneFilterList.getItems();
            if (geneFilters != null && geneFilters.size() > 0 && geneFilterList.isFilterActive()) {
                for(int i=0; i < geneFilters.size(); i++) {
                    SVGenomicFilterOption filter = geneFilters.get(i);
                    if (filter.isChecked() && !Strings.isNullOrEmpty(filter.getOption())) {
                        WHERE_GENE_IN += "\"" + filter.getOption().toUpperCase() + "\",";
                    }
                }
            }


            SVGenomicFilterOptionList varTypeFilterList = filters.getVariantType();
            List<SVGenomicFilterOption> varTypeFilters = varTypeFilterList.getItems();
            if (varTypeFilters != null && varTypeFilters.size() > 0 && varTypeFilterList.isFilterActive()) {
                for(int i=0; i < varTypeFilters.size(); i++) {
                    SVGenomicFilterOption filter = varTypeFilters.get(i);
                    if (filter.isChecked()) {
                        if (!Strings.isNullOrEmpty(filter.getOption())) {
                            WHERE_VAR_TYPE_IN += "\"" + filter.getOption() + "\",";
                        }
                    }
                }
            }

            SVGenomicFilterOptionList conFilterList = filters.getConsequence();
            List<SVGenomicFilterOption> conFilters = conFilterList.getItems();
            if (conFilters != null && conFilters.size() > 0 && conFilterList.isFilterActive()) {
                for(int i=0; i < conFilters.size(); i++) {
                    SVGenomicFilterOption filter = conFilters.get(i);
                    if (filter.isChecked()) {
                        if (!Strings.isNullOrEmpty(filter.getOption())) {
                            WHERE_SV_CON_IN += "\"" + filter.getOption() + "\",";
                        } else {
                            WHERE_CON_NULL = " OR ARRAY_LENGTH(consequence) = 0";
                        }
                    }
                }
            }

            SVGenomicFilterOption sizeFilter = filters.getSize();
            if (sizeFilter != null && sizeFilter.isChecked()) {
                Long minVal = sizeFilter.getMin();
                Long maxVal = sizeFilter.getMax();
                SIZE_FILTER = " AND size BETWEEN " + minVal + " AND " + maxVal;
            }

            SVGenomicFilterOption acFilter = filters.getAlleleCount();
            if (acFilter != null && acFilter.isChecked()) {
                Long minVal = acFilter.getMin();
                Long maxVal = acFilter.getMax();
                ALLELE_COUNT_FILTER = " AND allele_count BETWEEN " + minVal + " AND " + maxVal;
            }
            SVGenomicFilterOption anFilter = filters.getAlleleNumber();
            if (anFilter != null && anFilter.isChecked()) {
                Long minVal = anFilter.getMin();
                Long maxVal = anFilter.getMax();
                ALLELE_NUMBER_FILTER = " AND allele_number BETWEEN " + minVal + " AND " + maxVal;
            }
            SVGenomicFilterOption afFilter = filters.getAlleleFrequency();
            if (afFilter != null && afFilter.isChecked()) {
                Float minVal = afFilter.getMinFreq();
                Float maxVal = afFilter.getMaxFreq();
                ALLELE_FREQUENCY_FILTER = " AND allele_frequency BETWEEN " + minVal + " AND " + maxVal;
            }
            SVGenomicFilterOption hcFilter = filters.getHomozygoteCount();
            if (hcFilter != null && hcFilter.isChecked()) {
                Long minVal = hcFilter.getMin();
                Long maxVal = hcFilter.getMax();
                HOMOZYGOTE_COUNT_FILTER = " AND homozygote_count BETWEEN " + minVal + " AND " + maxVal;
            }
        }
        if (WHERE_GENE_IN.substring(WHERE_GENE_IN.length() - 1).equals(",")) {
            geneFilterFlag = true;
            WHERE_GENE_IN = WHERE_GENE_IN.substring(0, WHERE_GENE_IN.length()-1);
            WHERE_GENE_IN += ") ";
        }

        if (WHERE_VAR_TYPE_IN.substring(WHERE_VAR_TYPE_IN.length() - 1).equals(",")) {
            varTypeFilterFlag = true;
            WHERE_VAR_TYPE_IN = WHERE_VAR_TYPE_IN.substring(0, WHERE_VAR_TYPE_IN.length()-1);
        }

        if (WHERE_SV_CON_IN.substring(WHERE_SV_CON_IN.length() - 1).equals(",")) {
            conFilterFlag = true;
            WHERE_SV_CON_IN = WHERE_SV_CON_IN.substring(0, WHERE_SV_CON_IN.length()-1);
            WHERE_SV_CON_IN += ")) ";
        }

        if (geneFilterFlag) {
            if (whereGeneFlag) {
                finalSql = finalSql.replace(WHERE_GENE_REGEX, "");
                WHERE_GENE_IN = " WHERE" + WHERE_GENE_IN.substring(4);
            }
            finalSql += WHERE_GENE_IN;
        }


        if (varTypeFilterFlag) {
            finalSql += WHERE_VAR_TYPE_IN;
            finalSql += ") ";
        }

        if (conFilterFlag) {
            finalSql += WHERE_SV_CON_IN;
            if (WHERE_CON_NULL.length() > 0) {
                finalSql += WHERE_CON_NULL;
            }
            finalSql += ") ";
        } else {
            if (WHERE_CON_NULL.length() > 0) {
                finalSql += " AND ARRAY_LENGTH(consequence) = 0";
            }
        }

        if (SIZE_FILTER.length() > 0) {
            finalSql += SIZE_FILTER;
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
        if (HOMOZYGOTE_COUNT_FILTER.length() > 0) {
            finalSql += HOMOZYGOTE_COUNT_FILTER;
        }
        finalSql += ORDER_BY_CLAUSE;
        finalSql += " LIMIT " + rowCount + " OFFSET " + ((Optional.ofNullable(page).orElse(1)-1)*rowCount);

        System.out.println("*************************************************************");
        System.out.println(finalSql);
        System.out.println("*************************************************************");

        QueryJobConfiguration qjc = QueryJobConfiguration.newBuilder(finalSql)
                .addNamedParameter("variant_id", QueryParameterValue.string(variant_id))
                .addNamedParameter("genes", QueryParameterValue.string(genes))
                .addNamedParameter("contig", QueryParameterValue.string(contig))
                .addNamedParameter("high", QueryParameterValue.int64(high))
                .addNamedParameter("low", QueryParameterValue.int64(low))
                .setUseLegacySql(false)
                .build();

        qjc = bigQueryService.filterBigQueryConfig(qjc);
        TableResult result = bigQueryService.executeQuery(qjc);
        Map<String, Integer> rm = bigQueryService.getResultMapper(result);
        List<SVVariant> variantList = new ArrayList<>();
        for (List<FieldValue> row : result.iterateAll()) {
            variantList.add(new SVVariant()
                    .variantId(bigQueryService.getString(row, rm.get("variant_id")))
                    .variantType(bigQueryService.getString(row, rm.get("variant_type")))
                    .consequence(bigQueryService.getString(row, rm.get("consequence")))
                    .position(bigQueryService.getString(row, rm.get("position")))
                    .size(bigQueryService.getLong(row, rm.get("size")))
                    .alleleCount(bigQueryService.getLong(row, rm.get("allele_count")))
                    .alleleNumber(bigQueryService.getLong(row, rm.get("allele_number")))
                    .alleleFrequency(bigQueryService.getDouble(row, rm.get("allele_frequency")))
                    .homozygoteCount(bigQueryService.getLong(row, rm.get("homozygote_count")))
            );
        }

        SVVariantListResponse variantListResponse = new SVVariantListResponse();
        variantListResponse.setItems(variantList);
        return ResponseEntity.ok(variantListResponse);
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
            if (variantIdColumnSortMetadata != null && variantIdColumnSortMetadata.isSortActive()) {
                if (variantIdColumnSortMetadata.getSortDirection().equals("desc")) {
                    ORDER_BY_CLAUSE = " ORDER BY variant_id DESC";
                }
            }
            SortColumnDetails geneColumnSortMetadata = sortMetadata.getGene();
            if (geneColumnSortMetadata != null && geneColumnSortMetadata.isSortActive()) {
                if (geneColumnSortMetadata.getSortDirection().equals("asc")) {
                    ORDER_BY_CLAUSE = " ORDER BY genes ASC";
                } else {
                    ORDER_BY_CLAUSE = " ORDER BY genes DESC";
                }
            }
            SortColumnDetails consequenceColumnSortMetadata = sortMetadata.getConsequence();
            if (consequenceColumnSortMetadata != null && consequenceColumnSortMetadata.isSortActive()) {
                if (consequenceColumnSortMetadata.getSortDirection().equals("asc")) {
                    ORDER_BY_CLAUSE = " ORDER BY (SELECT STRING_AGG(distinct d, \", \" order by d asc) FROM UNNEST(consequence) d) ASC";
                } else {
                    ORDER_BY_CLAUSE = " ORDER BY (SELECT STRING_AGG(distinct d, \", \" order by d asc) FROM UNNEST(consequence) d) DESC";
                }
            }
            SortColumnDetails variantTypeColumnSortMetadata = sortMetadata.getVariantType();
            if (variantTypeColumnSortMetadata != null && variantTypeColumnSortMetadata.isSortActive()) {
                if (variantTypeColumnSortMetadata.getSortDirection().equals("asc")) {
                    ORDER_BY_CLAUSE = " ORDER BY lower(variant_type) ASC";
                } else {
                    ORDER_BY_CLAUSE = " ORDER BY lower(variant_type) DESC";
                }
            }
            SortColumnDetails clinSigColumnSortMetadata = sortMetadata.getClinicalSignificance();
            if (clinSigColumnSortMetadata != null && clinSigColumnSortMetadata.isSortActive()) {
                if (clinSigColumnSortMetadata.getSortDirection().equals("asc")) {
                    ORDER_BY_CLAUSE = " ORDER BY (SELECT STRING_AGG(distinct d, \", \" order by d asc) FROM UNNEST(clinical_significance) d) ASC";
                } else {
                    ORDER_BY_CLAUSE = " ORDER BY (SELECT STRING_AGG(distinct d, \", \" order by d asc) FROM UNNEST(clinical_significance) d) DESC";
                }
            }
            SortColumnDetails alleleCountColumnSortMetadata = sortMetadata.getAlleleCount();
            if (alleleCountColumnSortMetadata != null && alleleCountColumnSortMetadata.isSortActive()) {
                if (alleleCountColumnSortMetadata.getSortDirection().equals("asc")) {
                    ORDER_BY_CLAUSE = " ORDER BY allele_count ASC";
                } else {
                    ORDER_BY_CLAUSE = " ORDER BY allele_count DESC";
                }
            }
            SortColumnDetails alleleNumberColumnSortMetadata = sortMetadata.getAlleleNumber();
            if (alleleNumberColumnSortMetadata != null && alleleNumberColumnSortMetadata.isSortActive()) {
                if (alleleNumberColumnSortMetadata.getSortDirection().equals("asc")) {
                    ORDER_BY_CLAUSE = " ORDER BY allele_number ASC";
                } else {
                    ORDER_BY_CLAUSE = " ORDER BY allele_number DESC";
                }
            }
            SortColumnDetails alleleFrequencyColumnSortMetadata = sortMetadata.getAlleleFrequency();
            if (alleleFrequencyColumnSortMetadata != null && alleleFrequencyColumnSortMetadata.isSortActive()) {
                if (alleleFrequencyColumnSortMetadata.getSortDirection().equals("asc")) {
                    ORDER_BY_CLAUSE = " ORDER BY allele_frequency ASC";
                } else {
                    ORDER_BY_CLAUSE = " ORDER BY allele_frequency DESC";
                }
            }
            SortColumnDetails homozygoteCountColumnSortMetadata = sortMetadata.getHomozygoteCount();
            if (homozygoteCountColumnSortMetadata != null && homozygoteCountColumnSortMetadata.isSortActive()) {
                if (homozygoteCountColumnSortMetadata.getSortDirection().equals("asc")) {
                    ORDER_BY_CLAUSE = " ORDER BY homozygote_count ASC";
                } else {
                    ORDER_BY_CLAUSE = " ORDER BY homozygote_count DESC";
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
            GenomicSearchTermType searchTermType = getSearchType(variantSearchTerm, searchTerm);
            finalSql += searchTermType.getSearchSqlQuery();
            genes = searchTermType.getGenes();
            low = searchTermType.getLow();
            high = searchTermType.getHigh();
            contig = "(?i)\\b" + searchTermType.getContig() + "\\b";
            variant_id = searchTermType.getVariantId();
            rs_id = searchTermType.getRsId();
            whereGeneFlag = searchTermType.isWhereGeneFlag();
        }

        String WHERE_GENE_IN = " AND genes in (";
        String WHERE_CON_IN = " AND (EXISTS (SELECT con FROM UNNEST (consequence) as con where con in (";
        String WHERE_CON_NULL = "";
        String WHERE_VAR_TYPE_IN = "AND variant_type in (";
        String WHERE_CLIN_IN = " AND (EXISTS (SELECT clin FROM UNNEST (clinical_significance) as clin where clin in (";
        String WHERE_CLIN_NULL = "";
        String ALLELE_COUNT_FILTER = "";
        String ALLELE_NUMBER_FILTER = "";
        String ALLELE_FREQUENCY_FILTER = "";
        String HOMOZYGOTE_COUNT_FILTER = "";
        boolean geneFilterFlag = false;
        boolean conFilterFlag = false;
        boolean varTypeFilterFlag = false;
        boolean clinFilterFlag = false;
        if (filters != null) {
            GenomicFilterOptionList geneFilterList = filters.getGene();
            List<GenomicFilterOption> geneFilters = geneFilterList.getItems();
            if (geneFilters != null && geneFilters.size() > 0 && geneFilterList.isFilterActive()) {
                for(int i=0; i < geneFilters.size(); i++) {
                    GenomicFilterOption filter = geneFilters.get(i);
                    if (filter.isChecked() && !Strings.isNullOrEmpty(filter.getOption())) {
                        WHERE_GENE_IN += "\"" + filter.getOption().toUpperCase() + "\",";
                    }
                }
            }

            GenomicFilterOptionList conFilterList = filters.getConsequence();
            List<GenomicFilterOption> conFilters = conFilterList.getItems();
            if (conFilters != null && conFilters.size() > 0 && conFilterList.isFilterActive()) {
                for(int i=0; i < conFilters.size(); i++) {
                    GenomicFilterOption filter = conFilters.get(i);
                    if (filter.isChecked()) {
                        if (!Strings.isNullOrEmpty(filter.getOption())) {
                            WHERE_CON_IN += "\"" + filter.getOption() + "\",";
                        } else {
                            WHERE_CON_NULL = " OR ARRAY_LENGTH(consequence) = 0";
                        }
                    }
                }
            }

            GenomicFilterOptionList varTypeFilterList = filters.getVariantType();
            List<GenomicFilterOption> varTypeFilters = varTypeFilterList.getItems();
            if (varTypeFilters != null && varTypeFilters.size() > 0 && varTypeFilterList.isFilterActive()) {
                for(int i=0; i < varTypeFilters.size(); i++) {
                    GenomicFilterOption filter = varTypeFilters.get(i);
                    if (filter.isChecked()) {
                        if (!Strings.isNullOrEmpty(filter.getOption())) {
                            WHERE_VAR_TYPE_IN += "\"" + filter.getOption() + "\",";
                        }
                    }
                }
            }

            GenomicFilterOptionList clinFilterList = filters.getClinicalSignificance();
            List<GenomicFilterOption> clinFilters = clinFilterList.getItems();
            if (clinFilters != null && clinFilters.size() > 0 && clinFilterList.isFilterActive()) {
                for(int i=0; i < clinFilters.size(); i++) {
                    GenomicFilterOption filter = clinFilters.get(i);
                    if (filter.isChecked()) {
                        if (!Strings.isNullOrEmpty(filter.getOption())) {
                            WHERE_CLIN_IN += "\"" + filter.getOption() + "\",";
                        } else {
                            WHERE_CLIN_NULL = " OR ARRAY_LENGTH(clinical_significance) = 0";
                        }
                    }
                }
            }
            GenomicFilterOption acFilter = filters.getAlleleCount();
            if (acFilter != null && acFilter.isChecked()) {
                Long minVal = acFilter.getMin();
                Long maxVal = acFilter.getMax();
                ALLELE_COUNT_FILTER = " AND allele_count BETWEEN " + minVal + " AND " + maxVal;
            }
            GenomicFilterOption anFilter = filters.getAlleleNumber();
            if (anFilter != null && anFilter.isChecked()) {
                Long minVal = anFilter.getMin();
                Long maxVal = anFilter.getMax();
                ALLELE_NUMBER_FILTER = " AND allele_number BETWEEN " + minVal + " AND " + maxVal;
            }
            GenomicFilterOption afFilter = filters.getAlleleFrequency();
            if (afFilter != null && afFilter.isChecked()) {
                Float minVal = afFilter.getMinFreq();
                Float maxVal = afFilter.getMaxFreq();
                ALLELE_FREQUENCY_FILTER = " AND allele_frequency BETWEEN " + minVal + " AND " + maxVal;
            }
            GenomicFilterOption hcFilter = filters.getHomozygoteCount();
            if (hcFilter != null && hcFilter.isChecked()) {
                Long minVal = hcFilter.getMin();
                Long maxVal = hcFilter.getMax();
                HOMOZYGOTE_COUNT_FILTER = " AND homozygote_count BETWEEN " + minVal + " AND " + maxVal;
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
        if (WHERE_VAR_TYPE_IN.substring(WHERE_VAR_TYPE_IN.length() - 1).equals(",")) {
            varTypeFilterFlag = true;
            WHERE_VAR_TYPE_IN = WHERE_VAR_TYPE_IN.substring(0, WHERE_VAR_TYPE_IN.length()-1);
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

        if (varTypeFilterFlag) {
            finalSql += WHERE_VAR_TYPE_IN;
            finalSql += ") ";
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
        if (HOMOZYGOTE_COUNT_FILTER.length() > 0) {
            finalSql += HOMOZYGOTE_COUNT_FILTER;
        }
        finalSql += ORDER_BY_CLAUSE;
        finalSql += " LIMIT " + rowCount + " OFFSET " + ((Optional.ofNullable(page).orElse(1)-1)*rowCount);

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
                    .variantType(bigQueryService.getString(row, rm.get("variant_type")))
                    .proteinChange(bigQueryService.getString(row, rm.get("protein_change")))
                    .clinicalSignificance(bigQueryService.getString(row, rm.get("clin_sig_agg_str")))
                    .alleleCount(bigQueryService.getLong(row, rm.get("allele_count")))
                    .alleleNumber(bigQueryService.getLong(row, rm.get("allele_number")))
                    .alleleFrequency(bigQueryService.getDouble(row, rm.get("allele_frequency")))
                    .homozygoteCount(bigQueryService.getLong(row, rm.get("homozygote_count")))
            );

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
        boolean whereGeneFlag = false;
        boolean whereContigFlag = false;
        boolean wherePositionFlag = false;
        boolean whereRsIdFlag = false;
        boolean whereVariantIdFlag = false;
        if (variantSearchTerm.startsWith("~")) {
            searchTerm = variantSearchTerm.substring(1);
        }
        String contig = searchTerm;
        String searchSqlQuery = "";
        // Make sure the search term is not empty
        if (!Strings.isNullOrEmpty(searchTerm)) {
            GenomicSearchTermType searchTermType = getSearchType(variantSearchTerm, searchTerm);
            searchSqlQuery += searchTermType.getSearchSqlQuery();
            genes = searchTermType.getGenes();
            low = searchTermType.getLow();
            high = searchTermType.getHigh();
            contig = "(?i)\\b" + searchTermType.getContig() + "\\b";
            variant_id = searchTermType.getVariantId();
            rs_id = searchTermType.getRsId();
            whereGeneFlag = searchTermType.isWhereGeneFlag();
            whereContigFlag = searchTermType.isWhereContigFlag();
            wherePositionFlag = searchTermType.isWherePositionFlag();
            whereRsIdFlag = searchTermType.isWhereRsIdFlag();
            whereVariantIdFlag = searchTermType.isWhereVariantIdFlag();
        }

        finalSql = FILTER_OPTION_SQL_TEMPLATE_GENE + searchSqlQuery
                + FILTER_OPTION_SQL_TEMPLATE_CON + searchSqlQuery
                + FILTER_OPTION_SQL_TEMPLATE_VAR_TYPE + searchSqlQuery
                + FILTER_OPTION_SQL_TEMPLATE_CLIN + searchSqlQuery
                + FILTER_OPTION_SQL_TEMPLATE_ALLELE_COUNT + searchSqlQuery
                + FILTER_OPTION_SQL_TEMPLATE_ALLELE_NUMBER + searchSqlQuery
                + FILTER_OPTION_SQL_TEMPLATE_HOMOZYGOTE_COUNT + searchSqlQuery
                + FILTER_OPTION_SQL_TEMPLATE_UNION;

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
        GenomicFilterOptionList varTypeFilterList = new GenomicFilterOptionList();
        GenomicFilterOptionList clinSigFilterList = new GenomicFilterOptionList();

        List<GenomicFilterOption> geneFilters = new ArrayList<>();
        List<GenomicFilterOption> conseqFilters = new ArrayList<>();
        List<GenomicFilterOption> varTypeFilters = new ArrayList<>();
        List<GenomicFilterOption> clinSigFilters = new ArrayList<>();


        GenomicFilterOption alleleCountFilter = new GenomicFilterOption();
        GenomicFilterOption alleleNumberFilter = new GenomicFilterOption();
        GenomicFilterOption homozygoteCountFilter = new GenomicFilterOption();

        for (List<FieldValue> row : result.iterateAll()) {
            String option = bigQueryService.getString(row, rm.get("option"));
            String gene = bigQueryService.getString(row, rm.get("genes"));
            String conseq = bigQueryService.getString(row, rm.get("conseq"));
            String varType = bigQueryService.getString(row, rm.get("variant_type"));
            String clinSignificance = bigQueryService.getString(row, rm.get("clin_significance"));
            Long geneCount = bigQueryService.getLong(row, rm.get("gene_count"));
            Long conCount = bigQueryService.getLong(row, rm.get("con_count"));
            Long variantTypeCount = bigQueryService.getLong(row, rm.get("variant_type_count"));
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
            } else if (option.equals("Variant Type")) {
                genomicFilterOption.setOption(varType);
                genomicFilterOption.setCount(variantTypeCount);
                genomicFilterOption.setChecked(false);
                genomicFilterOption.setMin(0L);
                genomicFilterOption.setMax(0L);
                varTypeFilters.add(genomicFilterOption);
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
            } else if (option.equals("Homozygote Count")) {
                genomicFilterOption.setOption("");
                genomicFilterOption.setCount(0L);
                genomicFilterOption.setChecked(false);
                genomicFilterOption.setMin(minCount);
                genomicFilterOption.setMax(maxCount);
                homozygoteCountFilter = genomicFilterOption;
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
        varTypeFilterList.setItems(varTypeFilters);
        varTypeFilterList.setFilterActive(false);
        clinSigFilterList.setItems(clinSigFilters);
        clinSigFilterList.setFilterActive(false);

        genomicFilters.gene(geneFilterList);
        genomicFilters.consequence(conseqFilterList);
        genomicFilters.variantType(varTypeFilterList);
        genomicFilters.clinicalSignificance(clinSigFilterList);
        genomicFilters.alleleCount(alleleCountFilter);
        genomicFilters.alleleNumber(alleleNumberFilter);
        genomicFilters.alleleFrequency(alleleFrequencyFilter);
        genomicFilters.homozygoteCount(homozygoteCountFilter);

        return ResponseEntity.ok(genomicFilters);
    }

    @Override
    public ResponseEntity<SVGenomicFilters> getSVGenomicFilterOptions(String variantSearchTerm) {
        try {
            cdrVersionService.setDefaultCdrVersion();
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }
        String finalSql = SV_FILTER_OPTION_SQL_TEMPLATE_GENE;

        String genes = "";
        Long low = 0L;
        Long high = 0L;
        String variant_id = "";

        String searchTerm = variantSearchTerm.trim();
        boolean whereGeneFlag = false;
        boolean whereContigFlag = false;
        boolean wherePositionFlag = false;
        boolean whereVariantIdFlag = false;
        if (variantSearchTerm.startsWith("~")) {
            searchTerm = variantSearchTerm.substring(1);
        }
        String contig = searchTerm;
        String searchSqlQuery = "";
        // Make sure the search term is not empty
        if (!Strings.isNullOrEmpty(searchTerm)) {
            SVGenomicSearchTermType searchTermType = getSVSearchType(variantSearchTerm, searchTerm);
            searchSqlQuery += searchTermType.getSearchSqlQuery();
            genes = searchTermType.getGenes();
            low = searchTermType.getLow();
            high = searchTermType.getHigh();
            contig = "(?i)\\b" + searchTermType.getContig() + "\\b";
            variant_id = searchTermType.getVariantId();
            whereGeneFlag = searchTermType.isWhereGeneFlag();
            whereContigFlag = searchTermType.isWhereContigFlag();
            wherePositionFlag = searchTermType.isWherePositionFlag();
            whereVariantIdFlag = searchTermType.isWhereVariantIdFlag();
        }


        finalSql = SV_FILTER_OPTION_SQL_TEMPLATE_GENE + searchSqlQuery
                + SV_FILTER_OPTION_SQL_TEMPLATE_VAR_TYPE + searchSqlQuery
                + SV_FILTER_OPTION_SQL_TEMPLATE_CON + searchSqlQuery
                + SV_FILTER_OPTION_SQL_TEMPLATE_SIZE + searchSqlQuery
                + SV_FILTER_OPTION_SQL_TEMPLATE_ALLELE_COUNT + searchSqlQuery
                + SV_FILTER_OPTION_SQL_TEMPLATE_ALLELE_NUMBER + searchSqlQuery
                + SV_FILTER_OPTION_SQL_TEMPLATE_HOMOZYGOTE_COUNT + searchSqlQuery
                + SV_FILTER_OPTION_SQL_TEMPLATE_UNION;

        QueryJobConfiguration qjc = QueryJobConfiguration.newBuilder(finalSql)
                .addNamedParameter("contig", QueryParameterValue.string(contig))
                .addNamedParameter("high", QueryParameterValue.int64(high))
                .addNamedParameter("low", QueryParameterValue.int64(low))
                .addNamedParameter("variant_id", QueryParameterValue.string(variant_id))
                .addNamedParameter("genes", QueryParameterValue.string(genes))
                .setUseLegacySql(false)
                .build();

        qjc = bigQueryService.filterBigQueryConfig(qjc);
        TableResult result = bigQueryService.executeQuery(qjc);
        Map<String, Integer> rm = bigQueryService.getResultMapper(result);
        SVGenomicFilters genomicFilters = new SVGenomicFilters();

        SVGenomicFilterOptionList varTypeFilterList = new SVGenomicFilterOptionList();
        SVGenomicFilterOptionList geneFilterList = new SVGenomicFilterOptionList();
        SVGenomicFilterOptionList conFilterList = new SVGenomicFilterOptionList();

        List<SVGenomicFilterOption> varTypeFilters = new ArrayList<>();
        List<SVGenomicFilterOption> geneFilters = new ArrayList<>();
        List<SVGenomicFilterOption> conFilters = new ArrayList<>();

        SVGenomicFilterOption sizeFilter = new SVGenomicFilterOption();
        SVGenomicFilterOption alleleCountFilter = new SVGenomicFilterOption();
        SVGenomicFilterOption alleleNumberFilter = new SVGenomicFilterOption();
        SVGenomicFilterOption homozygoteCountFilter = new SVGenomicFilterOption();

        for (List<FieldValue> row : result.iterateAll()) {
            String option = bigQueryService.getString(row, rm.get("option"));
            String varType = bigQueryService.getString(row, rm.get("variant_type"));
            String gene = bigQueryService.getString(row, rm.get("genes"));
            String conseq = bigQueryService.getString(row, rm.get("consequence"));
            Long minCount = bigQueryService.getLong(row, rm.get("min_count"));
            Long maxCount = bigQueryService.getLong(row, rm.get("max_count"));
            SVGenomicFilterOption genomicFilterOption = new SVGenomicFilterOption();
            if (option.equals("Gene")) {
                genomicFilterOption.setOption(gene);
                genomicFilterOption.setChecked(false);
                genomicFilterOption.setMin(0L);
                genomicFilterOption.setMax(0L);
                geneFilters.add(genomicFilterOption);
            } else if (option.equals("Variant Type")) {
                genomicFilterOption.setOption(varType);
                genomicFilterOption.setChecked(false);
                genomicFilterOption.setMin(0L);
                genomicFilterOption.setMax(0L);
                varTypeFilters.add(genomicFilterOption);
            } else if (option.equals("Consequence")) {
                genomicFilterOption.setOption(conseq);
                genomicFilterOption.setChecked(false);
                genomicFilterOption.setMin(0L);
                genomicFilterOption.setMax(0L);
                conFilters.add(genomicFilterOption);
            } else if (option.equals("Size")) {
                genomicFilterOption.setOption("");
                genomicFilterOption.setCount(0L);
                genomicFilterOption.setChecked(false);
                genomicFilterOption.setMin(minCount);
                genomicFilterOption.setMax(maxCount);
                sizeFilter = genomicFilterOption;
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
            } else if (option.equals("Homozygote Count")) {
                genomicFilterOption.setOption("");
                genomicFilterOption.setCount(0L);
                genomicFilterOption.setChecked(false);
                genomicFilterOption.setMin(minCount);
                genomicFilterOption.setMax(maxCount);
                homozygoteCountFilter = genomicFilterOption;
            }
        }

        SVGenomicFilterOption alleleFrequencyFilter = new SVGenomicFilterOption();
        alleleFrequencyFilter.setOption("");
        alleleFrequencyFilter.setCount(0L);
        alleleFrequencyFilter.setChecked(false);
        alleleFrequencyFilter.setMin(0L);
        alleleFrequencyFilter.setMax(1L);

        varTypeFilterList.setItems(varTypeFilters);
        varTypeFilterList.setFilterActive(false);

        geneFilterList.setItems(geneFilters);
        geneFilterList.setFilterActive(false);

        conFilterList.setItems(conFilters);
        conFilterList.setFilterActive(false);

        genomicFilters.consequence(conFilterList);
        genomicFilters.variantType(varTypeFilterList);
        genomicFilters.gene(geneFilterList);
        genomicFilters.size(sizeFilter);
        genomicFilters.alleleCount(alleleCountFilter);
        genomicFilters.alleleNumber(alleleNumberFilter);
        genomicFilters.alleleFrequency(alleleFrequencyFilter);
        genomicFilters.homozygoteCount(homozygoteCountFilter);

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
                CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.GENO_COMBINED_AGE_GENDER_ANALYSIS),
                CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.GENO_RACE_ANALYSIS),
                CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.GENO_LOCATION_ANALYSIS),
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
                .afrHomozygoteCount(bigQueryService.getLong(row, rm.get("afr_homozygote_count")))
                .easAlleleCount(bigQueryService.getLong(row, rm.get("eas_allele_count")))
                .easAlleleNumber(bigQueryService.getLong(row, rm.get("eas_allele_number")))
                .easAlleleFrequency(bigQueryService.getDouble(row, rm.get("eas_allele_frequency")))
                .easHomozygoteCount(bigQueryService.getLong(row, rm.get("eas_homozygote_count")))
                .eurAlleleCount(bigQueryService.getLong(row, rm.get("eur_allele_count")))
                .eurAlleleNumber(bigQueryService.getLong(row, rm.get("eur_allele_number")))
                .eurAlleleFrequency(bigQueryService.getDouble(row, rm.get("eur_allele_frequency")))
                .eurHomozygoteCount(bigQueryService.getLong(row, rm.get("eur_homozygote_count")))
                .amrAlleleCount(bigQueryService.getLong(row, rm.get("amr_allele_count")))
                .amrAlleleNumber(bigQueryService.getLong(row, rm.get("amr_allele_number")))
                .amrAlleleFrequency(bigQueryService.getDouble(row, rm.get("amr_allele_frequency")))
                .amrHomozygoteCount(bigQueryService.getLong(row, rm.get("amr_homozygote_count")))
                .midAlleleCount(bigQueryService.getLong(row, rm.get("mid_allele_count")))
                .midAlleleNumber(bigQueryService.getLong(row, rm.get("mid_allele_number")))
                .midAlleleFrequency(bigQueryService.getDouble(row, rm.get("mid_allele_frequency")))
                .midHomozygoteCount(bigQueryService.getLong(row, rm.get("mid_homozygote_count")))
                .sasAlleleCount(bigQueryService.getLong(row, rm.get("sas_allele_count")))
                .sasAlleleNumber(bigQueryService.getLong(row, rm.get("sas_allele_number")))
                .sasAlleleFrequency(bigQueryService.getDouble(row, rm.get("sas_allele_frequency")))
                .sasHomozygoteCount(bigQueryService.getLong(row, rm.get("sas_homozygote_count")))
                .othAlleleCount(bigQueryService.getLong(row, rm.get("oth_allele_count")))
                .othAlleleNumber(bigQueryService.getLong(row, rm.get("oth_allele_number")))
                .othAlleleFrequency(bigQueryService.getDouble(row, rm.get("oth_allele_frequency")))
                .othHomozygoteCount(bigQueryService.getLong(row, rm.get("oth_homozygote_count")))
                .totalAlleleCount(bigQueryService.getLong(row, rm.get("total_allele_count")))
                .totalAlleleNumber(bigQueryService.getLong(row, rm.get("total_allele_number")))
                .totalAlleleFrequency(bigQueryService.getDouble(row, rm.get("total_allele_frequency")))
                .totalHomozygoteCount(bigQueryService.getLong(row, rm.get("total_homozygote_count")));
        return ResponseEntity.ok(variantInfo);
    }

    @Override
    public ResponseEntity<SVVariantInfo> getSVVariantDetails(String variant_id) {
        try {
            cdrVersionService.setDefaultCdrVersion();
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }

        String finalSql = SV_VARIANT_DETAIL_SQL_TEMPLATE + WHERE_VARIANT_ID;
        QueryJobConfiguration qjc = QueryJobConfiguration.newBuilder(finalSql)
                .addNamedParameter("variant_id", QueryParameterValue.string(variant_id))
                .setUseLegacySql(false)
                .build();
        qjc = bigQueryService.filterBigQueryConfig(qjc);
        TableResult result = bigQueryService.executeQuery(qjc);
        Map<String, Integer> rm = bigQueryService.getResultMapper(result);
        List<FieldValue> row = result.iterateAll().iterator().next();
        SVVariantInfo variantInfo = new SVVariantInfo()
                .variantId(variant_id)
                .variantType(bigQueryService.getString(row, rm.get("variant_type")))
                .variantIDVCF(bigQueryService.getString(row, rm.get("variant_id_vcf")))
                .consequenceGenes(bigQueryService.getString(row, rm.get("consequence_genes")))
                .position(bigQueryService.getString(row, rm.get("position")))
                .size(bigQueryService.getLong(row, rm.get("size")))
                .cpxIntervals(bigQueryService.getString(row, rm.get("cpx_intervals")))
                .cpxType(bigQueryService.getString(row, rm.get("cpx_type")))
                .filter(bigQueryService.getString(row, rm.get("filter")))
                .afrAlleleCount(bigQueryService.getLong(row, rm.get("afr_allele_count")))
                .afrAlleleNumber(bigQueryService.getLong(row, rm.get("afr_allele_number")))
                .afrAlleleFrequency(bigQueryService.getDouble(row, rm.get("afr_allele_frequency")))
                .afrHomozygoteCount(bigQueryService.getLong(row, rm.get("afr_homozygote_count")))
                .easAlleleCount(bigQueryService.getLong(row, rm.get("eas_allele_count")))
                .easAlleleNumber(bigQueryService.getLong(row, rm.get("eas_allele_number")))
                .easAlleleFrequency(bigQueryService.getDouble(row, rm.get("eas_allele_frequency")))
                .easHomozygoteCount(bigQueryService.getLong(row, rm.get("eas_homozygote_count")))
                .eurAlleleCount(bigQueryService.getLong(row, rm.get("eur_allele_count")))
                .eurAlleleNumber(bigQueryService.getLong(row, rm.get("eur_allele_number")))
                .eurAlleleFrequency(bigQueryService.getDouble(row, rm.get("eur_allele_frequency")))
                .eurHomozygoteCount(bigQueryService.getLong(row, rm.get("eur_homozygote_count")))
                .amrAlleleCount(bigQueryService.getLong(row, rm.get("amr_allele_count")))
                .amrAlleleNumber(bigQueryService.getLong(row, rm.get("amr_allele_number")))
                .amrAlleleFrequency(bigQueryService.getDouble(row, rm.get("amr_allele_frequency")))
                .amrHomozygoteCount(bigQueryService.getLong(row, rm.get("amr_homozygote_count")))
                .midAlleleCount(bigQueryService.getLong(row, rm.get("mid_allele_count")))
                .midAlleleNumber(bigQueryService.getLong(row, rm.get("mid_allele_number")))
                .midAlleleFrequency(bigQueryService.getDouble(row, rm.get("mid_allele_frequency")))
                .midHomozygoteCount(bigQueryService.getLong(row, rm.get("mid_homozygote_count")))
                .sasAlleleCount(bigQueryService.getLong(row, rm.get("sas_allele_count")))
                .sasAlleleNumber(bigQueryService.getLong(row, rm.get("sas_allele_number")))
                .sasAlleleFrequency(bigQueryService.getDouble(row, rm.get("sas_allele_frequency")))
                .sasHomozygoteCount(bigQueryService.getLong(row, rm.get("sas_homozygote_count")))
                .othAlleleCount(bigQueryService.getLong(row, rm.get("oth_allele_count")))
                .othAlleleNumber(bigQueryService.getLong(row, rm.get("oth_allele_number")))
                .othAlleleFrequency(bigQueryService.getDouble(row, rm.get("oth_allele_frequency")))
                .othHomozygoteCount(bigQueryService.getLong(row, rm.get("oth_homozygote_count")))
                .totalAlleleCount(bigQueryService.getLong(row, rm.get("total_allele_count")))
                .totalAlleleNumber(bigQueryService.getLong(row, rm.get("total_allele_number")))
                .totalAlleleFrequency(bigQueryService.getDouble(row, rm.get("total_allele_frequency")))
                .totalHomozygoteCount(bigQueryService.getLong(row, rm.get("total_homozygote_count")));
        return ResponseEntity.ok(variantInfo);
    }

    @Override
    public ResponseEntity<String> getSearchTermType(String query) {
        String searchTerm = query.trim();
        if (searchTerm.isEmpty()) {
            return ResponseEntity.badRequest().body("Search term cannot be empty.");
        }

        String type;

        if (searchTerm.matches(genomicRegionRegex)) {
            type = "genomic_region";
        } else if (searchTerm.matches(variantIdRegex)) {
            type = "variant_id";
        } else if (searchTerm.matches(rsNumberRegex)) {
            type = "rs_id";
        } else {
            type = "gene";
        }

        return ResponseEntity.ok(type);
    }



    public static GenomicSearchTermType getSearchType(String variantSearchTerm, String searchTerm) {
        GenomicSearchTermType searchTermType = new GenomicSearchTermType();
        String genes = "";
        Long low = 0L;
        Long high = 0L;
        String variant_id = "";
        String rs_id = "";
        boolean whereGeneFlag = false;
        boolean whereVariantIdFlag = false;
        boolean whereContigFlag = false;
        boolean wherePositionFlag = false;
        boolean whereRsIdFlag = false;
        String contig = "(?i)(" + searchTerm + ")$";
        String searchSql = "";
        if (searchTerm.matches(genomicRegionRegex)) {
            String[] regionTermSplit = new String[0];
            if (searchTerm.contains(":")) {
                regionTermSplit = searchTerm.split(":");
                contig = regionTermSplit[0].substring(0, 3).toLowerCase() + regionTermSplit[0].substring(3).toUpperCase();
            }
            whereContigFlag = true;
            searchSql = WHERE_CONTIG;
            if (regionTermSplit.length > 1) {
                String[] rangeSplit = regionTermSplit[1].split("-");
                try {
                    if (rangeSplit.length == 2) {
                        low = Math.min(Long.valueOf(rangeSplit[0]), Long.valueOf(rangeSplit[1]));
                        high = Math.max(Long.valueOf(rangeSplit[0]), Long.valueOf(rangeSplit[1]));
                        wherePositionFlag = true;
                        searchSql += AND_POSITION;
                    }
                } catch(NumberFormatException e) {
                    System.out.println("Trying to convert bad number.");
                }
            }
        } else if (searchTerm.matches(variantIdRegex)) {
            // Check if the search term matches variant id pattern
            variant_id = searchTerm;
            whereVariantIdFlag = true;
            searchSql += WHERE_VARIANT_ID;
        } else if (searchTerm.matches(rsNumberRegex)) {
            whereRsIdFlag = true;
            if (variantSearchTerm.startsWith("~")) {
                rs_id = "(?i)" + searchTerm;
                searchSql += WHERE_RS_NUMBER_CONTAINS;
            } else {
                rs_id = searchTerm;
                searchSql += WHERE_RS_NUMBER_EXACT;
            }
        } else {// Check if the search term matches gene coding pattern
            whereGeneFlag = true;
            if (variantSearchTerm.startsWith("~")) {
                genes = searchTerm.toUpperCase();
            } else {
                genes = "\\b" + searchTerm.toUpperCase() + "\\b";
            }
            searchSql += WHERE_GENE_REGEX;
        }
        searchTermType.setVariantId(variant_id);
        searchTermType.setWhereVariantIdFlag(whereVariantIdFlag);
        searchTermType.setContig(contig);
        searchTermType.setLow(low);
        searchTermType.setHigh(high);
        searchTermType.setWhereContigFlag(whereContigFlag);
        searchTermType.setWherePositionFlag(wherePositionFlag);
        searchTermType.setRsId(rs_id);
        searchTermType.setWhereRsIdFlag(whereRsIdFlag);
        searchTermType.setGenes(genes);
        searchTermType.setWhereGeneFlag(whereGeneFlag);
        searchTermType.setSearchSqlQuery(searchSql);
        return searchTermType;
    }

    public static SVGenomicSearchTermType getSVSearchType(String variantSearchTerm, String searchTerm) {
        SVGenomicSearchTermType searchTermType = new SVGenomicSearchTermType();
        String variant_id = "";
        boolean whereVariantIdFlag = false;
        boolean whereGeneFlag = false;
        boolean wherePositionFlag = false;
        String contig = "(?i)(" + searchTerm + ")$";
        String searchSql = "";
        String genes = "";
        Long low = 0L;
        Long high = 0L;
        boolean whereContigFlag = false;


        if (searchTerm.matches(svVariantIdRegexV7)) {
            // Check if the search term matches variant id v7 pattern
            variant_id = searchTerm;
            whereVariantIdFlag = true;
            searchSql += WHERE_VARIANT_ID;
        } else if (searchTerm.matches(svVariantIdRegexV8)) {
            // Check if the search term matches variant id v8 pattern
            variant_id = searchTerm;
            whereVariantIdFlag = true;
            searchSql += WHERE_VARIANT_ID;
        } else if (searchTerm.matches(svVariantIdRegexRandom)) {
            // Check if the search term matches variant id v8 pattern
            variant_id = searchTerm;
            whereVariantIdFlag = true;
            searchSql += WHERE_VARIANT_ID;
        } else if (searchTerm.matches(genomicRegionRegex)) {
            String[] regionTermSplit = new String[0];
            if (searchTerm.contains(":")) {
                regionTermSplit = searchTerm.split(":");
                contig = regionTermSplit[0].substring(0, 3).toLowerCase() + regionTermSplit[0].substring(3).toUpperCase();
            }
            whereContigFlag = true;
            searchSql = WHERE_CHROM;
            if (regionTermSplit.length > 1) {
                String[] rangeSplit = regionTermSplit[1].split("-");
                try {
                    if (rangeSplit.length == 2) {
                        low = Math.min(Long.valueOf(rangeSplit[0]), Long.valueOf(rangeSplit[1]));
                        high = Math.max(Long.valueOf(rangeSplit[0]), Long.valueOf(rangeSplit[1]));
                        wherePositionFlag = true;
                        searchSql += AND_POS;
                    }
                } catch(NumberFormatException e) {
                    System.out.println("Trying to convert bad number.");
                }
            }
        } else {// Check if the search term matches gene coding pattern
            whereGeneFlag = true;
            if (variantSearchTerm.startsWith("~")) {
                genes = searchTerm.toUpperCase();
            } else {
                // genes = "r\'(?i)(^|,)\\s*" + searchTerm.toUpperCase() + "\\s*(,|$)\'";
                // genes = "\\b" + searchTerm.toUpperCase() + "\\b";
                genes = "(?i)(^|,)\\s*" + searchTerm.toUpperCase() + "\\s*(,|$)";
            }
            searchSql += WHERE_GENE_REGEX;
        }
        searchTermType.setVariantId(variant_id);
        searchTermType.setWhereVariantIdFlag(whereVariantIdFlag);
        searchTermType.setGenes(genes);
        searchTermType.setWhereGeneFlag(whereGeneFlag);
        searchTermType.setContig(contig);
        searchTermType.setLow(low);
        searchTermType.setHigh(high);
        searchTermType.setWhereContigFlag(whereContigFlag);
        searchTermType.setWherePositionFlag(wherePositionFlag);

        searchTermType.setSearchSqlQuery(searchSql);
        return searchTermType;
    }
}