package org.pmiops.workbench.cdr.dao;

import static com.google.common.truth.Truth.assertThat;

import org.junit.Before;
import org.junit.Test;
import java.util.List;
import org.junit.runner.RunWith;
import org.pmiops.workbench.cdr.model.DbDomainInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.annotation.DirtiesContext;

@RunWith(SpringRunner.class)
@DataJpaTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class DomainInfoDaoTest {

  @Autowired private DomainInfoDao domainInfoDao;

  @Before
  public void setUp() {
    domainInfoDao.save(
        new DbDomainInfo()
                .conceptId(19L)
                .domain((short)0)
                .domainId("Condition")
                .name("Conditions")
                .description("Condition Domain")
                .allConceptCount(0)
                .standardConceptCount(0)
                .participantCount(0));
    domainInfoDao.save(
        new DbDomainInfo()
                .conceptId(13L)
                .domain((short)3)
                .domainId("Drug")
                .name("Drug Exposures")
                .description("Drug Exposures Domain")
                .allConceptCount(20)
                .standardConceptCount(10)
                .participantCount(1000));
    domainInfoDao.save(
            new DbDomainInfo()
                    .conceptId(21L)
                    .domain((short)4)
                    .domainId("Measurement")
                    .name("Labs & Measurements")
                    .description("Measurements domain")
                    .allConceptCount(30)
                    .standardConceptCount(25)
                    .participantCount(2000));
  }

  @Test
  public void findDomainTotals() {
    List<DbDomainInfo> domainInfoList = domainInfoDao.findDomainTotals(1, 1);
    assertThat(domainInfoList).hasSize(3);
  }
}
