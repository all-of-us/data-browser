package org.pmiops.workbench.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.pmiops.workbench.model.Analysis;
import org.pmiops.workbench.cdr.dao.AchillesAnalysisDao;
import org.pmiops.workbench.cdr.AchillesMapper;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AchillesAnalysisService {
    private final AchillesAnalysisDao achillesAnalysisDao;
    private final AchillesMapper achillesMapper;

    @Autowired
    public AchillesAnalysisService(AchillesAnalysisDao achillesAnalysisDao, AchillesMapper achillesMapper) {
        this.achillesAnalysisDao = achillesAnalysisDao;
        this.achillesMapper = achillesMapper;
    }

    public Analysis findAnalysisById(Long analysisId) {
        return achillesMapper.dbModelToClient(achillesAnalysisDao.findAnalysisById(analysisId));
    }

    public List<Analysis> findAnalysisByIdsAndDomain(List<Long> analysisId, String domainId) {
        return achillesAnalysisDao.findAnalysisByIdsAndDomain(analysisId, domainId).stream()
                .map(achillesMapper::dbModelToClient)
                .collect(Collectors.toList());
    }

    public List<Analysis> findSurveyAnalysisByIds(List<Long> analysisId, String domainId) {
        return achillesAnalysisDao.findSurveyAnalysisByIds(analysisId, domainId).stream()
                .map(achillesMapper::dbModelToClient)
                .collect(Collectors.toList());
    }

    public List<Analysis> findConceptAnalysisResults(String conceptId,List<Long> analysisIds) {
        return achillesAnalysisDao.findConceptAnalysisResults(conceptId, analysisIds).stream()
                .map(achillesMapper::dbModelToClient)
                .collect(Collectors.toList());
    }

    public List<Analysis> findSubQuestionResults(List<Long> analysisIds, List<String> questionIds) {
        return achillesAnalysisDao.findSubQuestionResults(analysisIds, questionIds).stream()
                .map(achillesMapper::dbModelToClient)
                .collect(Collectors.toList());
    }

    public List<Analysis> findSurveyAnalysisResults(String survey_concept_id, List<String> question_concept_ids) {
        return achillesAnalysisDao.findSurveyAnalysisResults(survey_concept_id, question_concept_ids).stream()
                .map(achillesMapper::dbModelToClient)
                .collect(Collectors.toList());
    }

    public List<Analysis> findSurveyQuestionResults(List<Long> analysisId, String surveyConceptId, String questionConceptId, String path) {
        return achillesAnalysisDao.findSurveyQuestionResults(analysisId, surveyConceptId, questionConceptId, path).stream()
                .map(achillesMapper::dbModelToClient)
                .collect(Collectors.toList());
    }

    public List<Analysis> findAnalysisByIds(List<Long> analysisIds) {
        return achillesAnalysisDao.findAnalysisByIds(analysisIds).stream()
                .map(achillesMapper::dbModelToClient)
                .collect(Collectors.toList());
    }

    public List<Analysis> findSurveyQuestionCounts(List<Long> analysisIds, String questionConceptId, String questionPath) {
        return achillesAnalysisDao.findSurveyQuestionCounts(analysisIds, questionConceptId, questionPath).stream()
                .map(achillesMapper::dbModelToClient)
                .collect(Collectors.toList());
    }
}