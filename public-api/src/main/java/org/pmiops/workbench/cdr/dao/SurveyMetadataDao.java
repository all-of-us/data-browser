package org.pmiops.workbench.cdr.dao;
import org.pmiops.workbench.cdr.model.DbSurveyMetadata;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface SurveyMetadataDao extends CrudRepository<DbSurveyMetadata, Long> {
    @Query(nativeQuery=true, value="select * from survey_metadata where survey_concept_id=?1 and (generate_counts=1 or type='TOPIC') and sub=0 order by id asc")
    List<DbSurveyMetadata> getSurveyQuestions(Long survey_concept_id);

    @Query(nativeQuery=true, value="select * from survey_metadata where concept_id in \n" +
            "(select distinct SUBSTRING_INDEX(SUBSTRING_INDEX(path,'.',1),'.',-1) from survey_metadata where survey_concept_id=?1 and (match(question_string) against(?2 in boolean mode) > 0 or match(concept_name) against(?2 in boolean mode) > 0)) and generate_counts=1;")
    List<DbSurveyMetadata> getMatchingSurveyQuestions(Long survey_concept_id, String search_word);

    @Query(nativeQuery = true, value="select distinct b.* from survey_metadata a \n" +
            "JOIN survey_metadata b\n" +
            "    ON b.id =\n" +
            "       ( SELECT c.id\n" +
            "         FROM survey_metadata c\n" +
            "         WHERE c.id < a.id and c.survey_concept_id = a.survey_concept_id and c.type='TOPIC'\n" +
            "         ORDER BY c.id DESC\n" +
            "         LIMIT 1\n" +
            "       ) \n" +
            "where a.concept_id in \n" +
            "(select distinct SUBSTRING_INDEX(SUBSTRING_INDEX(path,'.',1),'.',-1) from survey_metadata where survey_concept_id=?1 and (match(question_string) \n" +
            "against(?2 in boolean mode) > 0 or match(concept_name) against(?2 in boolean mode) > 0)) and a.generate_counts=1 order by b.id asc;")
    List<DbSurveyMetadata> getMatchingSurveyQuestionTopics(Long surveyConceptId, String searchWord);

    @Query(nativeQuery=true, value="select distinct * from survey_metadata c where concept_id in (?1)")
    List<DbSurveyMetadata> getFMHQuestions(List<String> questionConceptIds);

    @Query(nativeQuery=true, value="select distinct c.* from survey_metadata c where concept_id in (?1) and (match(concept_name) against(?2 in boolean mode) > 0 or match(question_string) against(?2 in boolean mode) > 0)\n" +
            "union distinct\n" +
            "select distinct c.* from survey_metadata c join \n" +
            "achilles_results ar1 on c.concept_id=ar1.stratum_2\n" +
            "join survey_metadata ar2 on ar1.stratum_3=ar2.concept_id\n" +
            "where ar1.stratum_2 in (?1) and ar1.analysis_id=3110 \n" +
            "and (match(ar2.concept_name) against(?2 in boolean mode) > 0 or match(ar2.question_string) against(?2 in boolean mode) > 0);")
    List<DbSurveyMetadata> getMatchingFMHQuestions(List<String> questionConceptIds, String search_word);

    @Query(nativeQuery=true, value="select distinct b.* from survey_metadata a \n" +
            "JOIN survey_metadata b\n" +
            "    ON b.id =\n" +
            "       ( SELECT c.id\n" +
            "         FROM survey_metadata c\n" +
            "         WHERE c.id < a.id and c.survey_concept_id = a.survey_concept_id and c.type='TOPIC'\n" +
            "         ORDER BY c.id DESC\n" +
            "         LIMIT 1\n" +
            "       ) \n" +
            "where a.concept_id in \n" +
            "(?1) and a.generate_counts=0 order by b.id asc")
    List<DbSurveyMetadata> getMatchingFMHTopics(List<Long> questionConceptIds);

    @Query(nativeQuery=true, value="select distinct * from survey_metadata where sub=1 and SUBSTRING_INDEX(SUBSTRING_INDEX(path, '.', 1), '.', -1)=?1 and \n" +
            "SUBSTRING_INDEX(SUBSTRING_INDEX(path, '.', 2), '.', -1)=?2 and survey_concept_id=?3 and LENGTH(path) - LENGTH(REPLACE(path, '.', ''))=2")
    List<DbSurveyMetadata> getSubQuestionsLevel1(String questionConceptId, String answerConceptId, String surveyConceptId);

    @Query(nativeQuery=true, value="select distinct * from survey_metadata where sub=1 and SUBSTRING_INDEX(SUBSTRING_INDEX(path, '.', 3), '.', -1)=?1\n" +
            "SUBSTRING_INDEX(SUBSTRING_INDEX(path, '.', 4), '.', -1)=?2 and LENGTH(path) - LENGTH(REPLACE(path, '.', ''))=4")
    List<DbSurveyMetadata> getSubQuestionsLevel2(String questionConceptId, String answerConceptId);
}
