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

<<<<<<< HEAD
    private static final String genomicRegionRegex = "(?i)(chr([0-9]{1,})*[XYxy]*:{0,1}).*";
=======
    private static final String genomicRegionRegex = "(?i)(chr([0-9]{1,})*[XYxy]*:{0,}).*";
>>>>>>> 79bf2630b190f3f9708b3c7b032d18fb432d6b50
    private static final String variantIdRegex = "(?i)(\\d{1,}|X|Y)-\\d{5,}-[A,C,T,G]{1,}-[A,C,T,G]{1,}";
    private static final String COUNT_SQL_TEMPLATE = "SELECT count(*) as count FROM ${projectId}.${dataSetId}.wgs_variant";
    private static final String WHERE_CONTIG = " where REGEXP_CONTAINS(contig, @contig)";
    private static final String AND_POSITION = " and position <= @high and position >= @low";
    private static final String WHERE_VARIANT_ID = " where variant_id = @variant_id";
    private static final String WHERE_GENE = " where REGEXP_CONTAINS(genes, @genes)";
    private static final String VARIANT_LIST_SQL_TEMPLATE = "SELECT variant_id, genes, (SELECT STRING_AGG(distinct d, \", \" order by d asc) FROM UNNEST(consequence) d) as cons_agg_str, " +
            "protein_change, (SELECT STRING_AGG(distinct d, \", \" order by d asc) FROM UNNEST(clinical_significance) d) as clin_sig_agg_str, allele_count, allele_number, allele_frequency FROM ${projectId}.${dataSetId}.wgs_variant";
    private static final String VARIANT_DETAIL_SQL_TEMPLATE = "SELECT dna_change, transcript, ARRAY_TO_STRING(rs_number, ', ') as rs_number, gvs_afr_ac as afr_allele_count, gvs_afr_an as afr_allele_number, gvs_afr_af as afr_allele_frequency, gvs_eas_ac as eas_allele_count, gvs_eas_an as eas_allele_number, gvs_eas_af as eas_allele_frequency, " +
            "gvs_eur_ac as eur_allele_count, gvs_eur_an as eur_allele_number, gvs_eur_af as eur_allele_frequency, " +
            "gvs_amr_ac as amr_allele_count, gvs_amr_an as amr_allele_number, gvs_amr_af as amr_allele_frequency, " +
            "gvs_mid_ac as mid_allele_count, gvs_mid_an as mid_allele_number, gvs_mid_af as mid_allele_frequency, " +
            "gvs_sas_ac as sas_allele_count, gvs_sas_an as sas_allele_number, gvs_sas_af as sas_allele_frequency, " +
            "gvs_oth_ac as oth_allele_count, gvs_oth_an as oth_allele_number, gvs_oth_af as oth_allele_frequency, " +
            "gvs_all_ac as total_allele_count, gvs_all_an as total_allele_number, gvs_all_af as total_allele_frequency from ${projectId}.${dataSetId}.wgs_variant";

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
    public ResponseEntity<Long> getVariantSearchResultSize(String variantSearchTerm) {
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
<<<<<<< HEAD
        String contig = variantSearchTerm;
=======
        String contig = "(?i)(" + variantSearchTerm + ")";
>>>>>>> 79bf2630b190f3f9708b3c7b032d18fb432d6b50
        // Make sure the search term is not empty
        if (!Strings.isNullOrEmpty(variantSearchTerm)) {
            // Check if the search term matches genomic region search term pattern
            if (variantSearchTerm.matches(genomicRegionRegex)) {
                String[] regionTermSplit = new String[0];
                if (variantSearchTerm.contains(":")) {
                    regionTermSplit = variantSearchTerm.split(":");
<<<<<<< HEAD
                    contig = regionTermSplit[0];
=======
                    contig = "(?i)(" + regionTermSplit[0] + ")";
>>>>>>> 79bf2630b190f3f9708b3c7b032d18fb432d6b50
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
            } else if (variantSearchTerm.matches(variantIdRegex)) {
                // Check if the search term matches variant id pattern
                variant_id = variantSearchTerm;
                finalSql += WHERE_VARIANT_ID;
            } else {// Check if the search term matches gene coding pattern
                genes = "(?i)" + variantSearchTerm;
                finalSql += WHERE_GENE;
            }
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
    public ResponseEntity<VariantListResponse> searchVariants(SearchVariantsRequest searchVariantsRequest) {
        try {
            cdrVersionService.setDefaultCdrVersion();
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }
        String variantSearchTerm = searchVariantsRequest.getQuery();
        Integer page = searchVariantsRequest.getPageNumber();
        SortMetadata sortMetadata = searchVariantsRequest.getSortMetadata();
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
                    if (geneColumnSortMetadata.getSortDirection().equals("desc")) {
                        ORDER_BY_CLAUSE = " ORDER BY genes DESC";
                    } else {
                        ORDER_BY_CLAUSE = " ORDER BY genes ASC";
                    }
            }
            SortColumnDetails consequenceColumnSortMetadata = sortMetadata.getConsequence();
            if (consequenceColumnSortMetadata != null && consequenceColumnSortMetadata.getSortActive()) {
                if (consequenceColumnSortMetadata.getSortDirection().equals("desc")) {
                    ORDER_BY_CLAUSE = " ORDER BY (SELECT STRING_AGG(distinct d, \", \" order by d asc) FROM UNNEST(consequence) d) DESC";
                } else {
                    ORDER_BY_CLAUSE = " ORDER BY (SELECT STRING_AGG(distinct d, \", \" order by d asc) FROM UNNEST(consequence) d) ASC";
                }
            }
            SortColumnDetails proteinChangeColumnSortMetadata = sortMetadata.getProteinChange();
            if (proteinChangeColumnSortMetadata != null && proteinChangeColumnSortMetadata.getSortActive()) {
                if (proteinChangeColumnSortMetadata.getSortDirection().equals("desc")) {
                    ORDER_BY_CLAUSE = " ORDER BY protein_change DESC";
                } else {
                    ORDER_BY_CLAUSE = " ORDER BY protein_change ASC";
                }
            }
            SortColumnDetails clinSigColumnSortMetadata = sortMetadata.getClinicalSignificance();
            if (clinSigColumnSortMetadata != null && clinSigColumnSortMetadata.getSortActive()) {
                if (clinSigColumnSortMetadata.getSortDirection().equals("desc")) {
                    ORDER_BY_CLAUSE = " ORDER BY (SELECT STRING_AGG(distinct d, \", \" order by d asc) FROM UNNEST(clinical_significance) d) DESC";
                } else {
                    ORDER_BY_CLAUSE = " ORDER BY (SELECT STRING_AGG(distinct d, \", \" order by d asc) FROM UNNEST(clinical_significance) d) ASC";
                }
            }
            SortColumnDetails alleleCountColumnSortMetadata = sortMetadata.getAlleleCount();
            if (alleleCountColumnSortMetadata != null && alleleCountColumnSortMetadata.getSortActive()) {
                    if (alleleCountColumnSortMetadata.getSortDirection().equals("desc")) {
                        ORDER_BY_CLAUSE = " ORDER BY allele_count DESC";
                    } else {
                        ORDER_BY_CLAUSE = " ORDER BY allele_count ASC";
                    }
            }
            SortColumnDetails alleleNumberColumnSortMetadata = sortMetadata.getAlleleNumber();
            if (alleleNumberColumnSortMetadata != null && alleleNumberColumnSortMetadata.getSortActive()) {
                    if (alleleNumberColumnSortMetadata.getSortDirection().equals("desc")) {
                        ORDER_BY_CLAUSE = " ORDER BY allele_number DESC";
                    } else {
                        ORDER_BY_CLAUSE = " ORDER BY allele_number ASC";
                    }
            }
            SortColumnDetails alleleFrequencyColumnSortMetadata = sortMetadata.getAlleleFrequency();
            if (alleleFrequencyColumnSortMetadata != null && alleleFrequencyColumnSortMetadata.getSortActive()) {
                    if (alleleFrequencyColumnSortMetadata.getSortDirection().equals("desc")) {
                        ORDER_BY_CLAUSE = " ORDER BY allele_frequency DESC";
                    } else {
                        ORDER_BY_CLAUSE = " ORDER BY allele_frequency ASC";
                    }
            }
        }
        String finalSql = VARIANT_LIST_SQL_TEMPLATE;
        String genes = "";
        Long low = 0L;
        Long high = 0L;
        String variant_id = "";
<<<<<<< HEAD
        String contig = variantSearchTerm;
=======
        String contig = "(?i)(" + variantSearchTerm + ")";
>>>>>>> 79bf2630b190f3f9708b3c7b032d18fb432d6b50
        // Make sure the search term is not empty
        if (!Strings.isNullOrEmpty(variantSearchTerm)) {
            // Check if the search term matches genomic region search term pattern
            if (variantSearchTerm.matches(genomicRegionRegex)) {
                String[] regionTermSplit = new String[0];
                if (variantSearchTerm.contains(":")) {
                    regionTermSplit = variantSearchTerm.split(":");
<<<<<<< HEAD
                    contig = regionTermSplit[0];
=======
                    contig = "(?i)(" + regionTermSplit[0] + ")";
>>>>>>> 79bf2630b190f3f9708b3c7b032d18fb432d6b50
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
            } else if (variantSearchTerm.matches(variantIdRegex)) {
                // Check if the search term matches variant id pattern
                variant_id = variantSearchTerm;
                finalSql += WHERE_VARIANT_ID;
            } else {// Check if the search term matches gene coding pattern
                genes = "(?i)" + variantSearchTerm;
                finalSql += WHERE_GENE;
            }
        }
        finalSql += ORDER_BY_CLAUSE;
        finalSql += " LIMIT 50 OFFSET " + ((Optional.ofNullable(page).orElse(1)-1)*50);
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