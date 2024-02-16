package org.pmiops.workbench.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.pmiops.workbench.model.SurveyModule;
import org.pmiops.workbench.cdr.dao.SurveyModuleDao;
import org.pmiops.workbench.cdr.model.DbSurveyModule;
import org.pmiops.workbench.cdr.DomainMapper;
import java.util.List;
import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
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

    public List<SurveyModule> findSurveyModuleQuestionCounts(String matchExpression) {
        Pattern regex = Pattern.compile("[$&+,:;=\\\\?@#|/'<>.^*()%!-]");

        if (regex.matcher(matchExpression).find()) {
            return surveyModuleDao.findSurveyModuleQuestionCountsSpecial(matchExpression).stream()
                    .map(domainMapper::dbModelToClient)
                    .collect(Collectors.toList());
        }

        return surveyModuleDao.findSurveyModuleQuestionCounts(matchExpression).stream()
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