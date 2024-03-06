package org.pmiops.workbench.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.pmiops.workbench.model.DomainInfo;
import org.pmiops.workbench.cdr.DomainMapper;
import org.pmiops.workbench.cdr.dao.DomainInfoDao;
import java.util.List;
import java.util.ArrayList;
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

        List<String> testOrderFilters = new ArrayList<>();
        if (testFilter.equals(TestFilter.SELECTED)) {
            testOrderFilters.add("TEST");
        }
        if (orderFilter.equals(OrderFilter.SELECTED)) {
            testOrderFilters.add("ORDER");
        }
        return testOrderFilters;
    }
}