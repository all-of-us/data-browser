package org.pmiops.workbench.cdr.dao;

import java.util.List;
import org.pmiops.workbench.cdr.model.DbChelMetricValue;
import org.pmiops.workbench.cdr.model.DbChelMetricValueId;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

public interface ChelMetricValueDao extends CrudRepository<DbChelMetricValue, DbChelMetricValueId> {

    /**
     * Returns one value per cell for a metric, ordered by chel_h3_cell.cell_index so the result
     * lines up positionally with ChelH3CellDao.findByOrderByCellIndexAsc(). Nulls are preserved
     * and rendered as the metric's null_color by the client.
     */
    @Query(nativeQuery = true, value =
            "select v.metric_value from chel_h3_metric_value v " +
                    "join chel_h3_cell c on c.h3_id = v.h3_id " +
                    "where v.metric_key = ?1 " +
                    "order by c.cell_index asc")
    List<Double> findValuesByMetricKeyInCellOrder(String metricKey);
}