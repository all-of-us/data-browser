package org.pmiops.workbench.cdr.dao;

import static com.google.common.truth.Truth.assertThat;

import org.junit.Before;
import org.junit.Test;
import java.util.List;
import org.junit.runner.RunWith;
import org.pmiops.workbench.cdr.model.DbSurveyModule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.annotation.DirtiesContext;

@RunWith(SpringRunner.class)
@DataJpaTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class SurveyModuleDaoTest {

  @Autowired private SurveyModuleDao surveyModuleDao;

  @Before
  public void setUp() {
    surveyModuleDao.save(
        new DbSurveyModule()
            .name("Lifestyle")
            .description("The Lifestyle module provides information on smoking, alcohol and recreational drug use")
            .conceptId(1585855L)
            .questionCount(568120L)
            .participantCount(4L)
            .orderNumber(0));
    surveyModuleDao.save(
        new DbSurveyModule()
            .name("The Basics")
            .description("The Basics module provides demographics and economic information for participants")
            .conceptId(1586134L)
            .questionCount(567437L)
            .participantCount(5L)
            .orderNumber(0));
    surveyModuleDao.save(
        new DbSurveyModule()
            .name("Cope")
            .description("Survey includes information about the impact of COVID-19 on participant mental and physical health.")
            .conceptId(1333342L)
            .questionCount(100L)
            .participantCount(10000L)
            .orderNumber(0));
  }

  @Test
  public void findAllSurveyModules() {
    List<DbSurveyModule> moduleList = surveyModuleDao.findAllByOrderByOrderNumberAsc();
    assertThat(moduleList).hasSize(3);
  }

  @Test
  public void findByConceptId() {
      DbSurveyModule surveyModule = surveyModuleDao.findByConceptId(1586134L);
      assertThat(surveyModule.getName()).isEqualTo("The Basics");
  }
}
