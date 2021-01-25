package org.pmiops.workbench.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import javax.inject.Provider;
import org.springframework.beans.factory.annotation.Qualifier;
import org.pmiops.workbench.model.AchillesResultDist;
import org.pmiops.workbench.cdr.model.DbAchillesResultDist;
import org.pmiops.workbench.cdr.dao.AchillesResultDistDao;
import org.pmiops.workbench.cdr.AchillesMapper;
import java.util.List;
import java.util.stream.Collectors;


@Service
public class AchillesResultDistService {
    private AchillesResultDistDao achillesResultDistDao;
    private AchillesMapper achillesMapper;

    @Autowired
    public AchillesResultDistService(AchillesResultDistDao achillesResultDistDao, AchillesMapper achillesMapper) {
        this.achillesResultDistDao = achillesResultDistDao;
        this.achillesMapper = achillesMapper;
    }

    public List<DbAchillesResultDist> fetchByAnalysisIdsAndConceptIds(Long analysisId, List<String> conceptIds) {
        return achillesResultDistDao.fetchByAnalysisIdsAndConceptIds(analysisId, conceptIds);
    }

    public List<AchillesResultDist> fetchConceptDistResults(Long analysisId, String conceptId) {
        return achillesResultDistDao.fetchConceptDistResults(analysisId,conceptId).stream()
                .map(achillesMapper::dbModelToClient)
                .collect(Collectors.toList());
    }
}