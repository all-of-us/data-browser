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
      "join (" +
      "  select c1.domain_id, count(*) as count " +
      "  from (" +
      "    (select domain_id, concept_id from concept " +
      "     where has_counts > 0 and " +
      "       match(concept_name, concept_code, vocabulary_id, synonyms) against (?1 in boolean mode) > 0 and " +
      "       standard_concept IN ('S', 'C') and can_select=1) " +
      // An OR of these different conditions would be easier, but MySQL will not leverage the full
      // text index to perform the match, bringing performance to a crawl (~10ms vs ~8s). Using the
      // union results in usage of the fulltext index in the first subquery. In the future we should
      // move these searches to a more suitable technology, e.g. Elasticsearch.
      "    UNION DISTINCT " +
      "    (select domain_id, concept_id from concept " +
      "     where (concept_id in (?3) or concept_code = ?2) and can_select=1 and has_counts=1)) c1 " +
      "  group by c1.domain_id) c " +
      "ON d.domain_id = c.domain_id and d.domain != 4" +
      "    UNION DISTINCT " +
      "    select domain,domain_id,name,description,concept_id,8 as all_concept_count," +
      "    (select count(*) from achilles_results where analysis_id=100 and stratum_2 like CONCAT('%', ?2, '%')) as standard_concept_count,participant_count" +
      "    from domain_info where domain=8" +
      "    UNION DISTINCT\n" +
      "    select d.domain, d.domain_id, d.name, d.description, d.concept_id,\n" +
      "    0 all_concept_count, c.count standard_concept_count, d.participant_count participant_count \n" +
      "    from domain_info d\n" +
      "    join (select c1.domain_id, count(*) as count \n" +
      "    from ((select domain_id, c.concept_id from concept c join measurement_concept_info m on c.concept_id=m.concept_id and m.has_values = ?4\n" +
      "    where has_counts > 0 and\n" +
      "    match(concept_name, concept_code, vocabulary_id, synonyms) against (?1 in boolean mode) > 0 and \n" +
      "    standard_concept IN ('S', 'C') and can_select=1)\n" +
      "    UNION DISTINCT\n" +
      "    (select domain_id, concept_id from concept\n" +
      "    where (concept_id in (?3) or concept_code = ?2) and can_select=1 and has_counts=1)) c1 \n" +
      "    group by c1.domain_id) c ON d.domain_id = c.domain_id where d.domain = 4\n" +
              "order by domain_id")
  List<DomainInfo> findStandardOrCodeMatchConceptCounts(String matchExpression, String query, List<Long> conceptIds, int hasValues);

  @Query(nativeQuery=true,
          value="select " +
                  "d.domain, d.domain_id, d.name, d.description, d.concept_id, " +
                  "0 all_concept_count, c.count standard_concept_count, d.participant_count participant_count " +
                  "from domain_info d " +
                  "join (" +
                  "  select c1.domain_id, count(*) as count " +
                  "  from (" +
                  "    (select domain_id, concept_id from concept " +
                  "     where has_counts > 0 and " +
                  "       match(concept_name, concept_code, vocabulary_id, synonyms) against (?1 in boolean mode) > 0 and " +
                  "       standard_concept IN ('S', 'C') and can_select=1) " +
                  // An OR of these different conditions would be easier, but MySQL will not leverage the full
                  // text index to perform the match, bringing performance to a crawl (~10ms vs ~8s). Using the
                  // union results in usage of the fulltext index in the first subquery. In the future we should
                  // move these searches to a more suitable technology, e.g. Elasticsearch.
                  "    UNION DISTINCT " +
                  "    (select domain_id, concept_id from concept " +
                  "     where (concept_id in (?3) or concept_code = ?2) and can_select=1 and has_counts=1)) c1 " +
                  "  group by c1.domain_id) c " +
                  "ON d.domain_id = c.domain_id and d.domain != 4" +
                  "    UNION DISTINCT " +
                  "    select domain,domain_id,name,description,concept_id,8 as all_concept_count," +
                  "    (select count(*) from achilles_results where analysis_id=100 and stratum_2 like CONCAT('%', ?2, '%')) as standard_concept_count,participant_count" +
                  "    from domain_info where domain=8" +
                  "    UNION DISTINCT\n" +
                  "    select d.domain, d.domain_id, d.name, d.description, d.concept_id,\n" +
                  "    0 all_concept_count, c.count standard_concept_count, d.participant_count participant_count \n" +
                  "    from domain_info d\n" +
                  "    join (select c1.domain_id, count(*) as count \n" +
                  "    from ((select domain_id, c.concept_id from concept c\n" +
                  "    where has_counts > 0 and\n" +
                  "    match(concept_name, concept_code, vocabulary_id, synonyms) against (?1 in boolean mode) > 0 and \n" +
                  "    standard_concept IN ('S', 'C') and can_select=1)\n" +
                  "    UNION DISTINCT\n" +
                  "    (select domain_id, concept_id from concept\n" +
                  "    where (concept_id in (?3) or concept_code = ?2) and can_select=1 and has_counts=1)) c1 \n" +
                  "    group by c1.domain_id) c ON d.domain_id = c.domain_id where d.domain = 4\n" +
                  "order by domain_id")
  List<DomainInfo> findStandardOrCodeMatchConceptCountsWithNoFilter(String matchExpression, String query, List<Long> conceptIds);

  @Query(nativeQuery=true,
          value="select " +
                  "d.domain, d.domain_id, d.name, d.description, d.concept_id, " +
                  "0 all_concept_count, c.count standard_concept_count, d.participant_count participant_count " +
                  "from domain_info d " +
                  "join (" +
                  "  select c1.domain_id, count(*) as count " +
                  "  from (" +
                  "    (select domain_id, concept_id from concept " +
                  "     where has_counts > 0 and " +
                  "       match(concept_name, concept_code, vocabulary_id, synonyms) against (?1 in boolean mode) > 0 and " +
                  "       standard_concept IN ('S', 'C') and can_select=1) " +
                  // An OR of these different conditions would be easier, but MySQL will not leverage the full
                  // text index to perform the match, bringing performance to a crawl (~10ms vs ~8s). Using the
                  // union results in usage of the fulltext index in the first subquery. In the future we should
                  // move these searches to a more suitable technology, e.g. Elasticsearch.
                  "    UNION DISTINCT " +
                  "    (select domain_id, concept_id from concept " +
                  "     where (concept_id in (?3) or concept_code = ?2) and can_select=1 and has_counts=1)) c1 " +
                  "  group by c1.domain_id) c " +
                  "ON d.domain_id = c.domain_id and d.domain != 4" +
                  "    UNION DISTINCT " +
                  "    select domain,domain_id,name,description,concept_id,8 as all_concept_count," +
                  "    (select count(*) from achilles_results where analysis_id=100 and stratum_2 like CONCAT('%', ?2, '%')) as standard_concept_count,participant_count" +
                  "    from domain_info where domain=8" +
                  "    UNION DISTINCT\n" +
                  "    select d.domain, d.domain_id, d.name, d.description, d.concept_id,\n" +
                  "    0 all_concept_count, 0 standard_concept_count, d.participant_count participant_count \n" +
                  "    from domain_info d where d.domain = 4 order by domain_id")
  List<DomainInfo> findStandardOrCodeMatchConceptCountsWithoutMeasurementCounts(String matchExpression, String query, List<Long> conceptIds);

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

  @Query(nativeQuery=true,
          value = "select d.domain, d.domain_id, d.name, d.description, d.concept_id, 0 all_concept_count," +
          "c.count standard_concept_count, d.participant_count participant_count from domain_info d " +
          "join (" +
          "select c.domain_id, count(*) as count from concept c join measurement_concept_info m on c.concept_id=m.concept_id and has_values = ?1 " +
          "where standard_concept in ('S', 'C') and can_select=1 group by domain_id) c " +
          "on d.domain_id=c.domain_id and d.domain=4")
  DomainInfo findMeasurementDomainTotalsWithFilter(int valueFilter);

  @Query(nativeQuery=true,
          value = "select d.domain, d.domain_id, d.name, d.description, d.concept_id, 0 all_concept_count," +
                  "c.count standard_concept_count, d.participant_count participant_count from domain_info d " +
                  "join (" +
                  "select c.domain_id, count(*) as count from concept c " +
                  "where standard_concept in ('S', 'C') and can_select=1 group by domain_id) c " +
                  "on d.domain_id=c.domain_id and d.domain=4")
  DomainInfo findMeasurementDomainTotalsWithoutFilter();

  List<DomainInfo> findByConceptIdNotOrderByDomainId(long conceptId);

  DomainInfo findByConceptId(long conceptId);
}
