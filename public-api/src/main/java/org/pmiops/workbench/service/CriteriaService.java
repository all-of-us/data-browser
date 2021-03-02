package org.pmiops.workbench.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.pmiops.workbench.model.Criteria;
import org.pmiops.workbench.cdr.model.DbCriteria;
import org.pmiops.workbench.cdr.dao.CBCriteriaDao;
import java.util.Optional;
import org.pmiops.workbench.cdr.CriteriaMapper;
import org.pmiops.workbench.model.CriteriaParentResponse;
import org.pmiops.workbench.exceptions.DataNotFoundException;
import com.google.common.collect.Multimaps;
import com.google.common.collect.Multimap;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CriteriaService {
    private final CBCriteriaDao criteriaDao;
    private final CriteriaMapper criteriaMapper;

    @Autowired
    public CriteriaService(CBCriteriaDao criteriaDao, CriteriaMapper criteriaMapper) {
        this.criteriaDao = criteriaDao;
        this.criteriaMapper = criteriaMapper;
    }

    public CriteriaParentResponse getRolledUpCounts(String conceptId, String domainId) {
        List<DbCriteria> criteriaList = criteriaDao.findParentCounts(conceptId, domainId.toUpperCase(), new String(domainId+"_rank1"));
        Multimap<String, DbCriteria> criteriaRowsByConcept = Multimaps.index(criteriaList, DbCriteria::getConceptId);
        CriteriaParentResponse response = new CriteriaParentResponse();
        if (criteriaList.size() > 0) {
            List<DbCriteria> parentList = criteriaRowsByConcept.get(conceptId).stream().collect(Collectors.toList());
            DbCriteria parent = null;
            DbCriteria standardParent = null;
            DbCriteria sourceParent = null;
            if (parentList.size() > 1) {
                standardParent = Optional.ofNullable(parentList.stream().filter(p -> p.getStandard()).collect(Collectors.toList()).get(0)).orElse(null);
                sourceParent = Optional.ofNullable(parentList.stream().filter(p -> !p.getStandard()).collect(Collectors.toList()).get(0)).orElse(null);
                if (standardParent != null) {
                    if (sourceParent != null) {
                        standardParent.setSourceCount(sourceParent.getCount());
                    }
                    parent = standardParent;
                } else {
                    parent = sourceParent;
                }
            } else {
                parent = parentList.get(0);
            }
            Optional.ofNullable(parent).orElseThrow(() -> new DataNotFoundException("Cannot find rolled up counts of this concept"));
            response.setParent(criteriaMapper.dbModelToClient(parent));
        }
        return response;
    }

    public List<Criteria> getCriteriaChildren(Long parentId) {
        List<DbCriteria> criteriaList = criteriaDao.findCriteriaChildren(parentId);
        return criteriaList.stream()
                .map(criteriaMapper::dbModelToClient)
                .collect(Collectors.toList());
    }
}