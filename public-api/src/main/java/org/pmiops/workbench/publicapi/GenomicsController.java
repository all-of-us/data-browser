package org.pmiops.workbench.publicapi;

import java.util.ArrayList;
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

@RestController
public class GenomicsController implements GenomicsApiDelegate {

    @Autowired
    private AchillesAnalysisService achillesAnalysisService;
    @Autowired
    private CdrVersionService cdrVersionService;

    public GenomicsController() {}

    public GenomicsController(AchillesAnalysisService achillesAnalysisService, CdrVersionService cdrVersionService) {
        this.achillesAnalysisService = achillesAnalysisService;
        this.cdrVersionService = cdrVersionService;
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
    public ResponseEntity<AnalysisListResponse> getChartData() {
        try {
            cdrVersionService.setDefaultCdrVersion();
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }
        ImmutableList<Long> analysisIds = ImmutableList.of(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.GENO_GENDER_ANALYSIS),
                CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.GENO_AGE_ANALYSIS),
                CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.GENO_RACE_ANALYSIS));
        AnalysisListResponse analysisListResponse = new AnalysisListResponse();
        analysisListResponse.setItems(achillesAnalysisService.findAnalysisByIdsAndDomain(analysisIds, "Genomics"));
        return ResponseEntity.ok(analysisListResponse);
    }

}