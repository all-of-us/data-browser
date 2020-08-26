package org.pmiops.workbench.cdr.dao;
import org.pmiops.workbench.cdr.model.QuestionConcept;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface QuestionConceptDao extends CrudRepository<QuestionConcept, Long> {
    @Query(nativeQuery=true, value="select * from question_concept where survey_concept_id=?1 and generate_counts=1")
    List<QuestionConcept> getSurveyQuestions(Long survey_concept_id);

    @Query(nativeQuery=true, value="select distinct * from question_concept c where concept_id in (?1) or SUBSTRING_INDEX(path, '.', 1) in (?1)")
    List<QuestionConcept> getFMHQuestions(List<String> questionConceptIds);
}
