package org.pmiops.workbench.cdr.dao;
import org.pmiops.workbench.cdr.model.QuestionConcept;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface QuestionConceptDao extends CrudRepository<QuestionConcept, Long> {

    @Query(nativeQuery=true, value="SELECT c.concept_id,c.concept_name,c.domain_id,c.vocabulary_id,c.concept_code,c.count_value,c.prevalence from\n" +
            "concept c \n" +
            "join achilles_results ar on ar.stratum_2=c.concept_id\n" +
            "join survey_question_map sqm on sqm.question_concept_id=ar.stratum_2\n" +
            "where ar.stratum_1=?1 and ar.analysis_id=3110\n" +
            "group by c.concept_id,c.concept_name,c.domain_id,c.vocabulary_id,c.concept_code,c.count_value,c.prevalence,sqm.question_order_number \n" +
            "order by sqm.question_order_number asc")
    List<QuestionConcept> findSurveyQuestions(String survey_concept_id);

    @Query(nativeQuery=true, value="select c.concept_id,c.concept_name,c.domain_id,c.vocabulary_id,c.concept_code,c.count_value,c.prevalence from \n" +
        "concept c join survey_question_map sqm on sqm.question_concept_id=c.concept_id \n" +
        "and sqm.path like concat('%',?1,'%') and LENGTH(sqm.path) - LENGTH(REPLACE(sqm.path, '.', '')) = ?2 \n" +
        "group by c.concept_id,c.concept_name,c.domain_id,c.vocabulary_id,c.concept_code,c.count_value,c.prevalence,sqm.id \n" +
        "order by sqm.id asc")
    List<QuestionConcept> findSubSurveyQuestions(String matchPath, int level);


    @Query(nativeQuery=true, value="select distinct c.concept_id,c.concept_name,c.domain_id,c.vocabulary_id,c.concept_code,c.count_value,c.prevalence from concept c join achilles_results \n" +
            "ar on c.concept_id=ar.stratum_2 where ar.stratum_1=?1 and ar.stratum_2=?2 and ar.analysis_id=3110")
    List<QuestionConcept> findFMHConditionSubQuestions(String surveyConceptId, String questionConceptId);


    @Query(nativeQuery=true, value="select c.concept_id,c.concept_name,c.domain_id,c.vocabulary_id,c.concept_code,c.count_value,c.prevalence from\n" +
            "concept c join survey_question_map sqm on sqm.question_concept_id=c.concept_id and sqm.survey_concept_id=?1 and sqm.sub=0\n" +
            "group by c.concept_id,c.concept_name,c.domain_id,c.vocabulary_id,c.concept_code,c.count_value,c.prevalence,sqm.question_order_number \n" +
            "order by sqm.question_order_number asc")
    List<QuestionConcept> getSurveyQuestions(String survey_concept_id);

    @Query(nativeQuery=true, value="select c.concept_id, c.concept_name, c.domain_id, c.vocabulary_id, c.concept_code, c.count_value, c.prevalence from \n" +
            "concept c where concept_id in (?1)")
    List<QuestionConcept> getFMHQuestions(List<String> questionConceptIds);

    @Query(nativeQuery=true, value="select distinct c.* from concept c \n" +
            "join achilles_results ar on c.concept_id=ar.stratum_2 and ar.analysis_id=3110 and (match(c.concept_name) against (?2 in boolean mode) > 0 or match(ar.stratum_4) against(?2 in boolean mode) > 0) \n" +
            "where concept_id in (?1)\n" +
            "union distinct\n" +
            "select distinct c2.* from achilles_results ar1 join achilles_results ar2 on ar1.stratum_2 = ar2.stratum_3 and ar1.stratum_1=ar2.stratum_1 and ar1.stratum_1='43528698'\n" +
            "join concept c1 on c1.concept_id=ar1.stratum_3 join concept c2 on c2.concept_id=ar2.stratum_2 \n" +
            "and ar2.stratum_2 in (?1)\n" +
            "where (match(c1.concept_name) against(?2 in boolean mode) > 0 or match(c2.concept_name) against(?2 in boolean mode) > 0);")
    List<QuestionConcept> getMatchingFMHQuestions(List<Long> questionConceptIds, String search_word);


    @Query(nativeQuery=true, value="select distinct c.* from concept c join survey_question_map sqm on c.concept_id=sqm.question_concept_id and sqm.survey_concept_id=?1 \n" +
            "join achilles_results ar on sqm.question_concept_id=ar.stratum_2 and ar.analysis_id=3110 and (match(c.concept_name) against (?2 in boolean mode) > 0 or match(ar.stratum_4) against(?2 in boolean mode) > 0) \n" +
            "and sqm.sub=0 union distinct \n" +
            "select distinct c.* from concept c where concept_id in (select distinct SUBSTRING_INDEX(sqm.path, '.', 1) from survey_question_map sqm \n" +
            "join achilles_results ar on sqm.question_concept_id=ar.stratum_2 and ar.analysis_id=3110 and sqm.survey_concept_id=?1 \n" +
            "where (match(sqm.question_text) against (?2 in boolean mode) > 0 or match(ar.stratum_4) against(?2 in boolean mode) > 0) and sqm.sub=1)")
    List<QuestionConcept> getMatchingSurveyQuestions(String survey_concept_id, String search_word);

    @Query(nativeQuery=true, value="select distinct c.* from concept c join survey_question_map sqm on sqm.question_concept_id=c.concept_id \n" +
            "and match(sqm.path) against(?2 in boolean mode) > 0 and sub=1 and sqm.survey_concept_id=?1")
    List<QuestionConcept> getSubQuestions(String survey_concept_id, String question_concept_id);
}
