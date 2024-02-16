package org.pmiops.workbench.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.pmiops.workbench.model.SurveyMetadata;
import org.pmiops.workbench.cdr.SurveyMetadataMapper;
import org.pmiops.workbench.cdr.dao.SurveyMetadataDao;
import java.util.List;
import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
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
        List<SurveyMetadata> surveyQuestions = surveyMetadataDao.getSurveyQuestions(surveyConceptId).stream()
                .map(surveyMetadataMapper::dbModelToClient)
                .collect(Collectors.toList());
       return surveyQuestions;
    }

    public List<SurveyMetadata> getMatchingSurveyQuestions(Long surveyConceptId, String searchWord) {

        List<SurveyMetadata> matchingQuestions = new ArrayList<>();
        List<SurveyMetadata> matchingTopics = new ArrayList<>();

        Pattern regex = Pattern.compile("[$&+,:;=\\\\?@#|/'<>.^*()%!-]");

        System.out.println("HERE ?????????");
        System.out.println(searchWord);

        if (regex.matcher(searchWord).find()) {
            matchingQuestions = surveyMetadataDao.getMatchingSurveyQuestionsSpecial(surveyConceptId, searchWord).stream()
                    .map(surveyMetadataMapper::dbModelToClient)
                    .collect(Collectors.toList());
            matchingTopics = surveyMetadataDao.getMatchingSurveyQuestionTopicsSpecial(surveyConceptId, searchWord).stream()
                    .map(surveyMetadataMapper::dbModelToClient)
                    .collect(Collectors.toList());
        } else {
            matchingQuestions = surveyMetadataDao.getMatchingSurveyQuestions(surveyConceptId, searchWord).stream()
                    .map(surveyMetadataMapper::dbModelToClient)
                    .collect(Collectors.toList());
            matchingTopics = surveyMetadataDao.getMatchingSurveyQuestionTopics(surveyConceptId, searchWord).stream()
                    .map(surveyMetadataMapper::dbModelToClient)
                    .collect(Collectors.toList());
        }


        matchingQuestions.addAll(matchingTopics);

        matchingQuestions.sort(Comparator.comparing(SurveyMetadata::getId));

        return matchingQuestions;
    }

    public List<SurveyMetadata> getSubQuestions(Long surveyConceptId, Long questionConceptId, Long answerConceptId, String path){
        return surveyMetadataDao.getSubQuestions(surveyConceptId, questionConceptId, answerConceptId, path)
                .stream()
                .map(surveyMetadataMapper::dbModelToClient)
                .collect(Collectors.toList());
    }
}