package org.pmiops.workbench.cdr.dao;
import org.pmiops.workbench.cdr.model.QuestionConcept;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface QuestionConceptDao extends CrudRepository<QuestionConcept, Long> {
    @Query(nativeQuery=true, value="select * from question_concept where survey_concept_id=?1 and generate_counts=1 and sub=0")
    List<QuestionConcept> getSurveyQuestions(Long survey_concept_id);

    @Query(nativeQuery=true, value="select * from question_concept where concept_id in \n" +
            "(select distinct SUBSTRING_INDEX(SUBSTRING_INDEX(path,'.',1),'.',-1) from question_concept where survey_concept_id=?1 and (match(question_string) against(?2 in boolean mode) > 0 or match(concept_name) against(?2 in boolean mode) > 0));")
    List<QuestionConcept> getMatchingSurveyQuestions(Long survey_concept_id, String search_word);

    @Query(nativeQuery=true, value="select distinct * from question_concept c where concept_id in (?1) or SUBSTRING_INDEX(path, '.', 1) in (?1)")
    List<QuestionConcept> getFMHQuestions(List<String> questionConceptIds);

    @Query(nativeQuery=true, value="select distinct * from question_concept where sub=1 and \n" +
            "SUBSTRING_INDEX(SUBSTRING_INDEX(path, '.', 2), '.', -1)=?1")
    List<QuestionConcept> getSubQuestionsLevel1(String answerConceptId);

    @Query(nativeQuery=true, value="select distinct * from question_concept where sub=1 and \n" +
            "SUBSTRING_INDEX(SUBSTRING_INDEX(path, '.', 4), '.', -1)=?1")
    List<QuestionConcept> getSubQuestionsLevel2(String answerConceptId);
}
