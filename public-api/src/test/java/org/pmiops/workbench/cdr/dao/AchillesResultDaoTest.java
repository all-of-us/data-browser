package org.pmiops.workbench.cdr.dao;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.After;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Assert;
import org.junit.jupiter.api.runner.RunWith;
import org.pmiops.workbench.cdr.model.DbAchillesAnalysis;
import org.pmiops.workbench.cdr.model.DbAchillesResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.context.TestPropertySource;

@RunWith(SpringRunner.class)
@DataJpaTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
@TestPropertySource(properties = "spring.main.allow-bean-definition-overriding=true")
public class AchillesResultDaoTest {

    @Autowired
    private AchillesResultDao achillesResultDao;

    @Autowired
    private AchillesAnalysisDao achillesAnalysisDao;

    private DbAchillesAnalysis achillesAnalysis1;

    private DbAchillesResult achillesResult1;

    @BeforeEach
    public void setUp() {


        achillesAnalysis1=createAnalysis(5000L,"Sample Analysis",null,null,null,null,null,"column","counts");


        achillesAnalysisDao.save(achillesAnalysis1);


        achillesResult1=createAchillesResult(2397L,5000L,null,null,null,null,null,260L, 0L);


        achillesResultDao.save(achillesResult1);


    }

    @Test
    public void findAchillesResultByAnalysisId() throws Exception{
        final DbAchillesResult achillesResult=achillesResultDao.findAchillesResultByAnalysisId(5000L);
        Assert.assertNotEquals(achillesResult,null);
    }



    private DbAchillesAnalysis createAnalysis(Long analysisId,String analysisName,String stratum1Name,String stratum2Name,String stratum3Name,String stratum4Name,String stratum5Name,String chartType,String dataType) {
        return new DbAchillesAnalysis()
                .analysisId(analysisId)
                .analysisName(analysisName)
                .stratum1Name(stratum1Name)
                .stratum2Name(stratum2Name)
                .stratum3Name(stratum3Name)
                .stratum4Name(stratum4Name)
                .stratum5Name(stratum5Name)
                .chartType(chartType)
                .dataType(dataType);
    }

    private DbAchillesResult createAchillesResult(Long id,Long analysisId,String stratum1,String stratum2,String stratum3,String stratum4,String stratum5,Long count,Long sourceCountValue){
        return new DbAchillesResult()
                .id(id)
                .analysisId(analysisId)
                .stratum1(stratum1)
                .stratum2(stratum2)
                .stratum3(stratum3)
                .stratum4(stratum4)
                .stratum5(stratum5)
                .countValue(count)
                .sourceCountValue(sourceCountValue);
    }

    @After
    public void flush(){
        achillesAnalysisDao.delete(achillesAnalysis1);
        achillesResultDao.delete(achillesResult1);
    }

}
