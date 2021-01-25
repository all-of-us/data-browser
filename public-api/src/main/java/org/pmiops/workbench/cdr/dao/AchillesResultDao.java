package org.pmiops.workbench.cdr.dao;

import org.pmiops.workbench.cdr.model.DbAchillesResult;
import org.springframework.data.repository.CrudRepository;

public interface AchillesResultDao extends CrudRepository<DbAchillesResult, Long> {
    DbAchillesResult findAchillesResultByAnalysisId(Long analysisId);
}
