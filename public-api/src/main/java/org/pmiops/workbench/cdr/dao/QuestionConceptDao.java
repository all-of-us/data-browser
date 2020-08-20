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

    @Query(nativeQuery=true, value="select c.concept_id,c.concept_name,c.domain_id,c.synonyms,c.concept_code,c.count_value,c.prevalence, 0 as match_type from \n" +
            "question_concept c join survey_question_map sqm on sqm.question_concept_id=c.concept_id \n" +
            "and sqm.path like concat('%',?1,'%') and LENGTH(sqm.path) - LENGTH(REPLACE(sqm.path, '.', '')) = ?2 " +
            "and sqm.generate_counts=1\n" +
            "group by c.concept_id,c.concept_name,c.domain_id,c.synonyms,c.concept_code,c.count_value,c.prevalence,sqm.id \n" +
            "order by sqm.id asc")
    List<QuestionConcept> findSubSurveyQuestions(String matchPath, int level);


    @Query(nativeQuery=true, value="select distinct c.concept_id,c.concept_name,c.survey_name,c.synonyms,c.concept_code,c.count_value,c.prevalence, 0 as match_type from question_concept c join achilles_results \n" +
            "ar on c.concept_id=ar.stratum_2 where ar.stratum_1=?1 and ar.stratum_2=?2 and ar.analysis_id=3110")
    List<QuestionConcept> findFMHConditionSubQuestions(String surveyConceptId, String questionConceptId);


    @Query(nativeQuery=true, value="select c.concept_id,c.concept_name,c.domain_id,c.synonyms,c.concept_code,c.count_value,c.prevalence, 1 as match_type from \n" +
            "question_concept c join survey_question_map sqm on sqm.question_concept_id=c.concept_id and sqm.survey_concept_id=?1 and sqm.sub=0 and sqm.generate_counts=1 \n" +
            "group by c.concept_id,c.concept_name,c.domain_id,c.synonyms,c.concept_code,c.count_value,c.prevalence,sqm.question_order_number \n" +
            "order by sqm.question_order_number asc")
    List<QuestionConcept> getSurveyQuestions(String survey_concept_id);

    @Query(nativeQuery=true, value="select * from question_concept where survey_concept_id=?1 and generate_counts=1")
    List<QuestionConcept> getSurveyQuestionsRe(Long survey_concept_id);

    @Query(nativeQuery=true, value="select c.concept_id, c.concept_name, c.survey_name, c.synonyms, c.concept_code, c.count_value, c.prevalence, 1 as match_type from \n" +
            "question_concept c where concept_id in (?1)")
    List<QuestionConcept> getFMHQuestions(List<String> questionConceptIds);

    @Query(nativeQuery=true, value="select distinct * from question_concept c where concept_id in (?1) or SUBSTRING_INDEX(path, '.', 1) in (?1)")
    List<QuestionConcept> getFMHQuestionsRe(List<String> questionConceptIds);

    @Query(nativeQuery=true, value="select c.concept_id, c.concept_name, c.domain_id, c.synonyms, c.concept_code, c.count_value, c.prevalence, 1 as match_type from question_concept c where concept_id in (?1) and match(concept_name) against(?2 in boolean mode) > 0\n" +
            "union distinct\n" +
            "select * from question_concept c where concept_id in\n" +
            "(select distinct stratum_2 from achilles_results ar \n" +
            "where ar.stratum_1='43528698' and ar.stratum_2 in (?1) and ar.analysis_id=3110\n" +
            "and match(stratum_4) against(?2 in boolean mode) > 0)\n" +
            "union distinct\n" +
            "select distinct c.concept_id, c.concept_name, c.survey_name, c.synonyms, c.concept_code, c.count_value, c.prevalence, 0 as natch_type from question_concept c join \n" +
            "achilles_results ar1 on c.concept_id=ar1.stratum_2\n" +
            "join achilles_results ar2 on ar1.stratum_3=ar2.stratum_2\n" +
            "where ar1.stratum_2 in (?1) and ar1.analysis_id=3110 \n" +
            "and match(ar2.stratum_4) against(?2 in boolean mode) > 0;")
    List<QuestionConcept> getMatchingFMHQuestions(List<Long> questionConceptIds, String search_word);


    @Query(nativeQuery=true, value="select distinct c.concept_id, c.concept_name, c.concept_code, c.domain_id, c.synonyms, c.count_value, c.prevalence, 1 as match_type\n" +
            " from question_concept c join survey_question_map sqm on c.concept_id=sqm.question_concept_id and sqm.survey_concept_id=?1 \n" +
            "join achilles_results ar on sqm.question_concept_id=ar.stratum_2 and ar.analysis_id=3110 and (match(c.concept_name) against (?2 in boolean mode) > 0 or match(ar.stratum_4) against(?2 in boolean mode) > 0) \n" +
            "and sqm.sub=0 and sqm.generate_counts=1 union distinct \n" +
            "select distinct c.concept_id, c.concept_name, c.concept_code, c.domain_id, c.synonyms, c.count_value, c.prevalence, 0 as match_type from question_concept c where concept_id in (select distinct SUBSTRING_INDEX(sqm.path, '.', 1) from survey_question_map sqm \n" +
            "join achilles_results ar on sqm.question_concept_id=ar.stratum_2 and ar.analysis_id=3110 and sqm.survey_concept_id=?1 \n" +
            "where (match(sqm.question_text) against (?2 in boolean mode) > 0 or match(ar.stratum_4) against(?2 in boolean mode) > 0) and sqm.sub=1 and sqm.generate_counts=1)")
    List<QuestionConcept> getMatchingSurveyQuestions(String survey_concept_id, String search_word);

    @Query(nativeQuery=true, value="select distinct c.concept_id, c.concept_name, c.domain_id, c.synonyms, c.concept_code, c.count_value, c.prevalence, 0 as match_type from question_concept c join survey_question_map sqm on sqm.question_concept_id=c.concept_id \n" +
            "and match(sqm.path) against(?2 in boolean mode) > 0 and sub=1 and sqm.survey_concept_id=?1")
    List<QuestionConcept> getSubQuestions(String survey_concept_id, String question_concept_id);

    @Query(nativeQuery=true, value="select distinct sqm.path from survey_question_map sqm join achilles_results ar on sqm.path LIKE CONCAT('%', ?1, '%') and LENGTH(sqm.path) - LENGTH(REPLACE(sqm.path, '.', '')) = 4 \n" +
            "JOIN achilles_results ar2 ON sqm.question_concept_id=ar2.stratum_2 and ar2.analysis_id=3110 \n" +
            "where ar.analysis_id=3110 and (match(sqm.question_text) against (?2 in boolean mode) > 0 or match(ar2.stratum_4) against(?2 in boolean mode) > 0)")
    List<String> getMatchingSubResultIds(String conceptId, String search_word);
}
