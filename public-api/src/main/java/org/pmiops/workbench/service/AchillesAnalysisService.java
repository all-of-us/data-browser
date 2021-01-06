package org.pmiops.workbench.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import javax.inject.Provider;
import org.springframework.beans.factory.annotation.Qualifier;
import org.pmiops.workbench.model.Analysis;
import org.pmiops.workbench.cdr.model.DbAchillesAnalysis;
import org.pmiops.workbench.cdr.dao.AchillesAnalysisDao;
import org.pmiops.workbench.cdr.AchillesMapper;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AchillesAnalysisService {
    private AchillesAnalysisDao achillesAnalysisDao;
    private AchillesMapper achillesMapper;

    @Autowired
    public AchillesAnalysisService(AchillesAnalysisDao achillesAnalysisDao, AchillesMapper achillesMapper) {
        this.achillesAnalysisDao = achillesAnalysisDao;
        this.achillesMapper = achillesMapper;
    }

    public Analysis findAnalysisById(Long analysisId) {
        return achillesMapper.dbModelToClient(achillesAnalysisDao.findAnalysisById(analysisId));
    }
}