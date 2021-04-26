package org.pmiops.workbench.publicapi;

import java.util.logging.Logger;
import java.time.*;
import com.google.common.collect.ImmutableList;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import org.pmiops.workbench.cdr.dao.ConceptService;
import org.pmiops.workbench.service.CdrVersionService;
import org.pmiops.workbench.model.Analysis;
import org.pmiops.workbench.service.SurveyMetadataService;
import org.pmiops.workbench.service.DomainInfoService;
import org.pmiops.workbench.service.CriteriaService;
import org.pmiops.workbench.service.SurveyModuleService;
import org.pmiops.workbench.service.AchillesResultService;
import org.pmiops.workbench.service.AchillesAnalysisService;
import org.pmiops.workbench.model.SurveyModule;
import org.pmiops.workbench.model.DomainInfo;
import org.pmiops.workbench.model.AchillesResult;
import org.pmiops.workbench.model.CommonStorageEnums;
import org.pmiops.workbench.model.SurveyMetadata;
import org.pmiops.workbench.model.ConceptListResponse;
import org.pmiops.workbench.model.SurveyVersionCountResponse;
import org.pmiops.workbench.model.SurveyQuestionFetchResponse;
import org.pmiops.workbench.model.SearchConceptsRequest;
import org.pmiops.workbench.model.AnalysisIdConstant;
import org.pmiops.workbench.model.SurveyMetadataListResponse;
import org.pmiops.workbench.model.ConceptAnalysisListResponse;
import org.pmiops.workbench.model.AnalysisListResponse;
import org.pmiops.workbench.model.CountAnalysis;
import org.pmiops.workbench.model.CriteriaParentResponse;
import org.pmiops.workbench.model.CriteriaListResponse;
import org.pmiops.workbench.model.TestFilter;
import org.pmiops.workbench.model.OrderFilter;
import org.pmiops.workbench.model.DomainInfosAndSurveyModulesResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.pmiops.workbench.exceptions.ServerErrorException;

@RestController
public class DataBrowserController implements DataBrowserApiDelegate {

    @Autowired
    private AchillesResultService achillesResultService;
    @Autowired
    private AchillesAnalysisService achillesAnalysisService;
    @Autowired
    private DomainInfoService domainInfoService;
    @Autowired
    private SurveyModuleService surveyModuleService;
    @Autowired
    private ConceptService conceptService;
    @Autowired
    private CriteriaService criteriaService;
    @Autowired
    private CdrVersionService cdrVersionService;
    @Autowired
    private SurveyMetadataService surveyMetadataService;

    private static final Logger logger = Logger.getLogger(DataBrowserController.class.getName());

    public static final ArrayList<Long> FMH_CONDITION_CONCEPT_IDS = new ArrayList<>(Arrays.asList(43528515L, 1384639L, 43528634L, 43528761L, 43529158L, 43529767L, 43529272L, 43529217L, 702786L, 43529966L, 43529638L));
    public static final ArrayList<Long> FMH_FM_CONCEPT_IDS = new ArrayList<>(Arrays.asList(43528764L, 43528763L, 43528649L, 43528651L, 43528650L, 43528765L));

    public static Set<String> validAgeDeciles = new TreeSet<String>(Arrays.asList(new String[]{"2", "3", "4", "5", "6", "7", "8", "9"}));

    public DataBrowserController() {}

    public DataBrowserController(ConceptService conceptService, CriteriaService criteriaService,
                                 CdrVersionService cdrVersionService, DomainInfoService domainInfoService,
                                 SurveyMetadataService surveyMetadataService, SurveyModuleService surveyModuleService,
                                 AchillesResultService achillesResultService, AchillesAnalysisService achillesAnalysisService) {
        this.conceptService = conceptService;
        this.criteriaService = criteriaService;
        this.cdrVersionService = cdrVersionService;
        this.surveyMetadataService = surveyMetadataService;
        this.surveyModuleService = surveyModuleService;
        this.domainInfoService = domainInfoService;
        this.achillesResultService = achillesResultService;
        this.achillesAnalysisService = achillesAnalysisService;
    }

    @Override
    public ResponseEntity<CriteriaParentResponse> getCriteriaRolledCounts(Long conceptId, String domainId) {
        try {
            cdrVersionService.setDefaultCdrVersion();
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }
        return ResponseEntity.ok(criteriaService.getRolledUpCounts(String.valueOf(conceptId), domainId));
    }

    @Override
    public ResponseEntity<CriteriaListResponse> getCriteriaChildren(Long parentId) {
        try {
            cdrVersionService.setDefaultCdrVersion();
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }
        CriteriaListResponse criteriaListResponse = new CriteriaListResponse();
        criteriaListResponse.setItems(criteriaService.getCriteriaChildren(parentId));
        return ResponseEntity.ok(criteriaListResponse);
    }

    @Override
    public ResponseEntity<ConceptListResponse> searchConcepts(SearchConceptsRequest searchConceptsRequest){
        try {
            cdrVersionService.setDefaultCdrVersion();
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }
        return ResponseEntity.ok(conceptService.getConcepts(searchConceptsRequest));
    }

    @Override
    public ResponseEntity<DomainInfosAndSurveyModulesResponse> getDomainTotals(String query, Integer testFilter, Integer orderFilter){
        try {
            cdrVersionService.setDefaultCdrVersion();
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }

        List<DomainInfo> domainInfoList =  null;
        List<SurveyModule> surveyModuleList = null;

        if (query != null && !query.isEmpty() && query.length() > 0) {
            String domainKeyword = ConceptService.modifyMultipleMatchKeyword(query, ConceptService.SearchType.DOMAIN_COUNTS);
            String surveyKeyword = ConceptService.modifyMultipleMatchKeyword(query, ConceptService.SearchType.SURVEY_COUNTS);

            Long conceptId = 0L;
            try {
                conceptId = Long.parseLong(query);
            } catch (NumberFormatException e) {
                // expected
            }
            // TODO: consider parallelizing these lookups
            List<Long> toMatchConceptIds = new ArrayList<>();
            toMatchConceptIds.add(conceptId);
            List<Long> drugMatchedConceptIds = conceptService.getDrugIngredientsByBrand(query);
            if (drugMatchedConceptIds.size() > 0) {
                toMatchConceptIds.addAll(drugMatchedConceptIds);
            }

            // TODO change these inputs from api call in ehr component
            List<String> filter = domainInfoService.getTestOrderFilter(testFilter == 1 ? TestFilter.SELECTED: TestFilter.UNSELECTED, orderFilter == 1 ? OrderFilter.SELECTED: OrderFilter.UNSELECTED);

            domainInfoList = domainInfoService.getStandardCodeMatchCounts(domainKeyword, query, toMatchConceptIds, filter);
            surveyModuleList = surveyModuleService.findSurveyModuleQuestionCounts(surveyKeyword, FMH_CONDITION_CONCEPT_IDS, FMH_FM_CONCEPT_IDS);
        } else {
            List<String> filter = domainInfoService.getTestOrderFilter(testFilter == 1 ? TestFilter.SELECTED: TestFilter.UNSELECTED, orderFilter == 1 ? OrderFilter.SELECTED: OrderFilter.UNSELECTED);

            domainInfoList =  ImmutableList.copyOf(domainInfoService.getDomainTotals(filter));
            surveyModuleList = ImmutableList.copyOf(surveyModuleService.findSurveyModules());
        }

        DomainInfosAndSurveyModulesResponse response = new DomainInfosAndSurveyModulesResponse();
        response.setDomainInfos(domainInfoList);
        response.setSurveyModules(surveyModuleList);
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<org.pmiops.workbench.model.CdrVersion> getCdrVersionUsed() {
        try {
            cdrVersionService.setDefaultCdrVersion();
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }

        return ResponseEntity.ok(cdrVersionService.findByIsDefault(true));
    }

    @Override
    public ResponseEntity<Analysis> getGenderAnalysis(){
        try {
            cdrVersionService.setDefaultCdrVersion();
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }
        return ResponseEntity.ok(achillesAnalysisService.getGenderAnalysis());
    }

    @Override
    public ResponseEntity<SurveyQuestionFetchResponse> getSurveyQuestions(Long surveyConceptId, String searchWord) {
        try {
            cdrVersionService.setDefaultCdrVersion();
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }

        SurveyQuestionFetchResponse response = new SurveyQuestionFetchResponse();

        response.setSurvey(surveyModuleService.findByConceptId(surveyConceptId));

        String surveyKeyword = ConceptService.modifyMultipleMatchKeyword(searchWord, ConceptService.SearchType.SURVEY_COUNTS);

        SurveyMetadataListResponse questionResp = new SurveyMetadataListResponse();

        if (searchWord == null || searchWord.isEmpty()) {
            // Get all the questions
            questionResp.setItems(surveyMetadataService.getSurveyQuestions(surveyConceptId));
        } else {
            // TODO Get only the matching questions
            questionResp.setItems(surveyMetadataService.getMatchingSurveyQuestions(surveyConceptId, searchWord));
        }

        response.setQuestions(questionResp);
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<SurveyQuestionFetchResponse> getSubQuestions(Long surveyConceptId, Long conceptId, Long answerConceptId, Integer level) {
        try {
            cdrVersionService.setDefaultCdrVersion();
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }
        SurveyQuestionFetchResponse response = new SurveyQuestionFetchResponse();

        List<SurveyMetadata> questions = new ArrayList<>();

        if (level == 1) {
            questions = surveyMetadataService.getSubQuestionsLevel1(String.valueOf(conceptId), String.valueOf(answerConceptId), String.valueOf(surveyConceptId));
        } else if (level == 2) {
            questions = surveyMetadataService.getSubQuestionsLevel2(String.valueOf(answerConceptId));
        }

        List<String> questionIds = new ArrayList<>();

        for(SurveyMetadata qc: questions) {
            questionIds.add(String.valueOf(qc.getConceptId()));
        }

        List<Analysis> surveyAnalysisList = achillesAnalysisService.findSubQuestionResults(ImmutableList.of(3110L, 3111L, 3112L, 3113L, 3203L), questionIds);

        SurveyMetadataListResponse questionResp = new SurveyMetadataListResponse();
        questionResp.setItems(achillesAnalysisService.mapAnalysesToQuestions(surveyAnalysisList, questions, surveyConceptId));

        response.setQuestions(questionResp);

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<SurveyQuestionFetchResponse> getFMHQuestions(Long surveyConceptId, List<String> conceptIds, String searchWord) {
        try {
            cdrVersionService.setDefaultCdrVersion();
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }
        SurveyQuestionFetchResponse response = new SurveyQuestionFetchResponse();

        response.setSurvey(surveyModuleService.findByConceptId(surveyConceptId));

        SurveyMetadataListResponse questionResp = new SurveyMetadataListResponse();

        if (searchWord == null || searchWord.isEmpty()) {
            // Get all the questions\
            questionResp.setItems(surveyMetadataService.getFMHQuestions(conceptIds));
        } else {
            // TODO Get only the matching questions
            questionResp.setItems(surveyMetadataService.getMatchingFMHQuestions(conceptIds, searchWord));
        }

        response.setQuestions(questionResp);
        return ResponseEntity.ok(response);

    }

    @Override
    public ResponseEntity<SurveyMetadataListResponse> getFMHSurveyQuestionResults(String conceptId, String answerConceptId) {
        try {
            cdrVersionService.setDefaultCdrVersion();
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }

        SurveyMetadataListResponse resp = new SurveyMetadataListResponse();
        List<SurveyMetadata> subQuestions = surveyMetadataService.getSubQuestionsLevel1(conceptId, answerConceptId, "43528698");
        List<String> conceptIds = new ArrayList<>();

        for(SurveyMetadata q: subQuestions) {
            conceptIds.add(String.valueOf(q.getConceptId()));
        }

        List<Analysis> analyses = achillesAnalysisService.findSurveyAnalysisResults("43528698", conceptIds);
        List<SurveyMetadata> mappedQuestions = achillesAnalysisService.mapAnalysesToQuestions(analyses, subQuestions, 43528698L);
        resp.setItems(mappedQuestions);
        return ResponseEntity.ok(resp);
    }

    @Override
    public ResponseEntity<AnalysisListResponse> getSurveyQuestionResults(Long surveyConceptId, Long conceptId, String questionPath) {
        try {
            cdrVersionService.setDefaultCdrVersion();
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }

        AnalysisListResponse analysisListResponse = new AnalysisListResponse();
        System.out.println("Am i here at all");
        List<Analysis> surveyAnalysisList = achillesAnalysisService.findSurveyQuestionResults(ImmutableList.of(3110L, 3111L, 3112L, 3113L, 3203L), String.valueOf(surveyConceptId), String.valueOf(conceptId), questionPath);
        analysisListResponse.setItems(surveyAnalysisList);

        return ResponseEntity.ok(analysisListResponse);
    }

    @Override
    public ResponseEntity<SurveyVersionCountResponse> getSurveyVersionCounts(Long surveyConceptId) {
        try {
            cdrVersionService.setDefaultCdrVersion();
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }

        SurveyVersionCountResponse surveyVersionCountResponse = new SurveyVersionCountResponse();

        List<Analysis> surveyAnalysisList = achillesAnalysisService.findAnalysisByIds(ImmutableList.of(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.SURVEY_VERSION_PARTICIPANT_COUNT_ANALYSIS_ID), CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.SURVEY_VERSION_QUESTION_COUNT_ANALYSIS_ID)));
        AnalysisListResponse analysisListResponse = new AnalysisListResponse();
        analysisListResponse.setItems(surveyAnalysisList);
        surveyVersionCountResponse.setAnalyses(analysisListResponse);

        return ResponseEntity.ok(surveyVersionCountResponse);
    }

    @Override
    public ResponseEntity<CountAnalysis> getCountAnalysis(String domainId, String domainDesc) {
        cdrVersionService.setDefaultCdrVersion();
        ImmutableList<Long> analysisIds = null;
        int stratum;
        if (domainDesc.equals("survey")){
            analysisIds = ImmutableList.of(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.SURVEY_GENDER_COUNT_ANALYSIS_ID), CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.SURVEY_AGE_COUNT_ANALYSIS_ID));
            stratum = 2;
        } else {
            analysisIds = ImmutableList.of(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.EHR_GENDER_COUNT_ANALYSIS_ID), CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.EHR_AGE_COUNT_ANALYSIS_ID));
            stratum = 4;
        }
        return ResponseEntity.ok(achillesAnalysisService.getCountAnalysis(domainId, domainDesc, analysisIds, stratum));
    }

    @Override
    public ResponseEntity<AnalysisListResponse> getSurveyQuestionCounts(String conceptId, String questionPath) {
        try {
            cdrVersionService.setDefaultCdrVersion();
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }
        List<Analysis> surveyQuestionCountList = achillesAnalysisService.findSurveyQuestionCounts(ImmutableList.of(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.SURVEY_QUESTION_GENDER_COUNT_ANALYSIS_ID), CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.SURVEY_QUESTION_AGE_COUNT_ANALYSIS_ID)), conceptId, questionPath);

        AnalysisListResponse analysisListResponse = new AnalysisListResponse();
        analysisListResponse.setItems(surveyQuestionCountList);
        return ResponseEntity.ok(analysisListResponse);
    }

    @Override
    public ResponseEntity<ConceptAnalysisListResponse> getConceptAnalysisResults(List<String> conceptIds, String domainId){
        try {
            cdrVersionService.setDefaultCdrVersion();
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }

        ConceptAnalysisListResponse resp=new ConceptAnalysisListResponse();
        resp.setItems(achillesAnalysisService.getConceptAnalyses(conceptIds, domainId));
        return ResponseEntity.ok(resp);
    }

    @Override
    public ResponseEntity<ConceptAnalysisListResponse> getFitbitAnalysisResults(List<String> concepts) {
        try {
            cdrVersionService.setDefaultCdrVersion();
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }

        ConceptAnalysisListResponse resp=new ConceptAnalysisListResponse();
        resp.setItems(achillesAnalysisService.getFitbitConceptAnalyses(concepts));
        return ResponseEntity.ok(resp);
    }

    /**
     * This method gets concepts with maps to relationship in concept relationship table
     *
     * @param conceptId
     * @return
     */
    @Override
    public ResponseEntity<ConceptListResponse> getSourceConcepts(Long conceptId,Integer minCount) {
        try {
            cdrVersionService.setDefaultCdrVersion();
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }
        Integer count=minCount;
        if(count == null){
            count = 0;
        }
        ConceptListResponse resp = new ConceptListResponse();
        resp.setItems(conceptService.getSourceConcepts(conceptId, count));
        return ResponseEntity.ok(resp);
    }

    @Override
    public ResponseEntity<AchillesResult> getParticipantCount() {
        try {
            cdrVersionService.setDefaultCdrVersion();
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }
        return ResponseEntity.ok(achillesResultService.findAchillesResultByAnalysisId(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.PARTICIPANT_COUNT_ANALYSIS_ID)));
    }
}