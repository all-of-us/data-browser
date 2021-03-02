package org.pmiops.workbench.cdr.dao;

import org.pmiops.workbench.cdr.model.DbCriteria;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CBCriteriaDao extends CrudRepository<DbCriteria, Long> {
    @Query(value = "select c.id, c.parent_id, c.domain_id, c.is_standard, c.type, c.subtype, c.concept_id, c.code, c.name, c.value, c.est_count, c.is_group, c.is_selectable, c.has_attribute, c.has_hierarchy, c.has_ancestor_data, c.path, c.synonyms, co.can_select" +
            " from cb_criteria c join concept co on c.concept_id=co.concept_id where c.concept_id = :conceptId and match(c.synonyms) against(:matchWord in boolean mode) and c.domain_id=:domain\n" +
            "union all\n" +
            "select c.id, c.parent_id, c.domain_id, c.is_standard, c.type, c.subtype, c.concept_id, c.code, c.name, c.value, c.est_count, c.is_group, c.is_selectable, c.has_attribute, c.has_hierarchy, c.has_ancestor_data, c.path, c.synonyms, co.can_select\n" +
            " from cb_criteria c join concept co on c.concept_id=co.concept_id where parent_id in (select distinct id from cb_criteria where concept_id=:conceptId and match(synonyms) against(:matchWord in boolean mode) and domain_id=:domain)\n" +
            "order by est_count desc", nativeQuery = true)
    List<DbCriteria> findParentCounts(@Param("conceptId") String conceptId,@Param("domain") String domain,@Param("matchWord") String matchWord);

    @Query(value = "select c.id, c.parent_id, c.domain_id, c.is_standard, c.type, c.subtype, c.concept_id, c.code, c.name, c.value, c.est_count, c.is_group, c.is_selectable, c.has_attribute, c.has_hierarchy, c.has_ancestor_data, c.path, c.synonyms, co.can_select" +
            " from cb_criteria c join concept co on co.concept_id=c.concept_id  where parent_id = :parentId order by est_count desc", nativeQuery=true)
    List<DbCriteria> findCriteriaChildren(@Param("parentId") Long parentId);
}
