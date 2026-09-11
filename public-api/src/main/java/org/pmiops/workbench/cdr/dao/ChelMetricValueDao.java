package org.pmiops.workbench.cdr.dao;

import java.util.List;
import org.pmiops.workbench.cdr.model.DbChelMetricValue;
import org.pmiops.workbench.cdr.model.DbChelMetricValueId;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

public interface ChelMetricValueDao extends CrudRepository<DbChelMetricValue, DbChelMetricValueId> {

    /**
     * Returns one value per cell for a metric, ordered by chel_h3_cell.cell_index so the result
     * lines up positionally with ChelH3CellDao.findByOrderByCellIndexAsc().
     *
     * Driven from chel_h3_cell, not from the value table: cells with no data for a metric have
     * no row in chel_h3_metric_value at all, and the left join is what turns their absence into
     * a null in the right position. Always returns exactly as many elements as there are cells.
     *
     * metric_key belongs in the ON clause. In a WHERE clause it would filter the unmatched outer
     * rows back out and collapse this into an inner join.
     */
    @Query(nativeQuery = true, value =
            "select v.metric_value from chel_h3_cell c " +
                    "left join chel_h3_metric_value v " +
                    "  on v.h3_id = c.h3_id and v.metric_key = ?1 " +
                    "order by c.cell_index asc")
    List<Double> findValuesByMetricKeyInCellOrder(String metricKey);
}