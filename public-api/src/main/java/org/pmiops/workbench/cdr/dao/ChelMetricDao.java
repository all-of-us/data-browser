package org.pmiops.workbench.cdr.dao;

import java.util.List;
import org.pmiops.workbench.cdr.model.DbChelMetric;
import org.springframework.data.repository.CrudRepository;

public interface ChelMetricDao extends CrudRepository<DbChelMetric, String> {

    List<DbChelMetric> findByOrderByYearAscSortOrderAsc();

    DbChelMetric findByMetricKey(String metricKey);
}