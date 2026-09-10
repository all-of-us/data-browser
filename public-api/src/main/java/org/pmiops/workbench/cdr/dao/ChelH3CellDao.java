package org.pmiops.workbench.cdr.dao;

import java.util.List;
import org.pmiops.workbench.cdr.model.DbChelH3Cell;
import org.springframework.data.repository.CrudRepository;

public interface ChelH3CellDao extends CrudRepository<DbChelH3Cell, String> {

    /**
     * Canonical cell ordering. Every values array returned by the API is aligned to this order,
     * so the client only ever downloads the cell list once.
     */
    List<DbChelH3Cell> findByOrderByCellIndexAsc();
}