package org.pmiops.workbench.cdr.dao;

import org.junit.Before;
import org.junit.After;
import org.junit.Test;
import org.junit.Assert;
import org.junit.runner.RunWith;
import org.pmiops.workbench.cdr.model.DbAchillesAnalysis;
import org.pmiops.workbench.cdr.model.DbAchillesResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.annotation.DirtiesContext;
import com.google.common.collect.ImmutableList;
import static com.google.common.truth.Truth.assertThat;
import java.util.stream.Collectors;

import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;

@RunWith(SpringRunner.class)
@DataJpaTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class AchillesAnalysisDaoTest {

    @Autowired
    AchillesAnalysisDao achillesAnalysisDao;

    @Autowired
    AchillesResultDao achillesResultDao;

    private DbAchillesAnalysis achillesAnalysis1;
    private DbAchillesAnalysis achillesAnalysis2;
    private DbAchillesAnalysis achillesAnalysis3;
    private DbAchillesAnalysis achillesAnalysis4;
    private DbAchillesAnalysis achillesAnalysis5;

    private DbAchillesResult achillesResult1;
    private DbAchillesResult achillesResult2;
    private DbAchillesResult achillesResult3;
    private DbAchillesResult achillesResult4;
    private DbAchillesResult achillesResult5;
    private DbAchillesResult achillesResult6;
    private DbAchillesResult achillesResult7;
    private DbAchillesResult achillesResult8;
    private DbAchillesResult achillesResult9;
    private DbAchillesResult achillesResult10;

    @Before
    public void setUp() {

        achillesAnalysis1=createAnalysis(3110L,"Survey Question Answer Count","survey_concept_id","question_concept_id","answer_concept_id","answer_value_string",null,"column","counts");
        achillesAnalysis2=createAnalysis(3111L,"Gender","survey_concept_id","question_concept_id","answer_concept_id","answer_value_string","gender_concept_id","column","counts");
        achillesAnalysis3=createAnalysis(3112L,"Age","survey_concept_id","question_concept_id","answer_concept_id","answer_value_string","age_decile","column","counts");
        achillesAnalysis4=createAnalysis(3101L,"Gender","concept_id","ppi_sex_at_birth_concept_id",null,null,null,"pie","counts");
        achillesAnalysis5=createAnalysis(3102L,"Age","concept_id","age_decile",null,null,null,"column","counts");

        achillesAnalysisDao.save(achillesAnalysis1);
        achillesAnalysisDao.save(achillesAnalysis2);
        achillesAnalysisDao.save(achillesAnalysis3);
        achillesAnalysisDao.save(achillesAnalysis4);
        achillesAnalysisDao.save(achillesAnalysis5);

        achillesResult1=createAchillesResult(2397L,3110L,"1586134","1000000","","Smoking",null,260L,0L);
        achillesResult2=createAchillesResult(2380L,3111L,"1585855","2000000","","Drinking is the cause of failure",null,2345L,0L);
        achillesResult3=createAchillesResult(2345L,3112L,"1586134","1000000","","Donot know",null,789L,0L);
        achillesResult4=createAchillesResult(2346L,3112L,"1586134","2000000","","Prefer not to answer",null,890L,0L);
        achillesResult5=createAchillesResult(2456L,3101L,"104567","8507",null,null,null,20L,8L);
        achillesResult6=createAchillesResult(2457L,3102L,"104567","2",null,null,null,78L,90L);
        achillesResult7=createAchillesResult(2460L, 3101L, "1586134", "8507", "Survey", null, null, 251780L, 251780L);
        achillesResult8=createAchillesResult(2461L, 3101L, "1586134", "8532", "Survey", null, null, 316080L, 316080L);
        achillesResult9=createAchillesResult(2462L, 3102L, "1586134", "2", "Survey", null, null, 93020L, 93020L);
        achillesResult10=createAchillesResult(2463L, 3102L, "1586134", "3", "Survey", null, null, 93020L, 93020L);

        achillesResultDao.save(achillesResult1);
        achillesResultDao.save(achillesResult2);
        achillesResultDao.save(achillesResult3);
        achillesResultDao.save(achillesResult4);
        achillesResultDao.save(achillesResult5);
        achillesResultDao.save(achillesResult6);
        achillesResultDao.save(achillesResult7);
        achillesResultDao.save(achillesResult8);
        achillesResultDao.save(achillesResult9);
        achillesResultDao.save(achillesResult10);
    }

    @Test
    public void findAllAnalyses() throws Exception {
        /* Todo write more tests */
        final List<DbAchillesAnalysis> list = achillesAnalysisDao.findAll();
        Assert.assertNotEquals(list,null);
    }

    @Test
    public void findSurveyAnalysisResults() throws Exception{
        List<String> qids=Arrays.asList("1000000","2000000");
        final List<DbAchillesAnalysis> list=achillesAnalysisDao.findSurveyAnalysisResults("1586134",qids);
        Assert.assertNotEquals(list,null);
    }

    @Test
    public void findConceptAnalysisResults() throws Exception{
        List<Long> analysisIds = new ArrayList<>();
        analysisIds.add(3101L);
        analysisIds.add(3102L);
        List<DbAchillesAnalysis> aa = achillesAnalysisDao.findConceptAnalysisResults("104567",analysisIds);
        Assert.assertNotEquals(aa.get(0),null);
        Assert.assertNotEquals(aa.get(1),null);
    }

    @Test
    public void testGetSurveyDemographicAnalysesMatch() throws Exception{
        List<Long> analysisIds = new ArrayList<>();
        analysisIds.add(3101L);
        analysisIds.add(3102L);
        List<DbAchillesAnalysis> aa = achillesAnalysisDao.findConceptAnalysisResults("1586134",analysisIds);
        Assert.assertNotEquals(aa.get(0),null);
        Assert.assertNotEquals(aa.get(1),null);
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

    private DbAchillesResult createAchillesResult(Long id,Long analysisId,String stratum1,String stratum2,String stratum3,String stratum4,String stratum5,Long count, Long sourceCountValue){
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
}
