package org.pmiops.workbench.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.pmiops.workbench.model.SurveyMetadata;
import org.pmiops.workbench.cdr.SurveyMetadataMapper;
import org.pmiops.workbench.cdr.dao.SurveyMetadataDao;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Comparator;

@Service
public class SurveyMetadataService {
    private SurveyMetadataDao surveyMetadataDao;
    private SurveyMetadataMapper surveyMetadataMapper;

    @Autowired
    public SurveyMetadataService(SurveyMetadataDao surveyMetadataDao, SurveyMetadataMapper surveyMetadataMapper) {
        this.surveyMetadataDao = surveyMetadataDao;
        this.surveyMetadataMapper = surveyMetadataMapper;
    }

    public List<SurveyMetadata> getSurveyQuestions(Long surveyConceptId) {
       return surveyMetadataDao.getSurveyQuestions(surveyConceptId).stream()
                .map(surveyMetadataMapper::dbModelToClient)
                .collect(Collectors.toList());
    }

    public List<SurveyMetadata> getMatchingSurveyQuestions(Long surveyConceptId, String searchWord) {
        List<SurveyMetadata> matchingQuestions = surveyMetadataDao.getMatchingSurveyQuestions(surveyConceptId, searchWord).stream()
                .map(surveyMetadataMapper::dbModelToClient)
                .collect(Collectors.toList());

        List<SurveyMetadata> matchingTopics = surveyMetadataDao.getMatchingSurveyQuestionTopics(surveyConceptId, searchWord).stream()
                .map(surveyMetadataMapper::dbModelToClient)
                .collect(Collectors.toList());

        matchingQuestions.addAll(matchingTopics);
        matchingQuestions.sort(Comparator.comparing(SurveyMetadata::getId));

        return matchingQuestions;
    }

    public List<SurveyMetadata> getFMHQuestions(List<String> conceptIds) {
        return surveyMetadataDao.getFMHQuestions(conceptIds).stream()
                .map(surveyMetadataMapper::dbModelToClient)
                .collect(Collectors.toList());
    }

    public List<SurveyMetadata> getMatchingFMHQuestions(List<String> conceptIds, String searchWord) {
        return surveyMetadataDao.getMatchingFMHQuestions(conceptIds, searchWord)
                .stream()
                .map(surveyMetadataMapper::dbModelToClient)
                .collect(Collectors.toList());
    }

    public List<SurveyMetadata> getSubQuestionsLevel1(String conceptId, String answerConceptId, String surveyConceptId) {
        return surveyMetadataDao.getSubQuestionsLevel1(conceptId, answerConceptId, surveyConceptId)
                .stream()
                .map(surveyMetadataMapper::dbModelToClient)
                .collect(Collectors.toList());
    }

    public List<SurveyMetadata> getSubQuestionsLevel2(String answerConceptId){
        return surveyMetadataDao.getSubQuestionsLevel2(String.valueOf(answerConceptId))
                .stream()
                .map(surveyMetadataMapper::dbModelToClient)
                .collect(Collectors.toList());
    }
}