package org.pmiops.workbench.cdr.dao;

import org.pmiops.workbench.cdr.model.DbAchillesResult;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface AchillesResultDao extends CrudRepository<DbAchillesResult, Long> {
    DbAchillesResult findAchillesResultByAnalysisId(Long analysisId);
}
