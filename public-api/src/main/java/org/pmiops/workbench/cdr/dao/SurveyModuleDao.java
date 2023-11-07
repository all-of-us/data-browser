package org.pmiops.workbench.cdr.dao;

import java.util.List;
import org.pmiops.workbench.cdr.model.DbSurveyModule;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

public interface SurveyModuleDao extends CrudRepository<DbSurveyModule, Long> {

  /**
   * Returns metadata and question counts for survey modules, matching questions by name, code,
   * or concept ID, and answers to questions by string value.
   * @param matchExpression a boolean full text match expression based on the user's query; see
   *                https://dev.mysql.com/doc/refman/5.7/en/fulltext-boolean.html
   */
  @Query(nativeQuery=true, value= "select m.name, m.description, m.concept_id, COUNT(DISTINCT a.concept_id) as question_count, m.participant_count, m.order_number from \n" +
          "survey_module m join survey_metadata sqm2 on m.concept_id = sqm2.survey_concept_id left outer join \n" +
          "(select distinct c.* from survey_metadata c where (match(c.question_string) against (?1 in boolean mode) > 0 or match(c.concept_name) against (?1 in boolean mode) > 0) \n" +
          "and c.sub=0 and c.generate_counts=1\n" +
          "union distinct \n" +
          "select distinct c.* from survey_metadata c where concept_id in (select distinct SUBSTRING_INDEX(sqm.path, '.', 1) from survey_metadata sqm \n" +
          "where (match(sqm.question_string) against (?1 in boolean mode) > 0 or match(sqm.concept_name) against (?1 in boolean mode) > 0) and sqm.sub=1 and sqm.generate_counts=1)\n" +
          "union distinct \n" +
          "SELECT DISTINCT c.*\n" +
          "FROM survey_metadata c\n" +
          "JOIN (\n" +
          "    SELECT DISTINCT SUBSTRING_INDEX(ar.stratum_6, '.', 1) AS question_id\n" +
          "    FROM achilles_results ar\n" +
          "    WHERE ar.analysis_id = 3110\n" +
          "    AND (ar.stratum_3 = ?1 OR ar.stratum_2 = ?1)\n" +
          ") AS subquery\n" +
          "ON c.concept_id = subquery.question_id \n" +
          ") a \n" +
          "on sqm2.concept_id=a.concept_id group by m.name, m.description, m.concept_id order by m.order_number;")
  List<DbSurveyModule> findSurveyModuleQuestionCounts(String matchExpression);

  DbSurveyModule findByConceptId(long conceptId);

  List<DbSurveyModule> findAllByOrderByOrderNumberAsc();
}
