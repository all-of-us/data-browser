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
<<<<<<< HEAD
import org.pmiops.workbench.model.AnalysisListResponse;
import org.pmiops.workbench.exceptions.ServerErrorException;
import com.google.common.collect.ImmutableList;
import org.pmiops.workbench.model.AnalysisIdConstant;
import org.pmiops.workbench.model.CommonStorageEnums;
=======
import org.pmiops.workbench.model.VariantListResponse;
import org.pmiops.workbench.exceptions.ServerErrorException;
import org.pmiops.workbench.service.BigQueryService;
import com.google.cloud.bigquery.FieldValue;
import com.google.cloud.bigquery.QueryJobConfiguration;
import com.google.cloud.bigquery.TableResult;
>>>>>>> wip

@RestController
public class GenomicsController implements GenomicsApiDelegate {

    @Autowired
    private AchillesAnalysisService achillesAnalysisService;
    @Autowired
    private CdrVersionService cdrVersionService;
    @Autowired
    private BigQueryService bigQueryService;

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
        String COUNT_SQL_TEMPLATE = "";
        String genomicRegionRegex = "(?i)(chr([0-9]{1,})*[XY]*:).*";
        String variantIdRegex = "(?i)(\\d{1,}|X|Y)-\\d{5,}-[A,C,T,G]{1,}-[A,C,T,G]{1,}";

        // Make sure the search term is not empty
        if (!Strings.isNullOrEmpty(variantSearchTerm)) {
            // Check if the search term matches genomic region search term pattern
            if (variantSearchTerm.matches(genomicRegionRegex)) {
                String[] regionTermSplit = variantSearchTerm.split(":");
                COUNT_SQL_TEMPLATE = "SELECT count(*) as count\n" + "FROM `${projectId}.${dataSetId}.wgs_variant_mv` where contig= \"" + regionTermSplit[0] + "\"";
                if (regionTermSplit.length > 1) {
                    String[] rangeSplit = regionTermSplit[1].split("-");
                    try {
                        if (rangeSplit.length == 2) {
                            Long low = Math.min(Long.valueOf(rangeSplit[0]), Long.valueOf(rangeSplit[1]));
                            Long high = Math.max(Long.valueOf(rangeSplit[0]), Long.valueOf(rangeSplit[1]));
                            COUNT_SQL_TEMPLATE = "SELECT count(*) as count\n" +
                                    "FROM `${projectId}.${dataSetId}.wgs_variant_mv` where contig= \"" + regionTermSplit[0] + "\" and position <= " + high + " and position >= " + low + "\n";
                        }
                    } catch(NumberFormatException e) {
                        System.out.println("Trying to convert bad number.");
                    }
                }
            } else if (variantSearchTerm.matches(variantIdRegex)) {
                // Check if the search term matches variant id pattern
                COUNT_SQL_TEMPLATE = "SELECT count(*) as count\n" + "FROM `${projectId}.${dataSetId}.wgs_variant_mv` where variant_id= \"" + variantSearchTerm + "\"";
            } else {// Check if the search term matches gene coding pattern
                COUNT_SQL_TEMPLATE = "SELECT count(*) as count\n" + "FROM `${projectId}.${dataSetId}.wgs_variant_mv` where REGEXP_CONTAINS(genes, \"" + variantSearchTerm + "\")";
            }
        } else {
            COUNT_SQL_TEMPLATE = "SELECT count(*) as count\n" +
                    "FROM `${projectId}.${dataSetId}.wgs_variant_mv`\n";
        }
        QueryJobConfiguration qjc = QueryJobConfiguration.newBuilder(COUNT_SQL_TEMPLATE.toString())
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
        try {
            cdrVersionService.setDefaultCdrVersion();
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }
        String COUNT_SQL_TEMPLATE = "SELECT variant_id, gene_symbol, genes, consequence, protein_change, clinical_significance, dna_change, transcript, rs_number, allele_frequency, allele_count, allele_number\n" +
                "FROM `${projectId}.${dataSetId}.wgs_variant_mv` \n" +
                "limit 50 offset 0;";
        QueryJobConfiguration qjc = QueryJobConfiguration.newBuilder(COUNT_SQL_TEMPLATE.toString())
                .setUseLegacySql(false)
                .build();
        qjc = bigQueryService.filterBigQueryConfig(qjc);
        TableResult result = bigQueryService.executeQuery(qjc);
        Map<String, Integer> rm = bigQueryService.getResultMapper(result);
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