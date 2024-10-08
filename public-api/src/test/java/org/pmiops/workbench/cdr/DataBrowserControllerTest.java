package org.pmiops.workbench.publicapi;

import static com.google.common.truth.Truth.assertThat;

import org.mockito.Mock;
import com.google.common.base.Joiner;
import com.google.common.collect.ImmutableList;
import java.sql.Timestamp;
import java.util.ArrayList;
import org.junit.jupiter.api.AfterEach;
import java.util.List;
import org.pmiops.workbench.model.MatchType;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.pmiops.workbench.cdr.dao.AchillesAnalysisDao;
import org.pmiops.workbench.cdr.dao.AchillesResultDao;
import org.pmiops.workbench.cdr.dao.AchillesResultDistDao;
import org.pmiops.workbench.cdr.dao.ConceptDao;
import org.pmiops.workbench.cdr.dao.ConceptRelationshipDao;
import org.pmiops.workbench.cdr.dao.ConceptService;
import org.pmiops.workbench.service.DomainInfoService;
import org.pmiops.workbench.service.AchillesAnalysisService;
import org.pmiops.workbench.service.AchillesResultService;
import org.pmiops.workbench.service.DomainInfoService;
import org.pmiops.workbench.service.CriteriaService;
import org.pmiops.workbench.cdr.AchillesMapper;
import org.pmiops.workbench.cdr.AchillesMapperImpl;
import org.pmiops.workbench.cdr.model.DbAchillesAnalysis;
import org.pmiops.workbench.cdr.model.DbAchillesResult;
import org.pmiops.workbench.cdr.model.ConceptRelationship;
import org.pmiops.workbench.cdr.model.ConceptRelationshipId;
import org.pmiops.workbench.db.dao.CdrVersionDao;
import org.pmiops.workbench.cdr.model.DbConcept;
import org.pmiops.workbench.db.model.DbCdrVersion;
import org.pmiops.workbench.model.Concept;
import org.pmiops.workbench.model.MeasurementConceptInfo;
import org.pmiops.workbench.model.ConceptAnalysis;
import org.pmiops.workbench.model.ConceptAnalysisListResponse;
import org.pmiops.workbench.model.SurveyVersionCountResponse;
import org.pmiops.workbench.model.AnalysisListResponse;
import org.pmiops.workbench.model.ConceptListResponse;
import org.pmiops.workbench.model.Domain;
import org.pmiops.workbench.model.Domain;
import org.pmiops.workbench.model.SearchConceptsRequest;
import org.pmiops.workbench.model.StandardConceptFilter;
import org.pmiops.workbench.model.SurveyModule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.ResponseEntity;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Propagation;
import org.pmiops.workbench.exceptions.DataNotFoundException;
import org.pmiops.workbench.service.CdrVersionService;
import org.pmiops.workbench.service.SurveyModuleService;
import org.pmiops.workbench.service.SurveyMetadataService;
import org.pmiops.workbench.service.AchillesResultDistService;
import org.pmiops.workbench.cdr.ConceptMapper;
import org.pmiops.workbench.cdr.ConceptMapperImpl;
import org.springframework.test.context.TestPropertySource;

@DataJpaTest
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
@TestPropertySource(properties = "spring.main.allow-bean-definition-overriding=true")
public class DataBrowserControllerTest {

    private static final Concept CLIENT_CONCEPT_1 = new Concept()
            .conceptId(123L)
            .conceptName("a concept")
            .standardConcept("S")
            .conceptCode("001")
            .conceptClassId("classId")
            .vocabularyId("V1")
            .domainId("Condition")
            .countValue(123L)
            .sourceCountValue(20L)
            .prevalence(0.2F)
            .conceptSynonyms(new ArrayList<String>())
            .canSelect(1)
            .drugBrands(new ArrayList<String>())
            .standardConcepts(new ArrayList<Concept>());

    private static final Concept CLIENT_CONCEPT_2 = new Concept()
            .conceptId(456L)
            .conceptName("b concept")
            .conceptCode("002")
            .conceptClassId("classId2")
            .vocabularyId("V2")
            .domainId("Measurement")
            .countValue(456L)
            .sourceCountValue(25L)
            .prevalence(0.3F)
            .conceptSynonyms(new ArrayList<String>())
            .canSelect(1)
            .drugBrands(new ArrayList<String>())
            .standardConcepts(new ArrayList<Concept>());

    private static final Concept CLIENT_CONCEPT_3 = new Concept()
            .conceptId(789L)
            .conceptName("multi word concept")
            .standardConcept("")
            .conceptCode("003")
            .conceptClassId("classId3")
            .vocabularyId("V3")
            .domainId("Condition")
            .countValue(789L)
            .sourceCountValue(0L)
            .prevalence(0.4F)
            .conceptSynonyms(new ArrayList<String>())
            .canSelect(1)
            .drugBrands(new ArrayList<String>())
            .standardConcepts(new ArrayList<Concept>());

    private static final Concept CLIENT_CONCEPT_4 = new Concept()
            .conceptId(1234L)
            .conceptName("sample test con to test the multi word search")
            .standardConcept("S")
            .conceptCode("004")
            .conceptClassId("classId4")
            .vocabularyId("V4")
            .domainId("Observation")
            .countValue(1250L)
            .sourceCountValue(99L)
            .prevalence(0.5F)
            .conceptSynonyms(new ArrayList<String>())
            .canSelect(1)
            .drugBrands(new ArrayList<String>())
            .standardConcepts(new ArrayList<Concept>());

    private static final Concept CLIENT_CONCEPT_5 = new Concept()
            .conceptId(7890L)
            .conceptName("conceptD test concept")
            .standardConcept("S")
            .conceptCode("005")
            .conceptClassId("classId5")
            .vocabularyId("V5")
            .domainId("Condition")
            .countValue(7890L)
            .sourceCountValue(78L)
            .prevalence(0.9F)
            .conceptSynonyms(new ArrayList<String>())
            .canSelect(1)
            .drugBrands(new ArrayList<String>())
            .standardConcepts(new ArrayList<Concept>());

    private static final Concept CLIENT_CONCEPT_6 = new Concept()
            .conceptId(7891L)
            .conceptName("conceptD test concept 2")
            .standardConcept("S")
            .conceptCode("004")
            .conceptClassId("classId6")
            .vocabularyId("V6")
            .domainId("Condition")
            .countValue(0L)
            .sourceCountValue(20L)
            .prevalence(0.1F)
            .conceptSynonyms(ImmutableList.of("cstest 1", "cstest 2", "cstest 3"))
            .canSelect(1)
            .drugBrands(new ArrayList<String>())
            .standardConcepts(new ArrayList<Concept>());

  private static final Concept CLIENT_CONCEPT_7 = new Concept()
            .conceptId(7892L)
            .conceptName("conceptD test concept 3")
            .standardConcept("S")
            .conceptCode("004")
            .conceptClassId("classId7")
            .vocabularyId("V7")
            .domainId("Condition")
            .countValue(0L)
            .sourceCountValue(0L)
            .prevalence(0.0F)
            .conceptSynonyms(ImmutableList.of("cstest 1", "cstest 2", "cstest 3"))
            .canSelect(1)
            .drugBrands(new ArrayList<String>())
            .standardConcepts(new ArrayList<Concept>());

    private static final DbAchillesAnalysis CLIENT_ANALYSIS_1 = new DbAchillesAnalysis()
            .analysisId(1900L)
            .analysisName("Measurement Response Gender Distribution")
            .stratum1Name("Measurement Concept Id")
            .stratum2Name("Gender Concept Id")
            .stratum4Name("value")
            .stratum5Name("unit source value")
            .chartType("column")
            .dataType("counts");


    private static final DbAchillesAnalysis CLIENT_ANALYSIS_2 = new DbAchillesAnalysis()
            .analysisId(1901L)
            .analysisName("Measurement Response Age Distribution")
            .stratum1Name("Measurement Concept Id")
            .stratum2Name("Age Decile")
            .stratum4Name("value")
            .stratum5Name("unit source value")
            .chartType("column")
            .dataType("counts");

    private static final DbAchillesAnalysis CLIENT_ANALYSIS_3 = new DbAchillesAnalysis()
            .analysisId(1911L)
            .analysisName("Measurement Response Male Distribution")
            .stratum1Name("Measurement Concept Id")
            .stratum2Name("Gender Concept Id")
            .stratum4Name("value")
            .stratum5Name("unit source value")
            .chartType("column")
            .dataType("counts");


    private static final DbAchillesAnalysis CLIENT_ANALYSIS_4 = new DbAchillesAnalysis()
            .analysisId(1912L)
            .analysisName("Measurement Response Female Distribution")
            .stratum1Name("Measurement Concept Id")
            .stratum2Name("Gender Concept Id")
            .stratum4Name("value")
            .stratum5Name("unit source value")
            .chartType("column")
            .dataType("counts");

    private static final DbAchillesAnalysis CLIENT_ANALYSIS_5 = new DbAchillesAnalysis()
            .analysisId(3101L)
            .analysisName("Gender Distribution")
            .stratum1Name("Concept Id")
            .stratum2Name("Gender Concept Id")
            .stratum3Name("DomainId")
            .chartType("pie")
            .dataType("counts");
    private static final DbAchillesAnalysis CLIENT_ANALYSIS_6 = new DbAchillesAnalysis()
            .analysisId(3102L)
            .analysisName("Age Distribution")
            .stratum1Name("Concept Id")
            .stratum2Name("Age decile")
            .stratum3Name("DomainId")
            .chartType("column")
            .dataType("counts");

    private static final DbAchillesAnalysis CLIENT_ANALYSIS_7 = new DbAchillesAnalysis()
            .analysisId(3400L)
            .analysisName("Survey Module Counts By Version")
            .stratum1Name("Survey Concept Id")
            .stratum2Name("Version Month")
            .stratum3Name("Version Id");

    private static final DbAchillesAnalysis CLIENT_ANALYSIS_8 = new DbAchillesAnalysis()
            .analysisId(3401L)
            .analysisName("Survey Question Counts By Version")
            .stratum1Name("Survey Concept Id")
            .stratum2Name("Version Month")
            .stratum3Name("Version Id");


    private static DbAchillesAnalysis ACHILLES_ANALYSIS_1 = makeAchillesAnalysis(CLIENT_ANALYSIS_1);
    private static DbAchillesAnalysis ACHILLES_ANALYSIS_2 = makeAchillesAnalysis(CLIENT_ANALYSIS_2);
    private static DbAchillesAnalysis ACHILLES_ANALYSIS_3 = makeAchillesAnalysis(CLIENT_ANALYSIS_3);
    private static DbAchillesAnalysis ACHILLES_ANALYSIS_4 = makeAchillesAnalysis(CLIENT_ANALYSIS_4);
    private static DbAchillesAnalysis ACHILLES_ANALYSIS_5 = makeAchillesAnalysis(CLIENT_ANALYSIS_5);
    private static DbAchillesAnalysis ACHILLES_ANALYSIS_6 = makeAchillesAnalysis(CLIENT_ANALYSIS_6);
    private static DbAchillesAnalysis ACHILLES_ANALYSIS_7 = makeAchillesAnalysis(CLIENT_ANALYSIS_7);
    private static DbAchillesAnalysis ACHILLES_ANALYSIS_8 = makeAchillesAnalysis(CLIENT_ANALYSIS_8);

    private static final DbAchillesResult CLIENT_RESULT_1 = new DbAchillesResult()
            .id(1L)
            .analysisId(1900L)
            .stratum1("137989")
            .stratum2("8532")
            .stratum4("Abnormal results of cardiovascular function studies")
            .countValue(12L)
            .sourceCountValue(34L);


    private static final DbAchillesResult CLIENT_RESULT_2 = new DbAchillesResult()
            .id(2L)
            .analysisId(1900L)
            .stratum1("137989")
            .stratum2("8507")
            .stratum4("Abnormal results of cardiovascular function studies")
            .countValue(22L)
            .sourceCountValue(34L);


    private static final DbAchillesResult CLIENT_RESULT_3 = new DbAchillesResult()
            .id(3L)
            .analysisId(1901L)
            .stratum1("137989")
            .stratum2("2")
            .stratum4("Abnormal results of cardiovascular function studies")
            .countValue(2L)
            .sourceCountValue(34L);


    private static final DbAchillesResult CLIENT_RESULT_4 = new DbAchillesResult()
            .id(4L)
            .analysisId(1901L)
            .stratum1("137989")
            .stratum2("4")
            .stratum4("Abnormal results of cardiovascular function studies")
            .countValue(2L)
            .sourceCountValue(34L);


    private static final DbAchillesResult CLIENT_RESULT_5 = new DbAchillesResult()
            .id(5L)
            .analysisId(1901L)
            .stratum1("137989")
            .stratum2("3")
            .stratum4("Abnormal results of cardiovascular function studies")
            .countValue(1L)
            .sourceCountValue(34L);


    private static final DbAchillesResult CLIENT_RESULT_6 = new DbAchillesResult()
            .id(6L)
            .analysisId(3101L)
            .stratum1("1586134")
            .stratum2("8507")
            .stratum3("")
            .countValue(251780L)
            .sourceCountValue(251780L);

    private static final DbAchillesResult CLIENT_RESULT_7 = new DbAchillesResult()
            .id(7L)
            .analysisId(3101L)
            .stratum1("1586134")
            .stratum2("8532")
            .stratum3("")
            .countValue(316080L)
            .sourceCountValue(316080L);

    private static final DbAchillesResult CLIENT_RESULT_8 = new DbAchillesResult()
            .id(8L)
            .analysisId(3102L)
            .stratum1("1586134")
            .stratum2("2")
            .stratum3("")
            .countValue(93020L)
            .sourceCountValue(93020L);

    private static final DbAchillesResult CLIENT_RESULT_9 = new DbAchillesResult()
            .id(9L)
            .analysisId(3102L)
            .stratum1("1586134")
            .stratum2("3")
            .stratum3("")
            .countValue(93480L)
            .sourceCountValue(93480L);

    private static final DbAchillesResult CLIENT_RESULT_10 = new DbAchillesResult()
            .id(10L)
            .analysisId(3400L)
            .stratum1("1333342")
            .stratum2("May 2020")
            .stratum3("1")
            .countValue(1000L)
            .sourceCountValue(1000L);

    private static final DbAchillesResult CLIENT_RESULT_11 = new DbAchillesResult()
            .id(11L)
            .analysisId(3400L)
            .stratum1("1333342")
            .stratum2("June 2020")
            .stratum3("2")
            .countValue(1000L)
            .sourceCountValue(1000L);

    private static final DbAchillesResult CLIENT_RESULT_12 = new DbAchillesResult()
            .id(12L)
            .analysisId(3401L)
            .stratum1("1333342")
            .stratum2("May 2020")
            .stratum3("1")
            .countValue(50L)
            .sourceCountValue(50L);

    private static final DbAchillesResult CLIENT_RESULT_13 = new DbAchillesResult()
            .id(12L)
            .analysisId(3401L)
            .stratum1("1333342")
            .stratum2("June2 2020")
            .stratum3("2")
            .countValue(50L)
            .sourceCountValue(50L);


    private static final DbAchillesResult ACHILLES_RESULT_1 = makeAchillesResult(CLIENT_RESULT_1);
    private static final DbAchillesResult ACHILLES_RESULT_2 = makeAchillesResult(CLIENT_RESULT_2);
    private static final DbAchillesResult ACHILLES_RESULT_3 = makeAchillesResult(CLIENT_RESULT_3);
    private static final DbAchillesResult ACHILLES_RESULT_4 = makeAchillesResult(CLIENT_RESULT_4);
    private static final DbAchillesResult ACHILLES_RESULT_5 = makeAchillesResult(CLIENT_RESULT_5);
    private static final DbAchillesResult ACHILLES_RESULT_6 = makeAchillesResult(CLIENT_RESULT_6);
    private static final DbAchillesResult ACHILLES_RESULT_7 = makeAchillesResult(CLIENT_RESULT_7);
    private static final DbAchillesResult ACHILLES_RESULT_8 = makeAchillesResult(CLIENT_RESULT_8);
    private static final DbAchillesResult ACHILLES_RESULT_9 = makeAchillesResult(CLIENT_RESULT_9);
    private static final DbAchillesResult ACHILLES_RESULT_10 = makeAchillesResult(CLIENT_RESULT_10);
    private static final DbAchillesResult ACHILLES_RESULT_11 = makeAchillesResult(CLIENT_RESULT_11);
    private static final DbAchillesResult ACHILLES_RESULT_12 = makeAchillesResult(CLIENT_RESULT_12);
    private static final DbAchillesResult ACHILLES_RESULT_13 = makeAchillesResult(CLIENT_RESULT_13);

    private static final DbConcept CONCEPT_1 =
            makeConcept(CLIENT_CONCEPT_1);
    private static final DbConcept CONCEPT_2 =
            makeConcept(CLIENT_CONCEPT_2);
    private static final DbConcept CONCEPT_3 =
            makeConcept(CLIENT_CONCEPT_3);
    private static final DbConcept CONCEPT_4 =
            makeConcept(CLIENT_CONCEPT_4);
    private static final DbConcept CONCEPT_5 =
            makeConcept(CLIENT_CONCEPT_5);
    private static final DbConcept CONCEPT_6 =
            makeConcept(CLIENT_CONCEPT_6);
    private static final DbConcept CONCEPT_7 =
            makeConcept(CLIENT_CONCEPT_7);

    @Autowired
    private ConceptDao conceptDao;
    @Autowired
    private CdrVersionDao cdrVersionDao;
    @Autowired
    ConceptRelationshipDao conceptRelationshipDao;
    @Autowired
    private AchillesAnalysisDao achillesAnalysisDao;
    @Autowired
    private AchillesResultDao achillesResultDao;
    @Autowired
    private AchillesResultDistDao achillesResultDistDao;
    @PersistenceContext
    private EntityManager entityManager;
    @Mock private CdrVersionService cdrVersionService;
    @Mock private SurveyMetadataService surveyMetadataService;
    @Mock private AchillesResultDistService achillesResultDistService;
    @Mock private SurveyModuleService surveyModuleService;
    @Mock private DomainInfoService domainInfoService;
    @Mock private AchillesResultService achillesResultService;
    @Mock private CriteriaService criteriaService;

    private DataBrowserController dataBrowserController;
    private ConceptService conceptService;

    @BeforeEach
    public void setUp() {
        saveData();
        AchillesMapper achillesMapper = new AchillesMapperImpl();
        ConceptMapper conceptMapper = new ConceptMapperImpl();
        conceptService = new ConceptService(entityManager, conceptDao, conceptMapper);
        AchillesAnalysisService achillesAnalysisService = new AchillesAnalysisService(achillesAnalysisDao, achillesMapper, achillesResultDistService);
        dataBrowserController = new DataBrowserController(conceptService, criteriaService, cdrVersionService, domainInfoService, surveyMetadataService,
                surveyModuleService, achillesResultService, achillesAnalysisService);
    }

    @Test
    public void testGetSourceConcepts() throws Exception {
        ResponseEntity<ConceptListResponse> response = dataBrowserController.getSourceConcepts(7890L, 15);
        assertThat(response.getBody().getItems()).containsExactly(CLIENT_CONCEPT_4, CLIENT_CONCEPT_2);
    }

    @Test
    public void testAllConceptSearchEmptyQuery() throws Exception{
        ResponseEntity<ConceptListResponse> response = dataBrowserController.searchConcepts(new SearchConceptsRequest()
                .domain(Domain.CONDITION)
                .minCount(0));
        assertThat(response.getBody().getItems()).containsExactly(CLIENT_CONCEPT_1, CLIENT_CONCEPT_5,
                CLIENT_CONCEPT_6, CLIENT_CONCEPT_7);
    }


    @Test
    public void testConceptSearchMaxResults() throws Exception{
        ResponseEntity<ConceptListResponse> response = dataBrowserController.searchConcepts(new SearchConceptsRequest()
                .domain(Domain.CONDITION)
                .maxResults(1)
                .minCount(0));
        assertThat(response.getBody().getItems()).containsExactly(CLIENT_CONCEPT_5);
    }

    @Test
    public void testCountConceptSearchEmptyQuery() throws Exception{
        ResponseEntity<ConceptListResponse> response = dataBrowserController.searchConcepts(new SearchConceptsRequest()
                .domain(Domain.CONDITION));
        assertThat(response.getBody().getItems()).containsExactly(CLIENT_CONCEPT_1, CLIENT_CONCEPT_5, CLIENT_CONCEPT_6);
    }

    @Test
    public void testConceptSearchStandardConcept() throws Exception{
        try {
            ResponseEntity<ConceptListResponse> response = dataBrowserController.searchConcepts(new SearchConceptsRequest().query("002")
                    .standardConceptFilter(StandardConceptFilter.STANDARD_CONCEPTS));
            assertThat(response.getBody().getItems()).isEmpty();
        } catch(DataNotFoundException dnf) {
        }
    }

    @Test
    public void testConceptSynonymSearch() throws Exception{
        ResponseEntity<ConceptListResponse> response = dataBrowserController.searchConcepts(new SearchConceptsRequest()
                .domain(Domain.CONDITION).query("cstest").standardConceptFilter(StandardConceptFilter.STANDARD_CONCEPTS));
        // CLIENT_CONCEPT_7 excluded because it has a zero count
        assertThat(response.getBody().getItems().get(0).getConceptId()).isEqualTo(7891L);
    }

    @Test
    public void testConceptSearchEmptyQuery() throws Exception{
        ResponseEntity<ConceptListResponse> response = dataBrowserController.searchConcepts(new SearchConceptsRequest()
                .standardConceptFilter(StandardConceptFilter.STANDARD_OR_CODE_ID_MATCH));
        assertThat(response.getBody().getItems()).containsExactly(CLIENT_CONCEPT_1, CLIENT_CONCEPT_4,
                CLIENT_CONCEPT_5, CLIENT_CONCEPT_6);
    }

    @Test
    public void testNonStandardEmptyQuerySearch() throws Exception{
        ResponseEntity<ConceptListResponse> response = dataBrowserController.searchConcepts(new SearchConceptsRequest()
                .query("")
                .standardConceptFilter(StandardConceptFilter.NON_STANDARD_CONCEPTS));
        assertThat(response.getBody().getItems()).containsExactly(CLIENT_CONCEPT_2, CLIENT_CONCEPT_3);
    }

    @Test
    public void testConceptSearchNonStandardConcepts() throws Exception{
        try {
            ResponseEntity<ConceptListResponse> response = dataBrowserController.searchConcepts(new SearchConceptsRequest().query("7891")
                    .standardConceptFilter(StandardConceptFilter.NON_STANDARD_CONCEPTS));
            assertThat(response.getBody().getItems()).isEmpty();
        } catch(DataNotFoundException dnf) {
        }
    }


    @Test
    public void testConceptSearchEmptyCount() throws Exception{
        // We can't test limiting to count > 0 with a concept name search because the match function does not work in hibernate. So we make several concepts with same concept code and one with count 0. The limit > 0 works the same weather it is code or name match.
        ResponseEntity<ConceptListResponse> response = dataBrowserController.searchConcepts(new SearchConceptsRequest().query("004")
                .standardConceptFilter(StandardConceptFilter.STANDARD_CONCEPTS));
        assertThat(response.getBody().getItems().get(0).getConceptCode()).isEqualTo("004");
    }

    @Test
    public void testConceptIdSearch() throws Exception{
        ConceptListResponse response = conceptService.getConcepts(new SearchConceptsRequest().query("456")
                .standardConceptFilter(StandardConceptFilter.STANDARD_OR_CODE_ID_MATCH));
        assertThat(response.getMatchType()).isEqualTo(MatchType.ID);
    }


    @Test
    public void testConceptSearchDomainFilter() throws Exception{
        ResponseEntity<ConceptListResponse> response = dataBrowserController.searchConcepts(new SearchConceptsRequest().query("004").domain(Domain.CONDITION));
        assertThat(response.getBody().getItems().get(0).getConceptId()).isEqualTo(7891L);
    }


    @Test
    public void testConceptCodeMatch() throws Exception {
        ConceptListResponse response = conceptService.getConcepts(new SearchConceptsRequest().query("002")
                .standardConceptFilter(StandardConceptFilter.STANDARD_OR_CODE_ID_MATCH));
        assertThat(response.getMatchType()).isEqualTo(MatchType.CODE);
    }

    @Test
    public void testGetMeasurementAnalysisNoMatch() throws Exception{
        ArrayList<String> queryConceptIds = new ArrayList<String>();
        queryConceptIds.add("137990");
        ResponseEntity<ConceptAnalysisListResponse> response = dataBrowserController.getConceptAnalysisResults(queryConceptIds,"");
        List<ConceptAnalysis> conceptAnalysisList = response.getBody().getItems();
        assertThat(conceptAnalysisList.get(0).getAgeAnalysis()).isEqualTo(null);
    }

    @Test
    public void testGetSurveyDemographicAnalysesMultipleMatch() throws Exception{
        List<String> conceptsIds = new ArrayList<>();
        conceptsIds.add("1586134");
        conceptsIds.add("1585855");
        ResponseEntity<ConceptAnalysisListResponse> response = dataBrowserController.getConceptAnalysisResults(conceptsIds, "");
        List<ConceptAnalysis> conceptAnalysis = response.getBody().getItems();
        assertThat(conceptAnalysis.get(0).getConceptId()).isEqualTo("1586134");
        assertThat(conceptAnalysis.get(1).getConceptId()).isEqualTo("1585855");
    }

    @Test
    public void testGetSurveyDemographicAnalysesNoMatch() throws Exception {
        List<String> conceptsIds = new ArrayList<>();
        conceptsIds.add("1585855");
        ResponseEntity<ConceptAnalysisListResponse> response = dataBrowserController.getConceptAnalysisResults(conceptsIds, "");
        List<ConceptAnalysis> conceptAnalysisList = response.getBody().getItems();
        assertThat(conceptAnalysisList.get(0).getAgeAnalysis()).isEqualTo(null);
    }

    @Test
    public void testGetSurveyVersionCounts() throws Exception {
        try {
            ResponseEntity<SurveyVersionCountResponse> response = dataBrowserController.getSurveyVersionCounts(1333342L);
            AnalysisListResponse analysisList = response.getBody().getAnalyses();
            assertThat(analysisList.getItems().size() == 2);
        } catch (DataNotFoundException dnf) {

        }
    }

    private static DbConcept makeConcept(Concept concept) {
    DbConcept result = new DbConcept();
    result.setConceptId(concept.getConceptId());
    result.setConceptName(concept.getConceptName());
    result.setStandardConcept(concept.getStandardConcept());
    result.setConceptCode(concept.getConceptCode());
    result.setConceptClassId(concept.getConceptClassId());
    result.setVocabularyId(concept.getVocabularyId());
    result.setDomainId(concept.getDomainId());
    result.setCountValue(concept.getCountValue());
    result.setSourceCountValue(concept.getSourceCountValue());
    result.setPrevalence(concept.getPrevalence());
    result.setSynonymsStr(
        String.valueOf(concept.getConceptId()) + '|' +
            Joiner.on("|").join(concept.getConceptSynonyms()));
    result.setCanSelect(1);
    if (concept.getConceptId() == 7892) {
        result.setHasCounts(0);
    } else {
        result.setHasCounts(1);
    }
    return result;
  }

    private ConceptRelationship makeConceptRelationship(long conceptId1, long conceptId2, String relationshipId) {
        ConceptRelationshipId key = new ConceptRelationshipId();
        key.setConceptId1(conceptId1);
        key.setConceptId2(conceptId2);
        key.setRelationshipId(relationshipId);

        ConceptRelationship result = new ConceptRelationship();
        result.setConceptRelationshipId(key);
        return result;
    }

    private static DbAchillesAnalysis makeAchillesAnalysis(DbAchillesAnalysis achillesAnalysis){
        DbAchillesAnalysis aa = new DbAchillesAnalysis();
        aa.setAnalysisId(achillesAnalysis.getAnalysisId());
        aa.setAnalysisName(achillesAnalysis.getAnalysisName());
        aa.setStratum1Name(achillesAnalysis.getStratum1Name());
        aa.setStratum2Name(achillesAnalysis.getStratum2Name());
        aa.setStratum4Name(achillesAnalysis.getStratum4Name());
        aa.setStratum5Name(achillesAnalysis.getStratum5Name());
        aa.setChartType(achillesAnalysis.getChartType());
        aa.setDataType(achillesAnalysis.getDataType());
        return aa;
    }

    private static DbAchillesResult makeAchillesResult(DbAchillesResult achillesResult){
        DbAchillesResult ar = new DbAchillesResult();
        ar.setId(achillesResult.getId());
        ar.setAnalysisId(achillesResult.getAnalysisId());
        ar.setStratum1(achillesResult.getStratum1());
        ar.setStratum2(achillesResult.getStratum2());
        ar.setStratum3(achillesResult.getStratum3());
        ar.setStratum5(achillesResult.getStratum5());
        ar.setCountValue(achillesResult.getCountValue());
        ar.setSourceCountValue(achillesResult.getSourceCountValue());
        return ar;
    }

    private void saveData() {
        makeCdrVersion(1L, "Test Registered CDR",
            123L);
        conceptDao.save(CONCEPT_1);
        conceptDao.save(CONCEPT_2);
        conceptDao.save(CONCEPT_3);
        conceptDao.save(CONCEPT_4);
        conceptDao.save(CONCEPT_5);
        conceptDao.save(CONCEPT_6);
        conceptDao.save(CONCEPT_7);

        conceptRelationshipDao.save(makeConceptRelationship(1234L, 7890L, "maps to"));
        conceptRelationshipDao.save(makeConceptRelationship(456L, 7890L, "maps to"));

        achillesAnalysisDao.save(ACHILLES_ANALYSIS_1);
        achillesAnalysisDao.save(ACHILLES_ANALYSIS_2);
        achillesAnalysisDao.save(ACHILLES_ANALYSIS_3);
        achillesAnalysisDao.save(ACHILLES_ANALYSIS_4);
        achillesAnalysisDao.save(ACHILLES_ANALYSIS_5);
        achillesAnalysisDao.save(ACHILLES_ANALYSIS_6);
        achillesAnalysisDao.save(ACHILLES_ANALYSIS_7);
        achillesAnalysisDao.save(ACHILLES_ANALYSIS_8);

        achillesResultDao.save(ACHILLES_RESULT_1);
        achillesResultDao.save(ACHILLES_RESULT_2);
        achillesResultDao.save(ACHILLES_RESULT_3);
        achillesResultDao.save(ACHILLES_RESULT_4);
        achillesResultDao.save(ACHILLES_RESULT_5);
        achillesResultDao.save(ACHILLES_RESULT_6);
        achillesResultDao.save(ACHILLES_RESULT_7);
        achillesResultDao.save(ACHILLES_RESULT_8);
        achillesResultDao.save(ACHILLES_RESULT_9);
        achillesResultDao.save(ACHILLES_RESULT_10);
        achillesResultDao.save(ACHILLES_RESULT_11);
        achillesResultDao.save(ACHILLES_RESULT_12);
        achillesResultDao.save(ACHILLES_RESULT_13);
    }

    private DbCdrVersion makeCdrVersion(long cdrVersionId, String name, long creationTime) {
        DbCdrVersion dbCdrVersion = new DbCdrVersion();
        dbCdrVersion.setCdrVersionId(cdrVersionId);
        dbCdrVersion.setCreationTime(new Timestamp(creationTime));
        dbCdrVersion.setName(name);
        dbCdrVersion.setNumParticipants(123);
        dbCdrVersion.setPublicDbName("p");
        cdrVersionDao.save(dbCdrVersion);
        return dbCdrVersion;
    }

    @AfterEach
    public void flush(){
        conceptDao.delete(CONCEPT_1);
        conceptDao.delete(CONCEPT_2);
        conceptDao.delete(CONCEPT_3);
        conceptDao.delete(CONCEPT_4);
        conceptDao.delete(CONCEPT_5);
        conceptDao.delete(CONCEPT_6);
        conceptDao.delete(CONCEPT_7);

        conceptRelationshipDao.delete(makeConceptRelationship(1234L, 7890L, "maps to"));
        conceptRelationshipDao.delete(makeConceptRelationship(456L, 7890L, "maps to"));

        achillesResultDao.delete(ACHILLES_RESULT_1);
        achillesResultDao.delete(ACHILLES_RESULT_2);
        achillesResultDao.delete(ACHILLES_RESULT_3);
        achillesResultDao.delete(ACHILLES_RESULT_4);
        achillesResultDao.delete(ACHILLES_RESULT_5);
        achillesResultDao.delete(ACHILLES_RESULT_6);
        achillesResultDao.delete(ACHILLES_RESULT_7);
        achillesResultDao.delete(ACHILLES_RESULT_8);
        achillesResultDao.delete(ACHILLES_RESULT_9);
        achillesResultDao.delete(ACHILLES_RESULT_10);
        achillesResultDao.delete(ACHILLES_RESULT_11);
        achillesResultDao.delete(ACHILLES_RESULT_12);
        achillesResultDao.delete(ACHILLES_RESULT_13);

        achillesAnalysisDao.delete(ACHILLES_ANALYSIS_1);
        achillesAnalysisDao.delete(ACHILLES_ANALYSIS_2);
        achillesAnalysisDao.delete(ACHILLES_ANALYSIS_3);
        achillesAnalysisDao.delete(ACHILLES_ANALYSIS_4);
        achillesAnalysisDao.delete(ACHILLES_ANALYSIS_5);
        achillesAnalysisDao.delete(ACHILLES_ANALYSIS_6);
        achillesAnalysisDao.delete(ACHILLES_ANALYSIS_7);
        achillesAnalysisDao.delete(ACHILLES_ANALYSIS_8);
    }
}
