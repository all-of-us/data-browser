package org.pmiops.workbench.cdr.dao;

import java.util.List;
import org.pmiops.workbench.cdr.model.SurveyModule;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

public interface SurveyModuleDao extends CrudRepository<SurveyModule, Long> {

  /**
   * Returns metadata and question counts for survey modules, matching questions by name, code,
   * or concept ID, and answers to questions by string value.
   * @param matchExpression a boolean full text match expression based on the user's query; see
   *                https://dev.mysql.com/doc/refman/5.7/en/fulltext-boolean.html
   */
  @Query(nativeQuery=true,value="select m.name, m.description,\n" +
      "m.concept_id, COUNT(DISTINCT c.concept_id) as question_count,\n" +
      // We don't show participant counts when filtering by keyword, and don't have a way of computing them easily; return 0.
      "0 participant_count\n" +
      "from survey_module m\n" +
      "join achilles_results r on m.concept_id = r.stratum_1\n" +
      "join concept c on r.stratum_2 = c.concept_id\n" +
      "where r.analysis_id = 3110\n" +
      // Because we're using a native query we use MySQL match() here directly instead of matchConcept()
      // TODO: add AchillesResults entity, replace this with JQL
      "and (match(c.concept_name, c.concept_code, c.vocabulary_id, c.synonyms) against (?1 in boolean mode) > 0 or\n" +
      "match(r.stratum_4) against(?1 in boolean mode) > 0)\n" +
      "group by m.name, m.description, m.concept_id\n" +
      "order by m.name")
  List<SurveyModule> findSurveyModuleQuestionCounts(String matchExpression);

  SurveyModule findByConceptId(long conceptId);

  List<SurveyModule> findByOrderByName();
}
