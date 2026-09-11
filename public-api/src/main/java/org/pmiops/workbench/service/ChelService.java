package org.pmiops.workbench.service;

import java.util.List;
import java.util.stream.Collectors;
import org.pmiops.workbench.cdr.ChelMapper;
import org.pmiops.workbench.cdr.dao.ChelH3CellDao;
import org.pmiops.workbench.cdr.dao.ChelMetricDao;
import org.pmiops.workbench.cdr.dao.ChelMetricValueDao;
import org.pmiops.workbench.model.ChelH3Cell;
import org.pmiops.workbench.model.ChelMetric;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ChelService {

    private final ChelH3CellDao chelH3CellDao;
    private final ChelMetricDao chelMetricDao;
    private final ChelMetricValueDao chelMetricValueDao;
    private final ChelMapper chelMapper;

    @Autowired
    public ChelService(ChelH3CellDao chelH3CellDao, ChelMetricDao chelMetricDao,
                       ChelMetricValueDao chelMetricValueDao, ChelMapper chelMapper) {
        this.chelH3CellDao = chelH3CellDao;
        this.chelMetricDao = chelMetricDao;
        this.chelMetricValueDao = chelMetricValueDao;
        this.chelMapper = chelMapper;
    }

    public List<ChelH3Cell> getCells() {
        return chelH3CellDao.findByOrderByCellIndexAsc().stream()
                .map(chelMapper::dbModelToClient)
                .collect(Collectors.toList());
    }

    public List<ChelMetric> getMetrics() {
        return chelMetricDao.findByOrderByYearAscSortOrderAsc().stream()
                .map(chelMapper::dbModelToClient)
                .collect(Collectors.toList());
    }

    public boolean metricExists(String metricKey) {
        return chelMetricDao.findByMetricKey(metricKey) != null;
    }

    public List<Double> getValues(String metricKey) {
        return chelMetricValueDao.findValuesByMetricKeyInCellOrder(metricKey);
    }
}