package org.pmiops.workbench.cdr.dao;
import org.pmiops.workbench.cdr.model.DbAchillesResultDist;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface AchillesResultDistDao extends CrudRepository<DbAchillesResultDist, Long> {
    List<DbAchillesResultDist> findAll();

    @Query(value = "select * from achilles_results_dist where analysis_id=?1 and stratum_1=?2",nativeQuery=true)
    List<DbAchillesResultDist> fetchConceptDistResults(Long analysisId, String conceptId);

    @Query(value = "select * from achilles_results_dist where analysis_id=?1 and stratum_1 in (?2)", nativeQuery = true)
    List<DbAchillesResultDist> fetchByAnalysisIdsAndConceptIds(Long analysisId,List<String> conceptIds);

}


