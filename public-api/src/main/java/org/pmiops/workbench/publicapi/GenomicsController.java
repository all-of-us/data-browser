package org.pmiops.workbench.publicapi;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.RestController;
import org.pmiops.workbench.service.AchillesAnalysisService;
import org.pmiops.workbench.service.CdrVersionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.pmiops.workbench.model.Analysis;
import org.pmiops.workbench.model.AnalysisListResponse;
import org.pmiops.workbench.exceptions.ServerErrorException;
import com.google.common.collect.ImmutableList;
import org.pmiops.workbench.model.AnalysisIdConstant;
import org.pmiops.workbench.model.CommonStorageEnums;
import org.pmiops.workbench.model.VariantListResponse;
import org.pmiops.workbench.exceptions.ServerErrorException;
import org.pmiops.workbench.service.BigQueryService;
import com.google.cloud.bigquery.FieldValue;
import com.google.cloud.bigquery.QueryJobConfiguration;
import com.google.cloud.bigquery.QueryParameterValue;
import com.google.cloud.bigquery.TableResult;
import com.google.common.base.Strings;

@RestController
public class GenomicsController implements GenomicsApiDelegate {

    @Autowired
    private AchillesAnalysisService achillesAnalysisService;
    @Autowired
    private CdrVersionService cdrVersionService;
    @Autowired
    private BigQueryService bigQueryService;

    private static final String genomicRegionRegex = "(?i)(chr([0-9]{1,})*[XY]*:).*";
    private static final String variantIdRegex = "(?i)(\\d{1,}|X|Y)-\\d{5,}-[A,C,T,G]{1,}-[A,C,T,G]{1,}";
    private static final String COUNT_SQL_TEMPLATE = "SELECT count(*) as count FROM ${projectId}.${dataSetId}.wgs_variant";
    private static final String WHERE_CONTIG = " where contig = @contig";
    private static final String AND_POSITION = " and position <= @high and position >= @low";
    private static final String WHERE_VARIANT_ID = " where variant_id = @variant_id";
    private static final String WHERE_GENE = " where REGEXP_CONTAINS(genes, @genes)";

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
        String contig = "";
        // Make sure the search term is not empty
        if (!Strings.isNullOrEmpty(variantSearchTerm)) {
            // Check if the search term matches genomic region search term pattern
            if (variantSearchTerm.matches(genomicRegionRegex)) {
                String[] regionTermSplit = variantSearchTerm.split(":");
                contig = regionTermSplit[0];
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
                genes = variantSearchTerm;
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
    public ResponseEntity<VariantListResponse> searchVariants(String variantSearchTerm) {
        return null;
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
}