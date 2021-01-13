package org.pmiops.workbench.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.pmiops.workbench.model.AchillesResult;
import org.pmiops.workbench.cdr.dao.AchillesResultDao;
import org.pmiops.workbench.cdr.AchillesMapper;

@Service
public class AchillesResultService {
    private AchillesResultDao achillesResultDao;
    private AchillesMapper achillesMapper;

    @Autowired
    public AchillesResultService(AchillesResultDao achillesResultDao, AchillesMapper achillesMapper) {
        this.achillesResultDao = achillesResultDao;
        this.achillesMapper = achillesMapper;
    }

    public AchillesResult findAchillesResultByAnalysisId(Long analysisId) {
        return achillesMapper.dbModelToClient(achillesResultDao.findAchillesResultByAnalysisId(analysisId));
    }
}