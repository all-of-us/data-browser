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
  @Query(nativeQuery=true, value="select m.name, m.description, m.concept_id, COUNT(DISTINCT a.concept_id) as question_count, m.participant_count, m.order_number, m.can_show from \n" +
  "survey_module m join survey_question_map sqm2 on m.concept_id = sqm2.survey_concept_id join \n" +
  "(select distinct c.* from concept c join survey_question_map sqm on c.concept_id=sqm.question_concept_id \n" +
  "join achilles_results ar on sqm.question_concept_id=ar.stratum_2 and ar.analysis_id=3110 and (match(c.concept_name) against (?1 in boolean mode) > 0 or match(ar.stratum_4) against(?1 in boolean mode) > 0) \n" +
  "and sqm.sub=0 union distinct \n" +
  "select distinct c.* from concept c where concept_id in (select distinct SUBSTRING_INDEX(sqm.path, '.', 1) from survey_question_map sqm \n" +
  "join achilles_results ar on sqm.question_concept_id=ar.stratum_2 and ar.analysis_id=3110 \n" +
  "where (match(sqm.question_text) against (?1 in boolean mode) > 0 or match(ar.stratum_4) against(?1 in boolean mode) > 0) and sqm.sub=1)) a \n" +
  "on sqm2.question_concept_id=a.concept_id group by m.name, m.description, m.concept_id order by m.order_number")
  List<SurveyModule> findSurveyModuleQuestionCounts(String matchExpression);

  SurveyModule findByConceptId(long conceptId);

  List<SurveyModule> findByCanShowNotOrderByOrderNumberAsc(int canShow);
}
