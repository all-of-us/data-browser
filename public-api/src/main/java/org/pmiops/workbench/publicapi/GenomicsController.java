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
import org.pmiops.workbench.model.VariantListResponse;
import org.pmiops.workbench.exceptions.ServerErrorException;
import org.pmiops.workbench.service.BigQueryService;
import com.google.cloud.bigquery.FieldValue;
import com.google.cloud.bigquery.QueryJobConfiguration;
import com.google.cloud.bigquery.TableResult;

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
        // TODO Add search check and filter count
        String COUNT_SQL_TEMPLATE = "SELECT count(*) as count\n" +
                "FROM `${projectId}.${dataSetId}.wgs_variant_mv`\n";
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
        String COUNT_SQL_TEMPLATE = "SELECT DISTINCT variant_id, contig, position, ref_allele, alt_allele, genes\n" +
                "FROM `${projectId}.${dataSetId}.wgs_variant_mv`\n" +
                "WHERE contig = 'chr5'\n" +
                "AND position >= 6000000\n" +
                "AND position <= 8010000\n" +
                "limit 50;";
        QueryJobConfiguration qjc = QueryJobConfiguration.newBuilder(COUNT_SQL_TEMPLATE.toString())
                .setUseLegacySql(false)
                .build();
        qjc = bigQueryService.filterBigQueryConfig(qjc);
        TableResult result = bigQueryService.executeQuery(qjc);
        Map<String, Integer> rm = bigQueryService.getResultMapper(result);
        int count = 0;
        for (List<FieldValue> row : result.iterateAll()) {
            System.out.println("************ Printing results **************");
            System.out.println(row.size());
            count += 1;
            System.out.println("************ Printing results **************");
        }
        System.out.println("Row count = " + count);
        return null;
    }
}