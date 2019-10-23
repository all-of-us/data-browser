package org.pmiops.workbench.cdr.dao;

import org.pmiops.workbench.cdr.model.CBCriteria;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CBCriteriaDao extends CrudRepository<CBCriteria, Long> {
    @Query(value = "select c.* from cb_criteria c where c.concept_id = :conceptId and match(synonyms) against(:matchWord in boolean mode)\n" +
            "union all\n" +
            "select * from cb_criteria where parent_id = (select distinct id from cb_criteria where concept_id=:conceptId and match(synonyms) against(:matchWord in boolean mode))\n" +
            "order by cast(est_count as unsigned) desc", nativeQuery = true)
    List<CBCriteria> findParentCounts(@Param("conceptId") String conceptId,@Param("matchWord") String matchWord);

    @Query(value = "select * from cb_criteria where parent_id = :parentId order by cast(est_count as unsigned) desc", nativeQuery=true)
    List<CBCriteria> findCriteriaChildren(@Param("parentId") Long parentId);
}
