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

    @Query(nativeQuery=true, value="select distinct * from survey_metadata where sub=1 and survey_concept_id=?1 and \n" +
        "parent_question_concept_id=?2 and parent_answer_concept_id=?3 and path like CONCAT('%', ?4, '%')")
    List<DbSurveyMetadata> getSubQuestions(Long surveyConceptId, Long questionConceptId, Long answerConceptId, String path);
}
