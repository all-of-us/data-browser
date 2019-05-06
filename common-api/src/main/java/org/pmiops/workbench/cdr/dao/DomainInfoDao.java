package org.pmiops.workbench.cdr.dao;

import java.util.List;
import org.pmiops.workbench.cdr.model.DomainInfo;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

public interface DomainInfoDao extends CrudRepository<DomainInfo, Long> {

  // TODO: consider not using @Query since it doesn't let us re-use shared SQL expressions for these methods?

  /**
   * Returns domain metadata and concept counts for domains, matching standard concepts by name
   * and all concepts by code or concept ID. standardConceptCount is populated; allConceptCount
   * and participantCount are not needed and set to zero.
   * @param matchExpression a boolean full text match expression based on the user's query; see
   *                https://dev.mysql.com/doc/refman/5.7/en/fulltext-boolean.html
   * @param query the exact query that the user entered
   * @param conceptId the converted ID value for the query, or null
   */
  @Query(nativeQuery=true,
      value="select " +
      "d.domain, d.domain_id, d.name, d.description, d.concept_id, " +
      "0 all_concept_count, c.count standard_concept_count, d.participant_count participant_count " +
      "from domain_info d " +
      "join " +
      "(select c1.domain_id, count(*) as count " +
      "from " +
      "(select domain_id, concept_id from concept " +
      "where (count_value > 0 or source_count_value > 0) and " +
      "match(concept_name, concept_code, vocabulary_id, synonyms) against (?1 in boolean mode) > 0 and " +
      "standard_concept IN ('S', 'C') and can_select=1 " +
      "UNION DISTINCT " +
      "select domain_id, concept_id from concept " +
      "where concept_id = ?3 or concept_code = ?2 and can_select=1 " +
      "UNION DISTINCT " +
      "select c.domain_id, c.concept_id from concept c join criteria cr on c.concept_id=cr.concept_id " +
      "where cr.type = 'DRUG' and cr.subtype in ('BRAND') and cr.is_selectable = 1 " +
      "and match(cr.name, cr.code) against(?1 in boolean mode) > 0) c1 " +
      "group by c1.domain_id) c " +
      "ON d.domain_id = c.domain_id " +
      "order by d.domain_id")
  List<DomainInfo> findStandardOrCodeMatchConceptCounts(String matchExpression, String query, Long conceptId);

  /**
   * Returns domain metadata and concept counts for domains, matching only standard concepts by name,
   * code, or concept ID. standardConceptCount is populated; allConceptCount
   * and participantCount are not needed and set to zero.
   * @param matchExpression a boolean full text match expression based on the user's query; see
   *                https://dev.mysql.com/doc/refman/5.7/en/fulltext-boolean.html
   */
  @Query(value="select new org.pmiops.workbench.cdr.model.DomainInfo(\n" +
      "d.domain, d.domainId, d.name, d.description,\n" +
      "d.conceptId, 0L, COUNT(*), 0L)\n" +
      "from DomainInfo d\n" +
      "join Concept c ON d.domainId = c.domainId\n" +
      "where (c.countValue > 0 or c.sourceCountValue > 0) \n" +
      "and matchConcept(c.conceptName, c.conceptCode, c.vocabularyId, c.synonymsStr, ?1) > 0 and\n" +
      "c.standardConcept IN ('S', 'C') and c.canSelect=1\n" +
      "group by d.domain, d.domainId, d.name, d.description, d.conceptId\n" +
      "order by d.domainId")
  List<DomainInfo> findStandardConceptCounts(String matchExpression);

  /**
   * Returns domain metadata and concept counts for domains, matching both standard and non-standard
   * concepts by name, code, or concept ID. allConceptCount is populated; standardConceptCount
   * and participantCount are not needed and set to zero.
   * @param matchExpression a boolean full text match expression based on the user's query; see
   *                https://dev.mysql.com/doc/refman/5.7/en/fulltext-boolean.html
   */
  @Query(value="select new org.pmiops.workbench.cdr.model.DomainInfo(\n" +
      "d.domain, d.domainId, d.name, d.description,\n" +
      "d.conceptId, COUNT(*), 0L, 0L)\n" +
      "from DomainInfo d\n" +
      "join Concept c ON d.domainId = c.domainId\n" +
      "where (c.countValue > 0 or c.sourceCountValue > 0) \n" +
      "and matchConcept(c.conceptName, c.conceptCode, c.vocabularyId, c.synonymsStr, ?1) > 0\n" +
          "and c.canSelect = 1\n"+
      "group by d.domain, d.domainId, d.name, d.description, d.conceptId\n" +
      "order by d.domainId")
  List<DomainInfo> findAllMatchConceptCounts(String matchExpression);

  List<DomainInfo> findByOrderByDomainId();
}
