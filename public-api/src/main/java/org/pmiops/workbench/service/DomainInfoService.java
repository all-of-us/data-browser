package org.pmiops.workbench.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.pmiops.workbench.model.DomainInfo;
import org.pmiops.workbench.cdr.DomainMapper;
import org.pmiops.workbench.cdr.dao.DomainInfoDao;
import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.stream.Collectors;
import org.pmiops.workbench.model.TestFilter;
import org.pmiops.workbench.model.OrderFilter;

@Service
public class DomainInfoService {
    private DomainInfoDao domainInfoDao;
    private DomainMapper domainMapper;

    @Autowired
    public DomainInfoService(DomainInfoDao domainInfoDao, DomainMapper domainMapper) {
        this.domainInfoDao = domainInfoDao;
        this.domainMapper = domainMapper;
    }

    public List<DomainInfo> getStandardCodeMatchCounts(String matchExpression, String query, List<Long> conceptIds, List<String> filter) {
        return domainInfoDao.findStandardOrCodeMatchConceptCounts(matchExpression, query, conceptIds, filter).stream()
                .map(domainMapper::dbModelToClient)
                .collect(Collectors.toList());
    }

    public List<DomainInfo> getDomainTotals(List<String> filter) {
        return domainInfoDao.findDomainTotals(filter).stream()
                .map(domainMapper::dbModelToClient)
                .collect(Collectors.toList());
    }

    public List<String> getTestOrderFilter(TestFilter testFilter, OrderFilter orderFilter) {

        if (testFilter.equals(TestFilter.SELECTED) && orderFilter.equals(OrderFilter.SELECTED)) {
            return new ArrayList<>(Arrays.asList("TEST", "ORDER"));
        } else if (testFilter.equals(TestFilter.SELECTED) && orderFilter.equals(OrderFilter.UNSELECTED)) {
            return new ArrayList<>(Arrays.asList("TEST"));
        } else if (testFilter.equals(TestFilter.UNSELECTED) && orderFilter.equals(OrderFilter.SELECTED)) {
            return new ArrayList<>(Arrays.asList("ORDER"));
        }
        return new ArrayList<>(Arrays.asList(""));
    }
}