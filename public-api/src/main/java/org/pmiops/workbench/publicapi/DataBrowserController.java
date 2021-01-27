package org.pmiops.workbench.publicapi;

import java.util.logging.Logger;
import java.util.*;
import com.google.common.base.Strings;
import org.pmiops.workbench.cdr.AchillesMapper;
import java.time.*;
import com.google.common.collect.ImmutableList;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.pmiops.workbench.cdr.dao.ConceptDao;
import org.pmiops.workbench.cdr.dao.CBCriteriaDao;
import org.pmiops.workbench.cdr.dao.ConceptService;
import org.pmiops.workbench.service.CdrVersionService;
import org.pmiops.workbench.model.Analysis;
import org.pmiops.workbench.service.SurveyMetadataService;
import org.pmiops.workbench.service.DomainInfoService;
import org.pmiops.workbench.service.SurveyModuleService;
import org.pmiops.workbench.service.AchillesResultService;
import org.pmiops.workbench.service.AchillesAnalysisService;
import org.pmiops.workbench.cdr.model.Concept;
import org.pmiops.workbench.cdr.model.MeasurementConceptInfo;
import org.pmiops.workbench.cdr.model.CBCriteria;
import org.pmiops.workbench.model.SurveyModule;
import org.pmiops.workbench.model.DomainInfo;
import org.pmiops.workbench.model.AchillesResult;
import org.pmiops.workbench.model.CommonStorageEnums;
import org.pmiops.workbench.model.SurveyMetadata;
import org.pmiops.workbench.model.ConceptListResponse;
import org.pmiops.workbench.model.SurveyVersionCountResponse;
import org.pmiops.workbench.model.SurveyQuestionFetchResponse;
import org.pmiops.workbench.model.SearchConceptsRequest;
import org.pmiops.workbench.model.Domain;
import org.pmiops.workbench.model.AnalysisIdConstant;
import org.pmiops.workbench.model.MatchType;
import org.pmiops.workbench.model.SurveyMetadataListResponse;
import org.pmiops.workbench.model.ConceptAnalysisListResponse;
import org.pmiops.workbench.model.AnalysisListResponse;
import org.pmiops.workbench.model.CountAnalysis;
import org.pmiops.workbench.model.CriteriaParentResponse;
import org.pmiops.workbench.model.CriteriaListResponse;
import org.pmiops.workbench.model.StandardConceptFilter;
import org.pmiops.workbench.model.DomainInfosAndSurveyModulesResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Slice;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import com.google.common.collect.Multimap;
import com.google.common.collect.Multimaps;
import org.pmiops.workbench.exceptions.ServerErrorException;
import org.pmiops.workbench.exceptions.DataNotFoundException;

@RestController
public class DataBrowserController implements DataBrowserApiDelegate {

    @Autowired
    private ConceptDao conceptDao;
    @Autowired
    private CBCriteriaDao criteriaDao;
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
    private CdrVersionService cdrVersionService;
    @Autowired
    private SurveyMetadataService surveyMetadataService;
    @Autowired
    private AchillesMapper achillesMapper;

    private static final Logger logger = Logger.getLogger(DataBrowserController.class.getName());

    public static final ArrayList<Long> FMH_CONDITION_CONCEPT_IDS = new ArrayList<>(Arrays.asList(43528515L, 1384639L, 43528634L, 43528761L, 43529158L, 43529767L, 43529272L, 43529217L, 702786L, 43529966L, 43529638L));
    public static final ArrayList<Long> FMH_FM_CONCEPT_IDS = new ArrayList<>(Arrays.asList(43528764L, 43528763L, 43528649L, 43528651L, 43528650L, 43528765L));

    public static Set<String> validAgeDeciles = new TreeSet<String>(Arrays.asList(new String[]{"2", "3", "4", "5", "6", "7", "8", "9"}));

    public DataBrowserController() {}

    public DataBrowserController(ConceptService conceptService, ConceptDao conceptDao, CBCriteriaDao criteriaDao,
                                 CdrVersionService cdrVersionService,
                                 DomainInfoService domainInfoService,
                                 SurveyMetadataService surveyMetadataService, SurveyModuleService surveyModuleService,
                                 AchillesResultService achillesResultService, AchillesAnalysisService achillesAnalysisService) {
        this.conceptService = conceptService;
        this.conceptDao = conceptDao;
        this.criteriaDao = criteriaDao;
        this.cdrVersionService = cdrVersionService;
        this.surveyMetadataService = surveyMetadataService;
        this.surveyModuleService = surveyModuleService;
        this.domainInfoService = domainInfoService;
        this.achillesResultService = achillesResultService;
        this.achillesAnalysisService = achillesAnalysisService;
    }

    /**
     * Converter function from backend representation (used with Hibernate) to
     * client representation (generated by Swagger).
     */
    private static final Function<Concept, org.pmiops.workbench.model.Concept>
            TO_CLIENT_CONCEPT =
            new Function<Concept, org.pmiops.workbench.model.Concept>() {
                @Override
                public org.pmiops.workbench.model.Concept apply(Concept concept) {
                    org.pmiops.workbench.model.MeasurementConceptInfo measurementInfo = null;
                    if(concept.getMeasurementConceptInfo() != null){
                        measurementInfo = TO_CLIENT_MEASUREMENT_CONCEPT_INFO.apply(concept.getMeasurementConceptInfo());
                    }
                    String graphToShow = null;
                    if (concept.getDomainId().equals("Measurement") && concept.getMeasurementConceptInfo() != null && concept.getMeasurementConceptInfo().getHasValues() == 1) {
                        graphToShow = "Values";
                    } else {
                        graphToShow = "Sex Assigned at Birth";
                    }
                    return new org.pmiops.workbench.model.Concept()
                            .conceptId(concept.getConceptId())
                            .conceptName(concept.getConceptName())
                            .standardConcept(concept.getStandardConcept())
                            .conceptCode(concept.getConceptCode())
                            .conceptClassId(concept.getConceptClassId())
                            .vocabularyId(concept.getVocabularyId())
                            .domainId(concept.getDomainId())
                            .countValue(concept.getCountValue())
                            .sourceCountValue(concept.getSourceCountValue())
                            .prevalence(concept.getPrevalence())
                            .conceptSynonyms(concept.getSynonyms())
                            .canSelect(concept.getCanSelect())
                            .measurementConceptInfo(measurementInfo)
                            .drugBrands(concept.getDrugBrands())
                            .graphToShow(graphToShow);
                }
            };

    /**
     * Converter function from backend representation (used with Hibernate) to
     * client representation (generated by Swagger).
     */
    private static final Function<MeasurementConceptInfo, org.pmiops.workbench.model.MeasurementConceptInfo>
            TO_CLIENT_MEASUREMENT_CONCEPT_INFO =
            new Function<MeasurementConceptInfo, org.pmiops.workbench.model.MeasurementConceptInfo>() {
                @Override
                public org.pmiops.workbench.model.MeasurementConceptInfo apply(MeasurementConceptInfo measurementConceptInfo) {
                    return new org.pmiops.workbench.model.MeasurementConceptInfo()
                            .conceptId(measurementConceptInfo.getConceptId())
                            .hasValues(measurementConceptInfo.getHasValues());
                }
            };

    /**
     * Converter function from backend representation (used with Hibernate) to
     * client representation (generated by Swagger).
     */
    private static final Function<CBCriteria, org.pmiops.workbench.model.CBCriteria>
            TO_CLIENT_CBCRITERIA =
            new Function<CBCriteria, org.pmiops.workbench.model.CBCriteria>() {
                @Override
                public org.pmiops.workbench.model.CBCriteria apply(CBCriteria criteria) {
                    return new org.pmiops.workbench.model.CBCriteria()
                            .id(criteria.getId())
                            .parentId(criteria.getParentId())
                            .type(criteria.getType())
                            .subtype(criteria.getType())
                            .code(criteria.getCode())
                            .name(criteria.getName())
                            .group(criteria.getGroup())
                            .selectable(criteria.getSelectable())
                            .count(Long.valueOf(criteria.getCount()))
                            .sourceCount(criteria.getSourceCount())
                            .domainId(criteria.getDomainId())
                            .conceptId(criteria.getConceptId())
                            .path(criteria.getPath())
                            .canSelect(criteria.getCanSelect());
                }
            };

    @Override
    public ResponseEntity<CriteriaParentResponse> getCriteriaRolledCounts(Long conceptId, String domainId) {
        try {
            cdrVersionService.setDefaultCdrVersion();
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }
        List<CBCriteria> criteriaList = criteriaDao.findParentCounts(String.valueOf(conceptId), domainId.toUpperCase(), new String(domainId+"_rank1"));
        Multimap<String, CBCriteria> criteriaRowsByConcept = Multimaps.index(criteriaList, CBCriteria::getConceptId);
        CriteriaParentResponse response = new CriteriaParentResponse();
        if (criteriaList.size() > 0) {
            List<CBCriteria> parentList = criteriaRowsByConcept.get(String.valueOf(conceptId)).stream().collect(Collectors.toList());
            CBCriteria parent = null;
            CBCriteria standardParent = null;
            CBCriteria sourceParent = null;
            if (parentList.size() > 1) {
                List<CBCriteria> standardParentList = parentList.stream().filter(p -> p.getStandard() == true).collect(Collectors.toList());
                standardParent = (standardParentList != null && standardParentList.size() > 0) ? standardParentList.get(0) : null;
                List<CBCriteria> sourceParentList = parentList.stream().filter(p -> p.getStandard() == false).collect(Collectors.toList());
                sourceParent = (sourceParentList != null && sourceParentList.size() > 0) ? sourceParentList.get(0) : null;
                if (standardParent != null) {
                    if (sourceParent != null) {
                        standardParent.setSourceCount(sourceParent.getCount());
                    }
                    parent = standardParent;
                } else {
                    parent = sourceParent;
                }
            } else {
                parent = parentList.get(0);
            }
            if (criteriaList.size() >= 1) {
                criteriaList.remove(parent);
            }
            Optional.ofNullable(parent).orElseThrow(() -> new DataNotFoundException("Cannot find rolled up counts of this concept"));
            response.setParent(TO_CLIENT_CBCRITERIA.apply(parent));
            Multimap<Long, CBCriteria> parentCriteria = Multimaps
                    .index(criteriaList, CBCriteria::getParentId);
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.ok(response);
        }
    }

    @Override
    public ResponseEntity<CriteriaListResponse> getCriteriaChildren(Long parentId) {
        try {
            cdrVersionService.setDefaultCdrVersion();
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }
        List<CBCriteria> criteriaList = criteriaDao.findCriteriaChildren(parentId);
        CriteriaListResponse criteriaListResponse = new CriteriaListResponse();
        criteriaListResponse.setItems(criteriaList.stream().map(TO_CLIENT_CBCRITERIA).collect(Collectors.toList()));
        return ResponseEntity.ok(criteriaListResponse);
    }

    @Override
    public ResponseEntity<ConceptListResponse> searchConcepts(SearchConceptsRequest searchConceptsRequest){
        try {
            cdrVersionService.setDefaultCdrVersion();
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }
        Integer maxResults = searchConceptsRequest.getMaxResults();
        if(maxResults == null || maxResults == 0){
            maxResults = Integer.MAX_VALUE;
        }
        List<Long> drugConcepts = new ArrayList<>();

        if(searchConceptsRequest.getDomain() != null && searchConceptsRequest.getDomain().equals(Domain.DRUG) && searchConceptsRequest.getQuery() != null && !searchConceptsRequest.getQuery().isEmpty()) {
            List<Long> drugMatchedConcepts = new ArrayList<>();
            drugMatchedConcepts = conceptDao.findDrugIngredientsByBrand(searchConceptsRequest.getQuery());
            if(drugMatchedConcepts.size() > 0) {
                drugConcepts = drugMatchedConcepts;
            }
        }

        Integer minCount = searchConceptsRequest.getMinCount();
        if(minCount == null){
            minCount = 1;
        }

        StandardConceptFilter standardConceptFilter = searchConceptsRequest.getStandardConceptFilter();


        if(searchConceptsRequest.getQuery() == null || searchConceptsRequest.getQuery().isEmpty()){
            if(standardConceptFilter == null || standardConceptFilter == StandardConceptFilter.STANDARD_OR_CODE_ID_MATCH){
                standardConceptFilter = StandardConceptFilter.STANDARD_CONCEPTS;
            }
        }else{
            if(standardConceptFilter == null){
                standardConceptFilter = StandardConceptFilter.STANDARD_OR_CODE_ID_MATCH;
            }
        }

        String domainId = null;
        if (searchConceptsRequest.getDomain() != null) {
            domainId = CommonStorageEnums.domainToDomainId(searchConceptsRequest.getDomain());
        }

        ConceptService.StandardConceptFilter convertedConceptFilter = ConceptService.StandardConceptFilter.valueOf(standardConceptFilter.name());

        Slice<Concept> concepts = null;
        int measurementTests = 1;
        int measurementOrders = 1;

        if (domainId != null && domainId.equals("Measurement")) {
            if (searchConceptsRequest.getMeasurementTests() != null) {
                measurementTests = searchConceptsRequest.getMeasurementTests();
            }
            if (searchConceptsRequest.getMeasurementOrders() != null) {
                measurementOrders = searchConceptsRequest.getMeasurementOrders();
            }
        }
        concepts = conceptService.searchConcepts(searchConceptsRequest.getQuery(), convertedConceptFilter, drugConcepts,
                searchConceptsRequest.getVocabularyIds(), domainId, maxResults, minCount,
                (searchConceptsRequest.getPageNumber() == null) ? 0 : searchConceptsRequest.getPageNumber(), measurementTests, measurementOrders);

        ConceptListResponse response = new ConceptListResponse();

        for(Concept con : concepts.getContent()){
            String conceptCode = con.getConceptCode();
            String conceptId = String.valueOf(con.getConceptId());

            if((con.getStandardConcept() == null || !con.getStandardConcept().equals("S") ) && (searchConceptsRequest.getQuery().equals(conceptCode) || searchConceptsRequest.getQuery().equals(conceptId))){
                List<Concept> stdConcepts = conceptDao.findStandardConcepts(con.getConceptId());
                response.setStandardConcepts(stdConcepts.stream().map(TO_CLIENT_CONCEPT).collect(Collectors.toList()));
                response.setSourceOfStandardConcepts(con.getConceptId());
            }

            if(!Strings.isNullOrEmpty(searchConceptsRequest.getQuery()) && (searchConceptsRequest.getQuery().equals(conceptCode) || searchConceptsRequest.getQuery().equals(conceptId))) {
                response.setMatchType(conceptCode.equals(searchConceptsRequest.getQuery()) ? MatchType.CODE : MatchType.ID );
                response.setMatchedConceptName(con.getConceptName());
            }
        }

        if(response.getMatchType() == null && response.getStandardConcepts() == null){
            response.setMatchType(MatchType.NAME);
        }

        List<Concept> conceptList = new ArrayList<>();

        if (concepts != null) {
            conceptList = new ArrayList(concepts.getContent());
            if(response.getStandardConcepts() != null) {
                conceptList = conceptList.stream().filter(c -> Long.valueOf(c.getConceptId()) != Long.valueOf(response.getSourceOfStandardConcepts())).collect(Collectors.toList());
            }
        }

        response.setItems(conceptList.stream().map(TO_CLIENT_CONCEPT).collect(Collectors.toList()));
        return ResponseEntity.ok(response);
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
            List<Long> drugMatchedConceptIds = conceptDao.findDrugIngredientsByBrand(query);
            if (drugMatchedConceptIds.size() > 0) {
                toMatchConceptIds.addAll(drugMatchedConceptIds);
            }

            Integer getTests = null;
            Integer getOrders = null;

            if (testFilter == 1 && orderFilter == 1) {
                getTests = 1;
                getOrders = 0;
            } else if (testFilter == 1 && orderFilter == 0) {
                getTests = 1;
                getOrders = 2;
            } else if (testFilter == 0 && orderFilter == 1) {
                getTests = 2;
                getOrders = 0;
            } else if (testFilter == 0 && orderFilter == 0) {
                getTests = 2;
                getOrders = 2;
            }

            domainInfoList = domainInfoService.getStandardCodeMatchCounts(domainKeyword, query, toMatchConceptIds, getTests, getOrders);
            surveyModuleList = surveyModuleService.findSurveyModuleQuestionCounts(surveyKeyword, FMH_CONDITION_CONCEPT_IDS, FMH_FM_CONCEPT_IDS);
        } else {
            Integer getTests = null;
            Integer getOrders = null;

            if (testFilter == 1 && orderFilter == 1) {
                getTests = 1;
                getOrders = 0;
            } else if (testFilter == 1 && orderFilter == 0) {
                getTests = 1;
                getOrders = 2;
            } else if (testFilter == 0 && orderFilter == 1) {
                getTests = 2;
                getOrders = 0;
            } else if (testFilter == 0 && orderFilter == 0) {
                getTests = 2;
                getOrders = 2;
            }

            domainInfoList =  ImmutableList.copyOf(domainInfoService.getDomainTotals(getTests, getOrders));
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

        List<Analysis> surveyAnalysisList = achillesAnalysisService.findSubQuestionResults(ImmutableList.of(3110L, 3111L, 3112L, 3113L), questionIds);

        SurveyMetadataListResponse questionResp = new SurveyMetadataListResponse();
        questionResp.setItems(mapAnalysesToQuestions(surveyAnalysisList, questions));

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

        List<SurveyMetadata> mappedQuestions = mapAnalysesToQuestions(analyses, subQuestions);

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
        List<Analysis> surveyAnalysisList = achillesAnalysisService.findSurveyQuestionResults(ImmutableList.of(3110L, 3111L, 3112L, 3113L), String.valueOf(surveyConceptId), String.valueOf(conceptId), questionPath);
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
        List<Concept> conceptList = conceptDao.findSourceConcepts(conceptId,count);
        ConceptListResponse resp = new ConceptListResponse();
        resp.setItems(conceptList.stream().map(TO_CLIENT_CONCEPT).collect(Collectors.toList()));
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

    public List<SurveyMetadata> mapAnalysesToQuestions(List<Analysis> analyses, List<SurveyMetadata> questions) {
        Map<Long, List<AchillesResult>> countAnalysisResultsByQuestion = new HashMap<>();
        Map<Long, List<AchillesResult>> genderAnalysisResultsByQuestion = new HashMap<>();
        Map<Long, List<AchillesResult>> ageAnalysisResultsByQuestion = new HashMap<>();
        Map<Long, List<AchillesResult>> versionAnalysisResultsByQuestion = new HashMap<>();

        Analysis countAnalysis = null;
        Analysis genderAnalysis = null;
        Analysis ageAnalysis = null;
        Analysis versionAnalysis = null;

        for (Analysis aa: analyses) {
            if (aa.getAnalysisId().equals(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.SURVEY_COUNT_ANALYSIS_ID))) {
                countAnalysis = aa;
                for(AchillesResult ar: aa.getResults()) {
                    Long questionId = Long.valueOf(ar.getStratum2());

                    if (countAnalysisResultsByQuestion.containsKey(questionId)) {
                        List<AchillesResult> tempResults = countAnalysisResultsByQuestion.get(questionId);
                        tempResults.add(ar);
                    } else {
                        List<AchillesResult> tempResults = new ArrayList<>();
                        tempResults.add(ar);
                        countAnalysisResultsByQuestion.put(questionId, tempResults);
                    }
                }
            }
            if (aa.getAnalysisId().equals(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.SURVEY_GENDER_ANALYSIS_ID))) {
                genderAnalysis = aa;
                for(AchillesResult ar: aa.getResults()) {
                    Long questionId = Long.valueOf(ar.getStratum2());

                    if (genderAnalysisResultsByQuestion.containsKey(questionId)) {
                        List<AchillesResult> tempResults = genderAnalysisResultsByQuestion.get(questionId);
                        tempResults.add(ar);
                    } else {
                        List<AchillesResult> tempResults = new ArrayList<>();
                        tempResults.add(ar);
                        genderAnalysisResultsByQuestion.put(questionId, tempResults);
                    }
                }
            }
            if (aa.getAnalysisId().equals(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.SURVEY_AGE_ANALYSIS_ID))) {
                ageAnalysis = aa;
                for (AchillesResult ar : aa.getResults()) {
                    Long questionId = Long.valueOf(ar.getStratum2());

                    if (validAgeDeciles.contains(ar.getStratum5())) {
                        if (ageAnalysisResultsByQuestion.containsKey(questionId)) {
                            List<AchillesResult> tempResults = ageAnalysisResultsByQuestion.get(questionId);
                            tempResults.add(ar);
                        } else {
                            List<AchillesResult> tempResults = new ArrayList<>();
                            tempResults.add(ar);
                            ageAnalysisResultsByQuestion.put(questionId, tempResults);
                        }
                    }
                }
            }
            if (aa.getAnalysisId().equals(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.SURVEY_VERSION_ANALYSIS_ID))) {

                versionAnalysis = aa;
                for(AchillesResult ar: aa.getResults()) {
                    Long questionId = Long.valueOf(ar.getStratum2());

                    if (versionAnalysisResultsByQuestion.containsKey(questionId)) {
                        List<AchillesResult> tempResults = versionAnalysisResultsByQuestion.get(questionId);
                        tempResults.add(ar);
                    } else {
                        List<AchillesResult> tempResults = new ArrayList<>();
                        tempResults.add(ar);
                        versionAnalysisResultsByQuestion.put(questionId, tempResults);
                    }
                }
            }

        }

        for(SurveyMetadata q: questions) {
            if (countAnalysis != null) {
                Analysis ca = achillesMapper.makeCopyAnalysis(countAnalysis);
                ca.setResults(countAnalysisResultsByQuestion.get(q.getConceptId()));
                q.setCountAnalysis(ca);
            }
            if (genderAnalysis != null) {
                Analysis ga = achillesMapper.makeCopyAnalysis(genderAnalysis);
                ga.setResults(genderAnalysisResultsByQuestion.get(q.getConceptId()));
                q.setGenderAnalysis(ga);
            }
            if (ageAnalysis != null) {
                Analysis aa = achillesMapper.makeCopyAnalysis(ageAnalysis);
                aa.setResults(ageAnalysisResultsByQuestion.get(q.getConceptId()));
                q.setAgeAnalysis(aa);
            }
            if (versionAnalysis != null) {
                Analysis aa = achillesMapper.makeCopyAnalysis(versionAnalysis);
                aa.setResults(versionAnalysisResultsByQuestion.get(q.getConceptId()));
                q.setVersionAnalysis(aa);
            }
        }

        return questions;
    }
}