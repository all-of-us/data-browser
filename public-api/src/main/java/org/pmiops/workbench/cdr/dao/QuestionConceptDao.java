package org.pmiops.workbench.cdr.dao;
import org.pmiops.workbench.cdr.model.QuestionConcept;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface QuestionConceptDao extends CrudRepository<QuestionConcept, Long> {
    @Query("select distinct q from QuestionConcept q join SurveyQuestionMap sqm on sqm.questionConceptId=q.conceptId and sqm.surveyConceptId=?1)")
    List<QuestionConcept> findSurveyQuestions(long surveyConceptId);
}
