package org.pmiops.workbench.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.pmiops.workbench.model.QuestionConcept;
import org.pmiops.workbench.cdr.QuestionConceptMapper;
import org.pmiops.workbench.cdr.dao.QuestionConceptDao;
import java.util.List;
import java.util.stream.Collectors;


@Service
public class QuestionConceptService {
    private QuestionConceptDao questionConceptDao;
    private QuestionConceptMapper questionConceptMapper;

    @Autowired
    public QuestionConceptService(QuestionConceptDao questionConceptDao, QuestionConceptMapper questionConceptMapper) {
        this.questionConceptDao = questionConceptDao;
        this.questionConceptMapper = questionConceptMapper;
    }

    public List<QuestionConcept> getSurveyQuestions(Long surveyConceptId) {
       return questionConceptDao.getSurveyQuestions(surveyConceptId).stream()
                .map(questionConceptMapper::dbModelToClient)
                .collect(Collectors.toList());
    }

    public List<QuestionConcept> getMatchingSurveyQuestions(Long surveyConceptId, String searchWord) {
        return questionConceptDao.getMatchingSurveyQuestions(surveyConceptId, searchWord).stream()
                .map(questionConceptMapper::dbModelToClient)
                .collect(Collectors.toList());
    }

    public List<QuestionConcept> getFMHQuestions(List<String> questionConceptIds) {
        return questionConceptDao.getFMHQuestions(questionConceptIds).stream()
                .map(questionConceptMapper::dbModelToClient)
                .collect(Collectors.toList());
    }

    public List<QuestionConcept> getMatchingFMHQuestions(List<String> questionConceptIds, String searchWord) {
        return questionConceptDao.getMatchingFMHQuestions(questionConceptIds, searchWord)
                .stream()
                .map(questionConceptMapper::dbModelToClient)
                .collect(Collectors.toList());
    }

    public List<QuestionConcept> getSubQuestionsLevel1(String questionConceptId, String answerConceptId, String surveyConceptId) {
        return questionConceptDao.getSubQuestionsLevel1(questionConceptId, answerConceptId, surveyConceptId)
                .stream()
                .map(questionConceptMapper::dbModelToClient)
                .collect(Collectors.toList());
    }

    public List<QuestionConcept> getSubQuestionsLevel2(String answerConceptId){
        return questionConceptDao.getSubQuestionsLevel2(String.valueOf(answerConceptId))
                .stream()
                .map(questionConceptMapper::dbModelToClient)
                .collect(Collectors.toList());
    }


}