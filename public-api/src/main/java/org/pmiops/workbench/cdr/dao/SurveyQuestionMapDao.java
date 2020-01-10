package org.pmiops.workbench.cdr.dao;
import org.pmiops.workbench.cdr.model.SurveyQuestionMap;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface SurveyQuestionMapDao extends CrudRepository<SurveyQuestionMap, Long> {
    @Query(nativeQuery=true, value="select * from survey_question_map where survey_concept_id=?1")
    List<SurveyQuestionMap> findSurveyQuestionPaths(long surveyConceptId);
}
