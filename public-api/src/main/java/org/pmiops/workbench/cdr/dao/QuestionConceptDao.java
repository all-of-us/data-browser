package org.pmiops.workbench.cdr.dao;
import org.pmiops.workbench.cdr.model.QuestionConcept;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface QuestionConceptDao extends CrudRepository<QuestionConcept, Long> {
    @Query(nativeQuery=true, value="select * from question_concept where survey_concept_id=?1 and generate_counts=1 and sub=0")
    List<QuestionConcept> getSurveyQuestions(Long survey_concept_id);

    @Query(nativeQuery=true, value="select * from question_concept q join survey_concept_id s on q.survey_concept_id=s.concept_id" +
            "where q.concept_id in \n" +
            "(select distinct SUBSTRING_INDEX(SUBSTRING_INDEX(path,'.',1),'.',-1) from question_concept where survey_concept_id=?1 and (match(question_string) against(?2 in boolean mode) > 0 or match(concept_name) against(?2 in boolean mode) > 0)) and generate_counts=1 and can_show=0;")
    List<QuestionConcept> getMatchingSurveyQuestions(Long survey_concept_id, String search_word);

    @Query(nativeQuery=true, value="select distinct * from question_concept c where concept_id in (?1)")
    List<QuestionConcept> getFMHQuestions(List<String> questionConceptIds);

    @Query(nativeQuery=true, value="select distinct c.* from question_concept c where concept_id in (?1) and (match(concept_name) against(?2 in boolean mode) > 0 or match(question_string) against(?2 in boolean mode) > 0)\n" +
            "union distinct\n" +
            "select distinct c.* from question_concept c join \n" +
            "achilles_results ar1 on c.concept_id=ar1.stratum_2\n" +
            "join question_concept ar2 on ar1.stratum_3=ar2.concept_id\n" +
            "where ar1.stratum_2 in (?1) and ar1.analysis_id=3110 \n" +
            "and (match(ar2.concept_name) against(?2 in boolean mode) > 0 or match(ar2.question_string) against(?2 in boolean mode) > 0);")
    List<QuestionConcept> getMatchingFMHQuestions(List<String> questionConceptIds, String search_word);

    @Query(nativeQuery=true, value="select distinct * from question_concept where sub=1 and SUBSTRING_INDEX(SUBSTRING_INDEX(path, '.', 1), '.', -1)=?1 and \n" +
            "SUBSTRING_INDEX(SUBSTRING_INDEX(path, '.', 2), '.', -1)=?2 and survey_concept_id=?3 and LENGTH(path) - LENGTH(REPLACE(path, '.', ''))=2")
    List<QuestionConcept> getSubQuestionsLevel1(String questionConceptId, String answerConceptId, String surveyConceptId);

    @Query(nativeQuery=true, value="select distinct * from question_concept where sub=1 and \n" +
            "SUBSTRING_INDEX(SUBSTRING_INDEX(path, '.', 4), '.', -1)=?1 and LENGTH(path) - LENGTH(REPLACE(path, '.', ''))=4")
    List<QuestionConcept> getSubQuestionsLevel2(String answerConceptId);
}
