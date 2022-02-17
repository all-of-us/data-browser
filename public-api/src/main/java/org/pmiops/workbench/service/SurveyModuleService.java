package org.pmiops.workbench.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.pmiops.workbench.model.SurveyModule;
import org.pmiops.workbench.cdr.dao.SurveyModuleDao;
import org.pmiops.workbench.cdr.model.DbSurveyModule;
import org.pmiops.workbench.cdr.DomainMapper;
import java.util.List;
import java.util.stream.Collectors;


@Service
public class SurveyModuleService {
    private SurveyModuleDao surveyModuleDao;
    private DomainMapper domainMapper;

    @Autowired
    public SurveyModuleService(SurveyModuleDao surveyModuleDao, DomainMapper domainMapper) {
        this.surveyModuleDao = surveyModuleDao;
        this.domainMapper = domainMapper;
    }

    public List<SurveyModule> findSurveyModuleQuestionCounts(String matchExpression, List<Long> fmhConditionConceptIds, List<Long> fmhFMConceptIds) {
        return surveyModuleDao.findSurveyModuleQuestionCounts(matchExpression, fmhConditionConceptIds, fmhFMConceptIds).stream()
                .map(domainMapper::dbModelToClient)
                .collect(Collectors.toList());
    }

    public List<SurveyModule> findSurveyModules() {
        return surveyModuleDao.findAllByOrderByOrderNumberAsc().stream()
                .map(domainMapper::dbModelToClient)
                .collect(Collectors.toList());
    }

    public SurveyModule findByConceptId(Long conceptId) {
        return domainMapper.dbModelToClient(surveyModuleDao.findByConceptId(conceptId));
    }

    public void save(DbSurveyModule surveyModule) {
        surveyModuleDao.save(surveyModule);
    }
}