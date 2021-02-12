package org.pmiops.workbench.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.pmiops.workbench.model.DomainInfo;
import org.pmiops.workbench.cdr.DomainMapper;
import org.pmiops.workbench.cdr.dao.DomainInfoDao;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;
import java.util.Arrays;


@Service
public class DomainInfoService {
    private DomainInfoDao domainInfoDao;
    private DomainMapper domainMapper;

    @Autowired
    public DomainInfoService(DomainInfoDao domainInfoDao, DomainMapper domainMapper) {
        this.domainInfoDao = domainInfoDao;
        this.domainMapper = domainMapper;
    }

    public List<DomainInfo> getStandardCodeMatchCounts(String matchExpression, String query, List<Long> conceptIds, int testFilter, int orderFilter) {
        return domainInfoDao.findStandardOrCodeMatchConceptCounts(matchExpression, query, conceptIds, testFilter, orderFilter).stream()
                .map(domainMapper::dbModelToClient)
                .collect(Collectors.toList());
    }

    public List<DomainInfo> getDomainTotals(int testFilter, int orderFilter) {
        return domainInfoDao.findDomainTotals(testFilter, orderFilter).stream()
                .map(domainMapper::dbModelToClient)
                .collect(Collectors.toList());
    }

    public List<Integer> getTestOrderFilter(int testFilter, int orderFilter) {
        Integer getTests = null;
        Integer getOrders = null;

        if (testFilter == 1 && orderFilter == 1) {
            getTests = 1;
            getOrders = 0;
        } else if (testFilter == 1 && orderFilter == 0) {
            getTests = 1;
            getOrders = 2;
        } else if (testFilter == 0 && orderFilter == 1) {
            getTests = 2;
            getOrders = 0;
        } else if (testFilter == 0 && orderFilter == 0) {
            getTests = 2;
            getOrders = 2;
        }

        return new ArrayList<>(Arrays.asList(getTests, getOrders));
    }
}