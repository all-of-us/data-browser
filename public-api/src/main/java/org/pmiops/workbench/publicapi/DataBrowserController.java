package org.pmiops.workbench.publicapi;

import java.util.logging.Logger;
import org.apache.commons.lang3.math.NumberUtils;
import com.google.common.base.Strings;
import com.google.common.collect.ImmutableList;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Collections;
import java.util.TreeSet;
import java.io.IOException;
import java.util.function.Function;
import java.util.stream.Collectors;
import javax.inject.Provider;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import org.pmiops.workbench.cdr.CdrVersionContext;
import org.pmiops.workbench.cdr.dao.ConceptDao;
import org.pmiops.workbench.db.dao.CdrVersionDao;
import org.pmiops.workbench.cdr.dao.CBCriteriaDao;
import org.pmiops.workbench.cdr.dao.QuestionConceptDao;
import org.pmiops.workbench.cdr.dao.AchillesAnalysisDao;
import org.pmiops.workbench.cdr.dao.DomainInfoDao;
import org.pmiops.workbench.cdr.dao.SurveyModuleDao;
import org.pmiops.workbench.cdr.dao.AchillesResultDao;
import org.pmiops.workbench.cdr.dao.AchillesResultDistDao;
import org.pmiops.workbench.cdr.model.SurveyQuestionMap;
import org.pmiops.workbench.model.SurveyQuestionAnalysis;
import org.pmiops.workbench.model.SurveyQuestionResult;
import org.pmiops.workbench.cdr.dao.ConceptService;
import org.pmiops.workbench.cdr.model.AchillesResult;
import org.pmiops.workbench.cdr.model.AchillesAnalysis;
import org.pmiops.workbench.cdr.model.AchillesResultDist;
import org.pmiops.workbench.cdr.model.Concept;
import org.pmiops.workbench.cdr.model.MeasurementConceptInfo;
import org.pmiops.workbench.db.model.CdrVersion;
import org.pmiops.workbench.cdr.model.CBCriteria;
import org.pmiops.workbench.cdr.model.DomainInfo;
import org.pmiops.workbench.cdr.model.QuestionConcept;
import org.pmiops.workbench.cdr.model.SurveyModule;
import org.pmiops.workbench.db.model.CommonStorageEnums;
import org.pmiops.workbench.model.ConceptAnalysis;
import org.pmiops.workbench.model.ConceptListResponse;
import org.pmiops.workbench.model.SearchConceptsRequest;
import org.pmiops.workbench.model.Domain;
import org.pmiops.workbench.model.MatchType;
import org.pmiops.workbench.model.QuestionConceptListResponse;
import org.pmiops.workbench.model.ConceptAnalysisListResponse;
import org.pmiops.workbench.model.AnalysisListResponse;
import org.pmiops.workbench.model.EhrCountAnalysis;
import org.pmiops.workbench.model.CriteriaParentResponse;
import org.pmiops.workbench.model.CriteriaListResponse;
import org.pmiops.workbench.model.StandardConceptFilter;
import org.pmiops.workbench.model.DomainInfosAndSurveyModulesResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Slice;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import com.google.common.collect.Multimap;
import com.google.common.collect.Multimaps;

@RestController
public class DataBrowserController implements DataBrowserApiDelegate {

    @Autowired
    private ConceptDao conceptDao;
    @Autowired
    private CdrVersionDao cdrVersionDao;
    @Autowired
    private CBCriteriaDao criteriaDao;
    @Autowired
    private QuestionConceptDao  questionConceptDao;
    @Autowired
    private AchillesAnalysisDao achillesAnalysisDao;
    @Autowired
    private AchillesResultDao achillesResultDao;
    @Autowired
    private DomainInfoDao domainInfoDao;
    @Autowired
    private SurveyModuleDao surveyModuleDao;
    @Autowired
    private AchillesResultDistDao achillesResultDistDao;
    @PersistenceContext(unitName = "cdr")
    private EntityManager entityManager;
    @Autowired
    @Qualifier("defaultCdr")
    private Provider<CdrVersion> defaultCdrVersionProvider;
    @Autowired
    private ConceptService conceptService;

    private static final Logger logger = Logger.getLogger(DataBrowserController.class.getName());

    public static final long PARTICIPANT_COUNT_ANALYSIS_ID = 1;
    public static final long COUNT_ANALYSIS_ID = 3000;
    public static final long GENDER_COUNT_ANALYSIIS_ID = 3200;
    public static final long AGE_COUNT_ANALYSIIS_ID = 3201;
    public static final long GENDER_ANALYSIS_ID = 3101;
    public static final long GENDER_PERCENTAGE_ANALYSIS_ID = 3310;
    public static final long AGE_PERCENTAGE_ANALYSIS_ID = 3311;
    public static final long SURVEY_GENDER_PERCENTAGE_ANALYSIS_ID = 3331;
    public static final long SURVEY_AGE_PERCENTAGE_ANALYSIS_ID = 3332;
    public static final long GENDER_IDENTITY_ANALYSIS_ID = 3107;
    public static final long RACE_ETHNICITY_ANALYSIS_ID = 3108;
    public static final long AGE_ANALYSIS_ID = 3102;

    public static final long SURVEY_GENDER_COUNT_ANALYSIS_ID = 3320;
    public static final long SURVEY_AGE_COUNT_ANALYSIS_ID = 3321;

    public static final long EHR_GENDER_COUNT_ANALYSIS_ID = 3300;
    public static final long EHR_AGE_COUNT_ANALYSIS_ID = 3301;

    public static final long RACE_ANALYSIS_ID = 3103;
    public static final long ETHNICITY_ANALYSIS_ID = 3104;

    public static final long MEASUREMENT_DIST_ANALYSIS_ID = 1815;

    public static final long MEASUREMENT_GENDER_DIST_ANALYSIS_ID = 1815;

    public static final long MEASUREMENT_GENDER_ANALYSIS_ID = 1900;
    public static final long MEASUREMENT_GENDER_UNIT_ANALYSIS_ID = 1910;

    public static final long MALE = 8507;
    public static final long FEMALE = 8532;
    public static final long INTERSEX = 1585848;
    public static final long NONE = 1585849;
    public static final long OTHER = 0;

    public static final long GENDER_ANALYSIS = 2;
    public static final long RACE_ANALYSIS = 4;
    public static final long ETHNICITY_ANALYSIS = 5;

    public DataBrowserController() {}

    public DataBrowserController(ConceptService conceptService, ConceptDao conceptDao, CBCriteriaDao criteriaDao,
                                 DomainInfoDao domainInfoDao, SurveyModuleDao surveyModuleDao,
                                 AchillesResultDao achillesResultDao,
                                 AchillesAnalysisDao achillesAnalysisDao, AchillesResultDistDao achillesResultDistDao,
                                 EntityManager entityManager, Provider<CdrVersion> defaultCdrVersionProvider,
                                 CdrVersionDao cdrVersionDao) {
        this.conceptService = conceptService;
        this.conceptDao = conceptDao;
        this.criteriaDao = criteriaDao;
        this.domainInfoDao = domainInfoDao;
        this.surveyModuleDao = surveyModuleDao;
        this.achillesResultDao = achillesResultDao;
        this.achillesAnalysisDao = achillesAnalysisDao;
        this.achillesResultDistDao = achillesResultDistDao;
        this.entityManager = entityManager;
        this.defaultCdrVersionProvider = defaultCdrVersionProvider;
        this.cdrVersionDao = cdrVersionDao;
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
                            .measurementConceptInfo(measurementInfo);
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
    private static final Function<QuestionConcept, org.pmiops.workbench.model.QuestionConcept>
            TO_CLIENT_QUESTION_CONCEPT =
            new Function<QuestionConcept, org.pmiops.workbench.model.QuestionConcept>() {
                @Override
                public org.pmiops.workbench.model.QuestionConcept apply(QuestionConcept concept) {
                    SurveyQuestionAnalysis countAnalysis=null;
                    SurveyQuestionAnalysis genderAnalysis=null;
                    SurveyQuestionAnalysis ageAnalysis=null;
                    SurveyQuestionAnalysis genderIdentityAnalysis=null;
                    SurveyQuestionAnalysis raceEthnicityAnalysis=null;
                    SurveyQuestionAnalysis genderCountAnalysis = null;
                    SurveyQuestionAnalysis ageCountAnalysis = null;
                    if(concept.getCountAnalysis() != null){
                        countAnalysis = TO_CLIENT_SURVEY_ANALYSIS.apply(concept.getCountAnalysis());
                    }
                    if(concept.getGenderAnalysis() != null){
                        genderAnalysis = TO_CLIENT_SURVEY_ANALYSIS.apply(concept.getGenderAnalysis());
                    }
                    if(concept.getAgeAnalysis() != null){
                        ageAnalysis = TO_CLIENT_SURVEY_ANALYSIS.apply(concept.getAgeAnalysis());
                    }
                    if(concept.getGenderIdentityAnalysis() != null){
                        genderIdentityAnalysis = TO_CLIENT_SURVEY_ANALYSIS.apply(concept.getGenderIdentityAnalysis());
                    }
                    if(concept.getRaceEthnicityAnalysis() != null){
                        raceEthnicityAnalysis = TO_CLIENT_SURVEY_ANALYSIS.apply(concept.getRaceEthnicityAnalysis());
                    }
                    if(concept.getGenderCountAnalysis() != null) {
                        genderCountAnalysis = TO_CLIENT_SURVEY_ANALYSIS.apply(concept.getGenderCountAnalysis());
                    }
                    if (concept.getAgeCountAnalysis() != null) {
                        ageCountAnalysis = TO_CLIENT_SURVEY_ANALYSIS.apply(concept.getAgeCountAnalysis());
                    }

                    return new org.pmiops.workbench.model.QuestionConcept()
                            .conceptId(concept.getConceptId())
                            .conceptName(concept.getConceptName())
                            .conceptCode(concept.getConceptCode())
                            .domainId(concept.getDomainId())
                            .countValue(concept.getCountValue())
                            .prevalence(concept.getPrevalence())
                            .questions(concept.getQuestions().stream().map(TO_CLIENT_SURVEY_QUESTION_MAP).collect(Collectors.toList()))
                            .countAnalysis(countAnalysis)
                            .genderAnalysis(genderAnalysis)
                            .ageAnalysis(ageAnalysis)
                            .genderIdentityAnalysis(genderIdentityAnalysis)
                            .raceEthnicityAnalysis(raceEthnicityAnalysis)
                            .genderCountAnalysis(genderCountAnalysis)
                            .ageCountAnalysis(ageCountAnalysis);
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
                            .domainId(criteria.getDomainId())
                            .conceptId(criteria.getConceptId())
                            .path(criteria.getPath());
                }
            };

    /**
     * Converter function from backend representation (used with Hibernate) to
     * client representation (generated by Swagger).
     */
    private static final Function<AchillesAnalysis, org.pmiops.workbench.model.Analysis>
            TO_CLIENT_ANALYSIS =
            new Function<AchillesAnalysis, org.pmiops.workbench.model.Analysis>() {
                @Override
                public org.pmiops.workbench.model.Analysis apply(AchillesAnalysis cdr) {
                    List<org.pmiops.workbench.model.AchillesResult> results = new ArrayList<>();
                    if (!cdr.getResults().isEmpty()) {
                        results = cdr.getResults().stream().map(TO_CLIENT_ACHILLES_RESULT).collect(Collectors.toList());
                    }

                    List<org.pmiops.workbench.model.AchillesResultDist> distResults = new ArrayList<>();
                    if (!cdr.getDistResults().isEmpty()) {
                        distResults = cdr.getDistResults().stream().map(TO_CLIENT_ACHILLES_RESULT_DIST).collect(Collectors.toList());
                    }

                    return new org.pmiops.workbench.model.Analysis()
                            .analysisId(cdr.getAnalysisId())
                            .analysisName(cdr.getAnalysisName())
                            .stratum1Name(cdr.getStratum1Name())
                            .stratum2Name(cdr.getStratum2Name())
                            .stratum3Name(cdr.getStratum3Name())
                            .stratum4Name(cdr.getStratum4Name())
                            .stratum5Name(cdr.getStratum5Name())
                            .chartType(cdr.getChartType())
                            .dataType(cdr.getDataType())
                            .unitName(cdr.getUnitName())
                            .results(results)
                            .distResults(distResults)
                            .unitName(cdr.getUnitName());

                }
            };

    /**
     * Converter function from backend representation (used with Hibernate) to
     * client representation (generated by Swagger).
     */
    private static final Function<AchillesAnalysis, SurveyQuestionAnalysis>
            TO_CLIENT_SURVEY_ANALYSIS =
            new Function<AchillesAnalysis, SurveyQuestionAnalysis>() {
                @Override
                public SurveyQuestionAnalysis apply(AchillesAnalysis cdr) {
                    List<SurveyQuestionResult> results = new ArrayList<>();
                    if (!cdr.getResults().isEmpty()) {
                        results = cdr.getResults().stream().map(TO_CLIENT_SURVEY_RESULT).collect(Collectors.toList());
                    }

                    return new SurveyQuestionAnalysis()
                            .analysisId(cdr.getAnalysisId())
                            .analysisName(cdr.getAnalysisName())
                            .stratum1Name(cdr.getStratum1Name())
                            .stratum2Name(cdr.getStratum2Name())
                            .stratum3Name(cdr.getStratum3Name())
                            .stratum4Name(cdr.getStratum4Name())
                            .stratum5Name(cdr.getStratum5Name())
                            .chartType(cdr.getChartType())
                            .dataType(cdr.getDataType())
                            .surveyQuestionResults(results);

                }
            };

    /**
     * Converter function from backend representation (used with Hibernate) to
     * client representation (generated by Swagger).
     */
    private static final Function<ConceptAnalysis, ConceptAnalysis>
            TO_CLIENT_CONCEPTANALYSIS=
            new Function<ConceptAnalysis, ConceptAnalysis>() {
                @Override
                public ConceptAnalysis apply(ConceptAnalysis ca) {
                    return new ConceptAnalysis()
                            .conceptId(ca.getConceptId())
                            .countAnalysis(ca.getCountAnalysis())
                            .genderAnalysis(ca.getGenderAnalysis())
                            .genderPercentageAnalysis(ca.getGenderPercentageAnalysis())
                            .genderIdentityAnalysis(ca.getGenderIdentityAnalysis())
                            .raceEthnicityAnalysis(ca.getRaceEthnicityAnalysis())
                            .ageAnalysis(ca.getAgeAnalysis())
                            .agePercentageAnalysis(ca.getAgePercentageAnalysis())
                            .raceAnalysis(ca.getRaceAnalysis())
                            .ethnicityAnalysis(ca.getEthnicityAnalysis())
                            .measurementValueGenderAnalysis(ca.getMeasurementValueGenderAnalysis())
                            .measurementValueAgeAnalysis(ca.getMeasurementValueAgeAnalysis())
                            .measurementDistributionAnalysis(ca.getMeasurementDistributionAnalysis())
                            .measurementGenderCountAnalysis(ca.getMeasurementGenderCountAnalysis());
                }
            };


    /**
     * Converter function from backend representation (used with Hibernate) to
     * client representation (generated by Swagger).
     */
    private static final Function<AchillesResult, org.pmiops.workbench.model.AchillesResult>
            TO_CLIENT_ACHILLES_RESULT =
            new Function<AchillesResult, org.pmiops.workbench.model.AchillesResult>() {
                @Override
                public org.pmiops.workbench.model.AchillesResult apply(AchillesResult o) {

                    return new org.pmiops.workbench.model.AchillesResult()
                            .id(o.getId())
                            .analysisId(o.getAnalysisId())
                            .stratum1(o.getStratum1())
                            .stratum2(o.getStratum2())
                            .stratum3(o.getStratum3())
                            .stratum4(o.getStratum4())
                            .stratum5(o.getStratum5())
                            .stratum6(o.getStratum6())
                            .analysisStratumName(o.getAnalysisStratumName())
                            .countValue(o.getCountValue())
                            .sourceCountValue(o.getSourceCountValue());
                }
            };

    /**
     * Converter function from backend representation (used with Hibernate) to
     * client representation (generated by Swagger).
     */
    private static final Function<AchillesResult, SurveyQuestionResult>
            TO_CLIENT_SURVEY_RESULT =
            new Function<AchillesResult, SurveyQuestionResult>() {
                @Override
                public SurveyQuestionResult apply(AchillesResult o) {

                    return new SurveyQuestionResult()
                            .id(o.getId())
                            .analysisId(o.getAnalysisId())
                            .stratum1(o.getStratum1())
                            .stratum2(o.getStratum2())
                            .stratum3(o.getStratum3())
                            .stratum4(o.getStratum4())
                            .stratum5(o.getStratum5())
                            .stratum6(o.getStratum6())
                            .analysisStratumName(o.getAnalysisStratumName())
                            .countValue(o.getCountValue())
                            .sourceCountValue(o.getSourceCountValue())
                            .subQuestions(null);
                }
            };

    /**
     * Converter function from backend representation (used with Hibernate) to
     * client representation (generated by Swagger).
     */
    private static final Function<SurveyQuestionMap, org.pmiops.workbench.model.SurveyQuestionMap>
            TO_CLIENT_SURVEY_QUESTION_MAP =
            new Function<SurveyQuestionMap, org.pmiops.workbench.model.SurveyQuestionMap>() {
                @Override
                public org.pmiops.workbench.model.SurveyQuestionMap apply(SurveyQuestionMap sqm) {
                    return new org.pmiops.workbench.model.SurveyQuestionMap()
                            .id(sqm.getId())
                            .surveyConceptId(sqm.getSurveyConceptId())
                            .questionConceptId(sqm.getQuestionConceptId())
                            .surveyOrderNumber(sqm.getSurveyOrderNumber())
                            .questionOrderNumber(sqm.getQuestionOrderNumber())
                            .path(sqm.getPath())
                            .sub(sqm.getSub());
                }
            };

    /**
     * Converter function from backend representation (used with Hibernate) to
     * client representation (generated by Swagger).
     */
    private static final Function<CdrVersion, org.pmiops.workbench.model.CdrVersion>
            TO_CLIENT_CDR_VERSION =
            new Function<CdrVersion, org.pmiops.workbench.model.CdrVersion>() {
                @Override
                public org.pmiops.workbench.model.CdrVersion apply(CdrVersion cdrVersion) {
                    return new org.pmiops.workbench.model.CdrVersion()
                            .name(cdrVersion.getName())
                            .cdrVersionId(String.valueOf(cdrVersion.getCdrVersionId()))
                            .numParticipants(cdrVersion.getNumParticipants())
                            .creationTime(cdrVersion.getCreationTime().getTime());
                }
            };

    /**
     * Converter function from backend representation (used with Hibernate) to
     * client representation (generated by Swagger).
     */
    private static final Function<AchillesResultDist, org.pmiops.workbench.model.AchillesResultDist>
            TO_CLIENT_ACHILLES_RESULT_DIST =
            new Function<AchillesResultDist, org.pmiops.workbench.model.AchillesResultDist>() {
                @Override
                public org.pmiops.workbench.model.AchillesResultDist apply(AchillesResultDist o) {

                    return new org.pmiops.workbench.model.AchillesResultDist()
                            .id(o.getId())
                            .analysisId(o.getAnalysisId())
                            .stratum1(o.getStratum1())
                            .stratum2(o.getStratum2())
                            .stratum3(o.getStratum3())
                            .stratum4(o.getStratum4())
                            .stratum5(o.getStratum5())
                            .stratum6(o.getStratum6())
                            .countValue(o.getCountValue())
                            .minValue(o.getMinValue())
                            .maxValue(o.getMaxValue())
                            .avgValue(o.getAvgValue())
                            .stdevValue(o.getStdevValue())
                            .medianValue(o.getMedianValue())
                            .p10Value(o.getP10Value())
                            .p25Value(o.getP25Value())
                            .p75Value(o.getP75Value())
                            .p90Value(o.getP90Value());
                }
            };

    @Override
    public ResponseEntity<CriteriaParentResponse> getCriteriaRolledCounts(Long conceptId, String domainId) {
        CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());
        List<CBCriteria> criteriaList = criteriaDao.findParentCounts(String.valueOf(conceptId), new String(domainId+"_rank1"));
        CriteriaParentResponse response = new CriteriaParentResponse();
        if (criteriaList.size() > 0) {
            CBCriteria parent = criteriaList.get(0);
            if (criteriaList.size() >= 1) {
                criteriaList.remove(parent);
            }
            response.setParent(TO_CLIENT_CBCRITERIA.apply(parent));
            Multimap<Long, CBCriteria> parentCriteria = Multimaps
                    .index(criteriaList, CBCriteria::getParentId);
            CriteriaListResponse criteriaListResponse = new CriteriaListResponse();
            criteriaListResponse.setItems(parentCriteria.get(parent.getParentId()).stream().map(TO_CLIENT_CBCRITERIA).collect(Collectors.toList()));
            response.setChildren(criteriaListResponse);
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<CriteriaListResponse> getCriteriaChildren(Long parentId) {
        CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());
        List<CBCriteria> criteriaList = criteriaDao.findCriteriaChildren(parentId);
        CriteriaListResponse criteriaListResponse = new CriteriaListResponse();
        criteriaListResponse.setItems(criteriaList.stream().map(TO_CLIENT_CBCRITERIA).collect(Collectors.toList()));
        return ResponseEntity.ok(criteriaListResponse);
    }

    @Override
    public ResponseEntity<DomainInfosAndSurveyModulesResponse> getDomainSearchResults(String query, Integer testFilter, Integer orderFilter){
        CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());
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

        int measurementQuery = 0;
        if (testFilter == 1 && orderFilter == 0) {
            measurementQuery = 1;
        } else if (testFilter == 0 && orderFilter == 1) {
            measurementQuery = 0;
        } else if (testFilter == 0 && orderFilter == 0) {
            measurementQuery = -1;
        } else if (testFilter == 1 && orderFilter == 1) {
            measurementQuery = 2;
        }

        List<DomainInfo> domains = null;
        if (measurementQuery == 1 || measurementQuery == 0) {
            domains = domainInfoDao.findStandardOrCodeMatchConceptCounts(domainKeyword, query, toMatchConceptIds, measurementQuery);
        } else if (measurementQuery == -1){
            domains = domainInfoDao.findStandardOrCodeMatchConceptCountsWithoutMeasurementCounts(domainKeyword, query, toMatchConceptIds);
        } else if (measurementQuery == 2) {
            domains = domainInfoDao.findStandardOrCodeMatchConceptCountsWithNoFilter(domainKeyword, query, toMatchConceptIds);
        }

        List<SurveyModule> surveyModules = surveyModuleDao.findSurveyModuleQuestionCounts(surveyKeyword);
        DomainInfosAndSurveyModulesResponse response = new DomainInfosAndSurveyModulesResponse();
        response.setDomainInfos(domains.stream()
                .map(DomainInfo.TO_CLIENT_DOMAIN_INFO)
                .collect(Collectors.toList()));
        response.setSurveyModules(surveyModules.stream()
                .map(SurveyModule.TO_CLIENT_SURVEY_MODULE)
                .collect(Collectors.toList()));
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<ConceptListResponse> searchConcepts(SearchConceptsRequest searchConceptsRequest){
        CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());
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
    public ResponseEntity<DomainInfosAndSurveyModulesResponse> getDomainTotals(Integer testFilter, Integer orderFilter){
        CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());
        /* Delete this once tested in test
        List<DomainInfo> domainInfos = new ArrayList<>();
        domainInfos.addAll(domainInfoDao.findByConceptIdNotOrderByDomainId(21L));

        int measurementQuery = 0;
        if (testFilter == 1 && orderFilter == 0) {
            measurementQuery = 1;
        } else if (testFilter == 0 && orderFilter == 1) {
            measurementQuery = 0;
        } else if (testFilter == 0 && orderFilter == 0) {
            measurementQuery = -1;
        } else if (testFilter == 1 && orderFilter == 1) {
            measurementQuery = 2;
        }

        if (measurementQuery == 1 || measurementQuery == 0) {
            DomainInfo domainInfo= domainInfoDao.findMeasurementDomainTotalsWithFilter(measurementQuery);
            if (domainInfo != null) {
                domainInfos.add(domainInfo);
            }
        } else if (measurementQuery == -1){
            DomainInfo domainInfo= domainInfoDao.findByConceptId(21L);
            if (domainInfo != null) {
                domainInfos.add(domainInfo);
            }
        } else if (measurementQuery == 2) {
            DomainInfo domainInfo = domainInfoDao.findMeasurementDomainTotalsWithoutFilter();
            if (domainInfo != null) {
                domainInfos.add(domainInfo);
            }
        }

        Collections.sort(domainInfos);

        List<SurveyModule> surveyModules = ImmutableList.copyOf(surveyModuleDao.findByCanShowNotOrderByOrderNumberAsc(0));

        DomainInfosAndSurveyModulesResponse response = new DomainInfosAndSurveyModulesResponse();
        response.setDomainInfos(ImmutableList.copyOf(domainInfos).stream()
                .map(DomainInfo.TO_CLIENT_DOMAIN_INFO)
                .collect(Collectors.toList()));
        response.setSurveyModules(surveyModules.stream()
                .map(SurveyModule.TO_CLIENT_SURVEY_MODULE)
                .collect(Collectors.toList()));
                */

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

        List<DomainInfo> domainInfos =  ImmutableList.copyOf(domainInfoDao.findDomainTotals(getTests, getOrders));
        List<SurveyModule> surveyModules = ImmutableList.copyOf(surveyModuleDao.findByCanShowNotOrderByOrderNumberAsc(0));

        DomainInfosAndSurveyModulesResponse response = new DomainInfosAndSurveyModulesResponse();
        response.setDomainInfos(domainInfos.stream()
                .map(DomainInfo.TO_CLIENT_DOMAIN_INFO)
                .collect(Collectors.toList()));
        response.setSurveyModules(surveyModules.stream()
                .map(SurveyModule.TO_CLIENT_SURVEY_MODULE)
                .collect(Collectors.toList()));

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<org.pmiops.workbench.model.CdrVersion> getCdrVersionUsed() {
        CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());
        CdrVersion cdrVersion = cdrVersionDao.findByIsDefault(true);
        return ResponseEntity.ok(TO_CLIENT_CDR_VERSION.apply(cdrVersion));
    }

    @Override
    public ResponseEntity<org.pmiops.workbench.model.Analysis> getGenderAnalysis(){
        CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());
        AchillesAnalysis genderAnalysis = achillesAnalysisDao.findAnalysisById(GENDER_ANALYSIS);
        addGenderStratum(genderAnalysis,1, "0", null);
        return ResponseEntity.ok(TO_CLIENT_ANALYSIS.apply(genderAnalysis));
    }

    @Override
    public ResponseEntity<org.pmiops.workbench.model.Analysis> getRaceAnalysis(){
        CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());
        AchillesAnalysis raceAnalysis = achillesAnalysisDao.findAnalysisById(RACE_ANALYSIS);
        addRaceStratum(raceAnalysis);
        return ResponseEntity.ok(TO_CLIENT_ANALYSIS.apply(raceAnalysis));
    }

    @Override
    public ResponseEntity<org.pmiops.workbench.model.Analysis> getEthnicityAnalysis(){
        CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());
        AchillesAnalysis ethnicityAnalysis = achillesAnalysisDao.findAnalysisById(ETHNICITY_ANALYSIS);
        addEthnicityStratum(ethnicityAnalysis);
        return ResponseEntity.ok(TO_CLIENT_ANALYSIS.apply(ethnicityAnalysis));
    }

    @Override
    public ResponseEntity<QuestionConceptListResponse> getSurveyResults(String surveyConceptId) {
        CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());
        /* Set up the age and gender names */
        // Too slow and concept names wrong so we hardcode list
        // List<Concept> genders = conceptDao.findByConceptClassId("Gender");

        long longSurveyConceptId = Long.parseLong(surveyConceptId);

        // Gets all the questions of each survey
        List<QuestionConcept> questions = questionConceptDao.findSurveyQuestions(surveyConceptId);

        // Get survey definition
        QuestionConceptListResponse resp = new QuestionConceptListResponse();

        SurveyModule surveyModule = surveyModuleDao.findByConceptId(longSurveyConceptId);

        resp.setSurvey(SurveyModule.TO_CLIENT_SURVEY_MODULE.apply(surveyModule));
        // Get all analyses for question list and put the analyses on the question objects
        if (!questions.isEmpty()) {
            // Put ids in array for query to get all results at once
            List<String> qlist = new ArrayList();
            for (QuestionConcept q : questions) {
                qlist.add(String.valueOf(q.getConceptId()));
            }

            List<AchillesAnalysis> analyses = achillesAnalysisDao.findSurveyAnalysisResults(surveyConceptId, qlist);
            QuestionConcept.mapAnalysesToQuestions(questions, analyses);
        }

        List<QuestionConcept> subQuestions = questions.stream().
                filter(q -> q.getQuestions().get(0).getSub() == 1).collect(Collectors.toList());

        List<org.pmiops.workbench.model.QuestionConcept> convertedQuestions = questions.stream().map(TO_CLIENT_QUESTION_CONCEPT).collect(Collectors.toList());

        Collections.sort(subQuestions, (QuestionConcept q1, QuestionConcept q2) -> q1.getQuestions().get(0).getId() - q2.getQuestions().get(0).getId());

        for(QuestionConcept q: subQuestions) {
            List<SurveyQuestionMap> questionPaths = q.getQuestions();
            for(SurveyQuestionMap sqm: questionPaths) {
                List<Integer> conceptPath = Arrays.asList(sqm.getPath().split("\\.")).stream().map(Integer::valueOf).collect(Collectors.toList());
                if (conceptPath.size() == 3) {
                    int questionConceptId = conceptPath.get(0);
                    int resultConceptId = conceptPath.get(1);
                    org.pmiops.workbench.model.QuestionConcept mainQuestion = convertedQuestions.stream().filter(mq -> mq.getConceptId() == questionConceptId).collect(Collectors.toList()).get(0);
                    SurveyQuestionResult matchingSurveyResult = mainQuestion.getCountAnalysis().getSurveyQuestionResults().stream().filter(mr -> mr.getStratum3().equals(String.valueOf(resultConceptId))).collect(Collectors.toList()).get(0);
                    List<org.pmiops.workbench.model.QuestionConcept> mappedSubQuestions = matchingSurveyResult.getSubQuestions();
                    if (mappedSubQuestions == null) {
                        mappedSubQuestions = new ArrayList<>();
                    }
                    mappedSubQuestions.add(TO_CLIENT_QUESTION_CONCEPT.apply(q));
                    matchingSurveyResult.setSubQuestions(mappedSubQuestions);
                } else if (conceptPath.size() == 5) {
                    int questionConceptId1 = conceptPath.get(0);
                    int resultConceptId1 = conceptPath.get(1);
                    int resultConceptId2 = conceptPath.get(3);

                    org.pmiops.workbench.model.QuestionConcept mainQuestion1 = convertedQuestions.stream().filter(mq -> mq.getConceptId() == questionConceptId1).collect(Collectors.toList()).get(0);
                    SurveyQuestionResult matchingSurveyResult1 = mainQuestion1.getCountAnalysis().getSurveyQuestionResults().stream().filter(mr -> mr.getStratum3().equals(String.valueOf(resultConceptId1))).collect(Collectors.toList()).get(0);
                    List<org.pmiops.workbench.model.QuestionConcept> mainQuestion2List = matchingSurveyResult1.getSubQuestions();
                    if(mainQuestion2List != null) {
                        for(org.pmiops.workbench.model.QuestionConcept mainQuestion2: mainQuestion2List) {
                            List<SurveyQuestionResult> matchingSurveyResults2 = mainQuestion2.getCountAnalysis().getSurveyQuestionResults().stream().filter(mr -> mr.getStratum3().equals(String.valueOf(resultConceptId2))).collect(Collectors.toList());
                            if (matchingSurveyResults2.size() > 0 && mainQuestion2.getConceptId() == conceptPath.get(2).longValue()) {
                                List<org.pmiops.workbench.model.QuestionConcept> mappedSubQuestions = matchingSurveyResults2.get(0).getSubQuestions();
                                if (mappedSubQuestions == null) {
                                    mappedSubQuestions = new ArrayList<>();
                                }
                                mappedSubQuestions.add(TO_CLIENT_QUESTION_CONCEPT.apply(q));
                                matchingSurveyResults2.get(0).setSubQuestions(mappedSubQuestions);
                            }
                        }
                    }
                }
            }
        }

        resp.setItems(convertedQuestions.stream().filter(q -> q.getQuestions().get(0).getSub() == 0).collect(Collectors.toList()));
        return ResponseEntity.ok(resp);
    }

    @Override
    public ResponseEntity<EhrCountAnalysis> getEhrCountAnalysis(String domainId) {
        CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());
        List<Long> analysisIds = new ArrayList<>();
        analysisIds.add(3300L);
        analysisIds.add(3301L);
        List<AchillesAnalysis> ehrAnalysesList = achillesAnalysisDao.findAnalysisByIds(analysisIds, domainId);
        EhrCountAnalysis ehrCountAnalysis = new EhrCountAnalysis();
        ehrCountAnalysis.setDomainId(domainId);
        ehrCountAnalysis.setGenderCountAnalysis(TO_CLIENT_ANALYSIS.apply(ehrAnalysesList.stream().filter(aa -> aa.getAnalysisId() == 3300).collect(Collectors.toList()).get(0)));
        ehrCountAnalysis.setAgeCountAnalysis(TO_CLIENT_ANALYSIS.apply(ehrAnalysesList.stream().filter(aa -> aa.getAnalysisId() == 3301).collect(Collectors.toList()).get(0)));
        return ResponseEntity.ok(ehrCountAnalysis);
    }

    @Override
    public ResponseEntity<AnalysisListResponse> getSurveyQuestionCounts(String questionConceptId, String questionPath) {
        CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());
        List<Long> analysisIds = new ArrayList<>();
        analysisIds.add(3320L);
        analysisIds.add(3321L);
        List<AchillesAnalysis> surveyQuestionCountList = achillesAnalysisDao.findSurveyQuestionCounts(analysisIds, questionConceptId, questionPath);
        AnalysisListResponse analysisListResponse = new AnalysisListResponse();
        analysisListResponse.setItems(surveyQuestionCountList.stream().map(TO_CLIENT_ANALYSIS).collect(Collectors.toList()));
        return ResponseEntity.ok(analysisListResponse);
    }

    @Override
    public ResponseEntity<ConceptAnalysisListResponse> getConceptAnalysisResults(List<String> conceptIds, String domainId){

        CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());
        ConceptAnalysisListResponse resp=new ConceptAnalysisListResponse();
        List<ConceptAnalysis> conceptAnalysisList=new ArrayList<>();
        List<Long> analysisIds  = new ArrayList<>();
        analysisIds.add(GENDER_ANALYSIS_ID);
        analysisIds.add(GENDER_IDENTITY_ANALYSIS_ID);
        analysisIds.add(RACE_ETHNICITY_ANALYSIS_ID);
        analysisIds.add(GENDER_PERCENTAGE_ANALYSIS_ID);
        analysisIds.add(AGE_PERCENTAGE_ANALYSIS_ID);
        analysisIds.add(AGE_ANALYSIS_ID);
        analysisIds.add(RACE_ANALYSIS_ID);
        analysisIds.add(COUNT_ANALYSIS_ID);
        analysisIds.add(ETHNICITY_ANALYSIS_ID);
        analysisIds.add(MEASUREMENT_GENDER_ANALYSIS_ID);
        analysisIds.add(MEASUREMENT_DIST_ANALYSIS_ID);
        analysisIds.add(MEASUREMENT_GENDER_UNIT_ANALYSIS_ID);

        List<Long> countAnalysisIds = new ArrayList<>();
        countAnalysisIds.add(3300L);
        countAnalysisIds.add(3301L);
        List<AchillesAnalysis> ehrAnalysesList = achillesAnalysisDao.findAnalysisByIds(countAnalysisIds, domainId);

        List<AchillesResultDist> overallDistResults = achillesResultDistDao.fetchByAnalysisIdsAndConceptIds(new ArrayList<Long>( Arrays.asList(MEASUREMENT_GENDER_DIST_ANALYSIS_ID) ),conceptIds);

        Multimap<Long, AchillesResultDist> distResultsByAnalysisId = null;
        if(overallDistResults != null){
            distResultsByAnalysisId = Multimaps
                    .index(overallDistResults, AchillesResultDist::getAnalysisId);
        }

        HashMap<Long,HashMap<String,List<AchillesResultDist>>> analysisDistResults = new HashMap<>();

        for(Long key:distResultsByAnalysisId.keySet()){
            Multimap<String,AchillesResultDist> conceptDistResults = Multimaps.index(distResultsByAnalysisId.get(key),AchillesResultDist::getStratum1);
            for(String concept:conceptDistResults.keySet()) {
                if(analysisDistResults.containsKey(key)){
                    HashMap<String,List<AchillesResultDist>> results = analysisDistResults.get(key);
                    results.put(concept,new ArrayList<>(conceptDistResults.get(concept)));
                }else{
                    HashMap<String,List<AchillesResultDist>> results = new HashMap<>();
                    results.put(concept,new ArrayList<>(conceptDistResults.get(concept)));
                    analysisDistResults.put(key,results);
                }
            }
        }
        for(String conceptId: conceptIds){
            ConceptAnalysis conceptAnalysis=new ConceptAnalysis();

            boolean isMeasurement = false;

            List<AchillesAnalysis> analysisList = achillesAnalysisDao.findConceptAnalysisResults(conceptId,analysisIds);

            HashMap<Long, AchillesAnalysis> analysisHashMap = new HashMap<>();
            for(AchillesAnalysis aa: analysisList){
                this.entityManager.detach(aa);
                analysisHashMap.put(aa.getAnalysisId(), aa);
            }

            conceptAnalysis.setConceptId(conceptId);
            Iterator it = analysisHashMap.entrySet().iterator();
            while(it.hasNext()) {
                Map.Entry pair = (Map.Entry)it.next();
                Long analysisId = (Long)pair.getKey();
                AchillesAnalysis aa = (AchillesAnalysis)pair.getValue();
                //aa.setUnitName(unitName);
                if(analysisId != MEASUREMENT_GENDER_UNIT_ANALYSIS_ID && analysisId != MEASUREMENT_GENDER_ANALYSIS_ID && analysisId != MEASUREMENT_DIST_ANALYSIS_ID && !Strings.isNullOrEmpty(domainId)) {
                    aa.setResults(aa.getResults().stream().filter(ar -> ar.getStratum3().equalsIgnoreCase(domainId)).collect(Collectors.toList()));
                }
                if (analysisId == COUNT_ANALYSIS_ID) {
                    conceptAnalysis.setCountAnalysis(TO_CLIENT_ANALYSIS.apply(aa));
                }else if(analysisId == GENDER_ANALYSIS_ID){
                    addGenderStratum(aa,2, conceptId, null);
                    conceptAnalysis.setGenderAnalysis(TO_CLIENT_ANALYSIS.apply(aa));
                }else if (analysisId == GENDER_PERCENTAGE_ANALYSIS_ID) {
                    List<AchillesAnalysis> ehrGenderCountAnalysis = ehrAnalysesList.stream().filter(a -> a.getAnalysisId() == EHR_GENDER_COUNT_ANALYSIS_ID).collect(Collectors.toList());
                    if (ehrGenderCountAnalysis != null && ehrGenderCountAnalysis.size() > 0) {
                        addGenderStratum(aa, 2, conceptId,  ehrGenderCountAnalysis.get(0).getResults());
                        conceptAnalysis.setGenderPercentageAnalysis(TO_CLIENT_ANALYSIS.apply(aa));
                    }
                }else if(analysisId == GENDER_IDENTITY_ANALYSIS_ID){
                    addGenderIdentityStratum(aa);
                    conceptAnalysis.setGenderIdentityAnalysis(TO_CLIENT_ANALYSIS.apply(aa));
                }else if(analysisId == RACE_ETHNICITY_ANALYSIS_ID){
                    addRaceEthnicityStratum(aa);
                    conceptAnalysis.setRaceEthnicityAnalysis(TO_CLIENT_ANALYSIS.apply(aa));
                }else if(analysisId == AGE_ANALYSIS_ID){
                    addAgeStratum(aa, conceptId, null);
                    conceptAnalysis.setAgeAnalysis(TO_CLIENT_ANALYSIS.apply(aa));
                }else if(analysisId == AGE_PERCENTAGE_ANALYSIS_ID) {
                    List<AchillesAnalysis> ehrAgeCountAnalysis = ehrAnalysesList.stream().filter(a -> a.getAnalysisId() == EHR_AGE_COUNT_ANALYSIS_ID).collect(Collectors.toList());
                    if (ehrAgeCountAnalysis != null && ehrAgeCountAnalysis.size() > 0) {
                        addAgeStratum(aa, conceptId, ehrAgeCountAnalysis.get(0).getResults());
                    }
                    conceptAnalysis.setAgePercentageAnalysis(TO_CLIENT_ANALYSIS.apply(aa));
                }else if(analysisId == RACE_ANALYSIS_ID){
                    addRaceStratum(aa);
                    conceptAnalysis.setRaceAnalysis(TO_CLIENT_ANALYSIS.apply(aa));
                }else if(analysisId == ETHNICITY_ANALYSIS_ID){
                    addEthnicityStratum(aa);
                    conceptAnalysis.setEthnicityAnalysis(TO_CLIENT_ANALYSIS.apply(aa));
                }else if(analysisId == MEASUREMENT_GENDER_ANALYSIS_ID){
                    Map<String,List<AchillesResult>> results = seperateUnitResults(aa);
                    List<AchillesAnalysis> unitSeperateAnalysis = new ArrayList<>();
                    HashMap<String,List<AchillesResultDist>> distResults = analysisDistResults.get(MEASUREMENT_GENDER_DIST_ANALYSIS_ID);
                    if (distResults != null) {
                        List<AchillesResultDist> conceptDistResults = distResults.get(conceptId);
                        if(conceptDistResults != null){
                            Multimap<String,AchillesResultDist> unitDistResults = Multimaps.index(conceptDistResults,AchillesResultDist::getStratum2);
                            for(String unit: unitDistResults.keySet()){
                                if (results.keySet().contains(unit)) {
                                    AchillesAnalysis unitGenderAnalysis = new AchillesAnalysis(aa);
                                    unitGenderAnalysis.setResults(results.get(unit));
                                    unitGenderAnalysis.setUnitName(unit);
                                    if(!unit.equalsIgnoreCase("no unit")) {
                                        processMeasurementGenderMissingBins(MEASUREMENT_GENDER_DIST_ANALYSIS_ID,unitGenderAnalysis, conceptId, unit, new ArrayList<>(unitDistResults.get(unit)), "numeric");
                                    } else {
                                        ArrayList<AchillesResult> textValues = new ArrayList<>();
                                        ArrayList<AchillesResult> numericValues = new ArrayList<>();
                                        // In case no unit has a mix of text and numeric values, only display text values as mix does not make sense to user.
                                        for (AchillesResult result: unitGenderAnalysis.getResults()) {
                                            String result_value = result.getStratum4();
                                            String numericResult = null;
                                            if (result_value != null && result_value.contains(" - ")) {
                                                String[] result_value_split = result_value.split(" - ");
                                                if(result_value_split.length > 0) {
                                                    numericResult = result_value_split[1];
                                                }
                                            } else if (result_value != null && result_value.contains(">= ")) {
                                                numericResult = result_value.replaceAll(">= ","");
                                            } else if (result_value != null && result_value.contains("< ")) {
                                                numericResult = result_value.replaceAll("< ","");
                                            } else {
                                                if (result_value != null &&  !result_value.matches(".*\\d.*")) {
                                                    textValues.add(result);
                                                }
                                            }
                                            if (numericResult != null) {
                                                if (NumberUtils.isNumber(numericResult)) {
                                                    numericValues.add(result);
                                                } else {
                                                    textValues.add(result);
                                                }
                                            }
                                        }

                                        if (textValues.size() > 0 && numericValues.size() > 0) {
                                            List<AchillesResult> filteredNumericResults = unitGenderAnalysis.getResults().stream().filter(ele -> textValues.stream()
                                                    .anyMatch(element -> element.getId()==ele.getId())).collect(Collectors.toList());
                                            unitGenderAnalysis.setResults(filteredNumericResults);
                                            processMeasurementGenderMissingBins(MEASUREMENT_GENDER_DIST_ANALYSIS_ID,unitGenderAnalysis, conceptId, null, null, "text");
                                        } else if (numericValues.size() > 0) {
                                            processMeasurementGenderMissingBins(MEASUREMENT_GENDER_DIST_ANALYSIS_ID,unitGenderAnalysis, conceptId, null, null, "numeric");
                                        }
                                    }
                                    unitSeperateAnalysis.add(unitGenderAnalysis);
                                }
                            }
                        }else {
                            unitSeperateAnalysis.add(aa);
                        }
                    }
                    addGenderStratum(aa,3, conceptId, null);
                    isMeasurement = true;
                    conceptAnalysis.setMeasurementValueGenderAnalysis(unitSeperateAnalysis.stream().map(TO_CLIENT_ANALYSIS).collect(Collectors.toList()));
                }else if(analysisId == MEASUREMENT_GENDER_UNIT_ANALYSIS_ID){
                    Map<String,List<AchillesResult>> results = seperateUnitResults(aa);
                    List<AchillesAnalysis> unitSeperateAnalysis = new ArrayList<>();
                    for(String unit: results.keySet()){
                        AchillesAnalysis unitGenderCountAnalysis = new AchillesAnalysis(aa);
                        unitGenderCountAnalysis.setResults(results.get(unit));
                        unitGenderCountAnalysis.setUnitName(unit);
                        unitSeperateAnalysis.add(unitGenderCountAnalysis);
                    }
                    isMeasurement = true;
                    conceptAnalysis.setMeasurementGenderCountAnalysis(unitSeperateAnalysis.stream().map(TO_CLIENT_ANALYSIS).collect(Collectors.toList()));
                }
            }

            if(isMeasurement){
                AchillesAnalysis measurementDistAnalysis = achillesAnalysisDao.findAnalysisById(MEASUREMENT_DIST_ANALYSIS_ID);
                List<AchillesResultDist> achillesResultDistList = achillesResultDistDao.fetchConceptDistResults(MEASUREMENT_DIST_ANALYSIS_ID,conceptId);
                HashMap<String,List<AchillesResultDist>> results = seperateDistResultsByUnit(achillesResultDistList);
                List<AchillesAnalysis> unitSeperateAnalysis = new ArrayList<>();
                for(String unit: results.keySet()){
                    AchillesAnalysis mDistAnalysis = new AchillesAnalysis(measurementDistAnalysis);
                    mDistAnalysis.setDistResults(results.get(unit));
                    mDistAnalysis.setUnitName(unit);
                    unitSeperateAnalysis.add(mDistAnalysis);
                }
                conceptAnalysis.setMeasurementDistributionAnalysis(unitSeperateAnalysis.stream().map(TO_CLIENT_ANALYSIS).collect(Collectors.toList()));
            }
            conceptAnalysisList.add(conceptAnalysis);
        }
        resp.setItems(conceptAnalysisList.stream().map(TO_CLIENT_CONCEPTANALYSIS).collect(Collectors.toList()));
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
        CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());
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
    public ResponseEntity<org.pmiops.workbench.model.AchillesResult> getParticipantCount() {
        CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());
        AchillesResult result = achillesResultDao.findAchillesResultByAnalysisId(PARTICIPANT_COUNT_ANALYSIS_ID);
        return ResponseEntity.ok(TO_CLIENT_ACHILLES_RESULT.apply(result));
    }

    public ArrayList<Float> makeBins(Float min,Float max, Float binWidth) {
        TreeSet<String> bins = new TreeSet<>();

        bins.add(String.format("%.2f", min));

        if (min+binWidth <= max) {
            bins.add(String.format("%.2f", min+binWidth));
        }
        if (min+2*binWidth <= max) {
            bins.add(String.format("%.2f", min+2*binWidth));
        }
        if (min+3*binWidth <= max) {
            bins.add(String.format("%.2f", min+3*binWidth));
        }
        if (min+4*binWidth <= max) {
            bins.add(String.format("%.2f", min+4*binWidth));
        }
        if (min+5*binWidth <= max) {
            bins.add(String.format("%.2f", min+5*binWidth));
        }
        if (min+6*binWidth <= max) {
            bins.add(String.format("%.2f", min+6*binWidth));
        }
        if (min+7*binWidth <= max) {
            bins.add(String.format("%.2f", min+7*binWidth));
        }
        if (min+8*binWidth <= max) {
            bins.add(String.format("%.2f", min+8*binWidth));
        }
        if (min+9*binWidth <= max) {
            bins.add(String.format("%.2f", min+9*binWidth));
        }
        if (min+10*binWidth <= max) {
            bins.add(String.format("%.2f", min+10*binWidth));
        }
        if (min+11*binWidth <= max) {
            bins.add(String.format("%.2f", min+11*binWidth));
        }

        List<String> trimmedBins = new ArrayList<>();

        for(String s:bins) {
            trimmedBins.add(s.indexOf(".") < 0 ? s : s.replaceAll("0*$", "").replaceAll("\\.$", ""));
        }

        return new ArrayList<Float>(trimmedBins.stream().map(Float::parseFloat).collect(Collectors.toList()));
    }

    public void addGenderStratum(AchillesAnalysis aa, int stratum, String conceptId, List<AchillesResult> ehrCountResults){
        Set<String> uniqueGenderStratums = new TreeSet<String>();
        for(AchillesResult ar: aa.getResults()){
            String analysisStratumName =ar.getAnalysisStratumName();
            if (analysisStratumName == null || analysisStratumName.equals("")) {
                if (stratum == 1) {
                    uniqueGenderStratums.add(ar.getStratum1());
                    ar.setAnalysisStratumName(QuestionConcept.genderStratumNameMap.get(ar.getStratum1()));
                } else if (stratum == 2) {
                    uniqueGenderStratums.add(ar.getStratum2());
                    ar.setAnalysisStratumName(QuestionConcept.genderStratumNameMap.get(ar.getStratum2()));
                } else if (stratum == 3) {
                    uniqueGenderStratums.add(ar.getStratum3());
                    ar.setAnalysisStratumName(QuestionConcept.genderStratumNameMap.get(ar.getStratum3()));
                }
            }
        }
        if(uniqueGenderStratums.size() < 3) {
            Set<String> completeGenderStratumList = new TreeSet<String>(Arrays.asList(new String[] {"8507", "8532", "0"}));
            completeGenderStratumList.removeAll(uniqueGenderStratums);
            for(String missingGender: completeGenderStratumList){
                AchillesResult missingResult = null;
                if (aa.getAnalysisId() == GENDER_PERCENTAGE_ANALYSIS_ID) {
                    List<AchillesResult> ehrGenderCountResults = ehrCountResults.stream().filter(ar -> ar.getStratum4().equals(missingGender)).collect(Collectors.toList());
                    if (ehrGenderCountResults != null && ehrGenderCountResults.size() > 0) {
                        AchillesResult result = ehrGenderCountResults.get(0);
                        String percentageValue = String.valueOf(Math.round(((double)20/result.getCountValue())*100/2)*2);
                        missingResult = new AchillesResult(aa.getAnalysisId(), conceptId, missingGender, null, percentageValue, null, null, 20L, 20L);
                    } else {
                        missingResult = new AchillesResult(aa.getAnalysisId(), conceptId, missingGender, null, "0", null, null, 20L, 20L);
                    }
                } else {
                    if (stratum == 1) {
                        missingResult = new AchillesResult(aa.getAnalysisId(), missingGender, null, null, null, null, null, 20L, 20L);
                    } else if (stratum == 2) {
                        missingResult = new AchillesResult(aa.getAnalysisId(), conceptId, missingGender, null, null, null, null, 20L, 20L);
                    } else if (stratum == 3) {
                        missingResult = new AchillesResult(aa.getAnalysisId(), conceptId, null, missingGender, null, null, null, 20L, 20L);
                    }
                }
                missingResult.setAnalysisStratumName(QuestionConcept.genderStratumNameMap.get(missingGender));
                aa.getResults().add(missingResult);
            }
        }
        aa.setResults(aa.getResults().stream().filter(ar -> ar.getAnalysisStratumName() != null).collect(Collectors.toList()));
    }

    public void addGenderIdentityStratum(AchillesAnalysis aa){
        for(AchillesResult ar: aa.getResults()){
            String analysisStratumName =ar.getAnalysisStratumName();
            if (analysisStratumName == null || analysisStratumName.equals("")) {
                ar.setAnalysisStratumName(QuestionConcept.genderIdentityStratumNameMap.get(ar.getStratum2()));
            }
        }
    }

    public void addAgeStratum(AchillesAnalysis aa, String conceptId, List<AchillesResult> ehrCountResults){
        Set<String> uniqueAgeDeciles = new TreeSet<String>();
        for(AchillesResult ar: aa.getResults()){
            String analysisStratumName=ar.getAnalysisStratumName();
            if (ar.getStratum2() != null && !ar.getStratum2().equals("0")) {
                uniqueAgeDeciles.add(ar.getStratum2());
            }
            if (analysisStratumName == null || analysisStratumName.equals("")) {
                ar.setAnalysisStratumName(QuestionConcept.ageStratumNameMap.get(ar.getStratum2()));
            }
        }
        aa.setResults(aa.getResults().stream().filter(ar -> ar.getAnalysisStratumName() != null).collect(Collectors.toList()));
        if(uniqueAgeDeciles.size() < 8){
            if (aa.getAnalysisId() == EHR_AGE_COUNT_ANALYSIS_ID) {
                Set<String> completeAgeDeciles = new TreeSet<String>(Arrays.asList(new String[] {"2", "3", "4", "5", "6", "7", "8", "9"}));
                completeAgeDeciles.removeAll(uniqueAgeDeciles);
                for(String missingAgeDecile: completeAgeDeciles){
                    List<AchillesResult> ehrAgeCountResults = ehrCountResults.stream().filter(ar -> ar.getStratum4().equals(missingAgeDecile)).collect(Collectors.toList());
                    AchillesResult missingResult = null;
                    if (ehrAgeCountResults != null && ehrAgeCountResults.size() > 0) {
                        AchillesResult result = ehrAgeCountResults.get(0);
                        String percentageValue = String.valueOf(Math.round((20/result.getCountValue())*100/2)*2);
                        missingResult = new AchillesResult(AGE_ANALYSIS_ID, conceptId, missingAgeDecile, null, percentageValue, null, null, 20L, 20L);
                    } else {
                        missingResult = new AchillesResult(AGE_ANALYSIS_ID, conceptId, missingAgeDecile, null, "0", null, null, 20L, 20L);
                    }
                    missingResult.setAnalysisStratumName(QuestionConcept.ageStratumNameMap.get(missingAgeDecile));
                    aa.getResults().add(missingResult);
                }
            } else {
                Set<String> completeAgeDeciles = new TreeSet<String>(Arrays.asList(new String[] {"2", "3", "4", "5", "6", "7", "8", "9"}));
                completeAgeDeciles.removeAll(uniqueAgeDeciles);
                for(String missingAgeDecile: completeAgeDeciles){
                    AchillesResult missingResult = new AchillesResult(AGE_ANALYSIS_ID, conceptId, missingAgeDecile, null, null, null, null, 20L, 20L);
                    missingResult.setAnalysisStratumName(QuestionConcept.ageStratumNameMap.get(missingAgeDecile));
                    aa.getResults().add(missingResult);
                }
            }
        }
    }

    public void addRaceStratum(AchillesAnalysis aa) {
        for(AchillesResult ar: aa.getResults()){
            String analysisStratumName=ar.getAnalysisStratumName();
            if (analysisStratumName == null || analysisStratumName.equals("")) {
                ar.setAnalysisStratumName(QuestionConcept.raceStratumNameMap.get(ar.getStratum2()));
            }
        }
    }

    public void addRaceEthnicityStratum(AchillesAnalysis aa){
        for(AchillesResult ar: aa.getResults()){
            String analysisStratumName=ar.getAnalysisStratumName();
            if (analysisStratumName == null || analysisStratumName.equals("")) {
                ar.setAnalysisStratumName(QuestionConcept.raceEthnicityStratumNameMap.get(ar.getStratum2()));
            }
        }
    }

    public void addEthnicityStratum(AchillesAnalysis aa) {
        for(AchillesResult ar: aa.getResults()){
            String analysisStratumName=ar.getAnalysisStratumName();
            if (analysisStratumName == null || analysisStratumName.equals("")) {
                ar.setAnalysisStratumName(QuestionConcept.raceStratumNameMap.get(ar.getStratum2()));
            }
        }
    }

    public void processMeasurementGenderMissingBins(Long analysisId, AchillesAnalysis aa, String conceptId, String unitName, List<AchillesResultDist> resultDists, String type) {

        if (resultDists != null) {
            Float maleBinMin = null;
            Float maleBinMax = null;

            Float femaleBinMin = null;
            Float femaleBinMax = null;

            Float otherBinMin = null;
            Float otherBinMax = null;

            float maleBinWidth = 0f;
            float femaleBinWidth = 0f;
            float otherBinWidth = 0f;

            for(AchillesResultDist ard:resultDists){
                if(Integer.parseInt(ard.getStratum3())== MALE) {
                    maleBinMin = Float.valueOf(ard.getStratum4());
                    maleBinMax = Float.valueOf(ard.getStratum5());
                    maleBinWidth = Float.valueOf(ard.getStratum6());

                }
                else if(Integer.parseInt(ard.getStratum3()) == FEMALE) {
                    femaleBinMin = Float.valueOf(ard.getStratum4());
                    femaleBinMax = Float.valueOf(ard.getStratum5());
                    femaleBinWidth = Float.valueOf(ard.getStratum6());
                }
                else if(Integer.parseInt(ard.getStratum3()) == OTHER) {
                    otherBinMin = Float.valueOf(ard.getStratum4());
                    otherBinMax = Float.valueOf(ard.getStratum5());
                    otherBinWidth = Float.valueOf(ard.getStratum6());
                }
            }

            if (femaleBinMax == null && femaleBinMin == null) {
                if (maleBinMin != null && maleBinMax != null && otherBinMax != null && otherBinMin != null) {
                    femaleBinMin = Math.min(maleBinMin, otherBinMin);
                    femaleBinMax = Math.max(maleBinMax, otherBinMax);
                    femaleBinWidth = normalizeBinWidth(femaleBinMin, femaleBinMax);
                } else if (maleBinMin != null && maleBinMax != null) {
                    femaleBinMin = maleBinMin;
                    femaleBinMax = maleBinMax;
                    femaleBinWidth = maleBinWidth;
                } else if (otherBinMax != null && otherBinMin != null) {
                    femaleBinMin = otherBinMin;
                    femaleBinMax = otherBinMax;
                    femaleBinWidth = otherBinWidth;
                }
            }

            if (maleBinMax == null && maleBinMin == null) {
                if (femaleBinMin != null && femaleBinMax != null && otherBinMax != null && otherBinMin != null) {
                    maleBinMin = Math.min(femaleBinMin, otherBinMin);
                    maleBinMax = Math.max(femaleBinMax, otherBinMax);
                    maleBinWidth = normalizeBinWidth(maleBinMin, maleBinMax);
                } else if (femaleBinMin != null && femaleBinMax != null) {
                    maleBinMin = femaleBinMin;
                    maleBinMax = femaleBinMax;
                    maleBinWidth = femaleBinWidth;
                } else if (otherBinMax != null && otherBinMin != null) {
                    maleBinMin = otherBinMin;
                    maleBinMax = otherBinMax;
                    maleBinWidth = otherBinWidth;
                }
            }

            if (otherBinMax == null && otherBinMin == null) {
                if (femaleBinMin != null && femaleBinMax != null && maleBinMax != null && maleBinMin != null) {
                    otherBinMin = Math.min(femaleBinMin, maleBinMin);
                    otherBinMax = Math.max(femaleBinMax, maleBinMax);
                    otherBinWidth = normalizeBinWidth(otherBinMin, otherBinMax);
                } else if (femaleBinMin != null && femaleBinMax != null) {
                    otherBinMin = femaleBinMin;
                    otherBinMax = femaleBinMax;
                    otherBinWidth = femaleBinWidth;
                } else if (maleBinMin != null && maleBinMax != null) {
                    otherBinMax = maleBinMax;
                    otherBinMin = maleBinMin;
                    otherBinWidth = maleBinWidth;
                }
            }

            ArrayList<Float> maleBinRanges = new ArrayList<Float>();
            ArrayList<Float> femaleBinRanges = new ArrayList<Float>();
            ArrayList<Float> otherBinRanges = new ArrayList<Float>();

            if(maleBinMax != null && maleBinMin != null){
                maleBinRanges = makeBins(maleBinMin, maleBinMax, maleBinWidth);
            }

            if(femaleBinMax != null && femaleBinMin != null){
                femaleBinRanges = makeBins(femaleBinMin, femaleBinMax, femaleBinWidth);
            }

            if(otherBinMax != null && otherBinMin != null){
                otherBinRanges = makeBins(otherBinMin, otherBinMax, otherBinWidth);
            }

            ArrayList<String> maleRangesInResults = new ArrayList<>();
            maleRangesInResults.add(("< " + trimTrailingZeroDecimals(String.valueOf(maleBinRanges.get(0)))));
            for (int k=0; k<maleBinRanges.size()-1;k++) {
                maleRangesInResults.add((trimTrailingZeroDecimals(String.valueOf(maleBinRanges.get(k))) + " - " + trimTrailingZeroDecimals(String.valueOf(maleBinRanges.get(k+1)))));
            }
            maleRangesInResults.add((">= " + trimTrailingZeroDecimals(String.valueOf(maleBinRanges.get(maleBinRanges.size()-1)))));

            ArrayList<String> femaleRangesInResults = new ArrayList<>();
            femaleRangesInResults.add(("< " + trimTrailingZeroDecimals(String.valueOf(femaleBinRanges.get(0)))));
            for (int k=0; k<femaleBinRanges.size()-1;k++) {
                femaleRangesInResults.add((trimTrailingZeroDecimals(String.valueOf(femaleBinRanges.get(k))) + " - " + trimTrailingZeroDecimals(String.valueOf(femaleBinRanges.get(k+1)))));
            }
            femaleRangesInResults.add((">= " + trimTrailingZeroDecimals(String.valueOf(femaleBinRanges.get(femaleBinRanges.size()-1)))));

            ArrayList<String> otherRangesInResults = new ArrayList<>();
            otherRangesInResults.add(("< " + trimTrailingZeroDecimals(String.valueOf(otherBinRanges.get(0)))));
            for (int k=0; k<otherBinRanges.size()-1;k++) {
                otherRangesInResults.add((trimTrailingZeroDecimals(String.valueOf(otherBinRanges.get(k))) + " - " + trimTrailingZeroDecimals(String.valueOf(otherBinRanges.get(k+1)))));
            }
            otherRangesInResults.add((">= " + trimTrailingZeroDecimals(String.valueOf(otherBinRanges.get(otherBinRanges.size()-1)))));

            for(AchillesResult ar: aa.getResults()){
                String analysisStratumName=ar.getAnalysisStratumName();
                String result_value = ar.getStratum4();

                if(Long.valueOf(ar.getStratum3()) == MALE && maleRangesInResults.contains(result_value)){
                    maleRangesInResults.remove(result_value);
                }else if(Long.valueOf(ar.getStratum3()) == FEMALE && femaleRangesInResults.contains(result_value)){
                    femaleRangesInResults.remove(result_value);
                }else if(Long.valueOf(ar.getStratum3()) == OTHER && otherRangesInResults.contains(result_value)){
                    otherRangesInResults.remove(result_value);
                }

                if (analysisStratumName == null || analysisStratumName.equals("")) {
                    ar.setAnalysisStratumName(QuestionConcept.genderStratumNameMap.get(ar.getStratum3()));
                }
            }

            for(String maleRemaining: maleRangesInResults){
                String missingBinWidth = null;
                if (maleBinWidth == (long)(maleBinWidth)) {
                    missingBinWidth = String.format("%d",(long)maleBinWidth);
                } else {
                    missingBinWidth = String.format("%.2f", maleBinWidth);
                }
                missingBinWidth = trimTrailingZeroDecimals(missingBinWidth);
                AchillesResult achillesResult = new AchillesResult(MEASUREMENT_GENDER_ANALYSIS_ID, conceptId, unitName, String.valueOf(MALE), maleRemaining, null, String.valueOf(maleBinWidth), 20L, 20L);
                aa.addResult(achillesResult);
            }

            for(String femaleRemaining: femaleRangesInResults){
                String missingBinWidth = null;
                if (femaleBinWidth == (long)femaleBinWidth) {
                    missingBinWidth = String.format("%d",(long)femaleBinWidth);
                } else {
                    missingBinWidth = String.format("%.2f", femaleBinWidth);
                }
                missingBinWidth = trimTrailingZeroDecimals(missingBinWidth);
                AchillesResult ar = new AchillesResult(MEASUREMENT_GENDER_ANALYSIS_ID, conceptId, unitName, String.valueOf(FEMALE), femaleRemaining, null, String.valueOf(femaleBinWidth), 20L, 20L);
                aa.addResult(ar);
            }

            for(String otherRemaining: otherRangesInResults){
                String missingBinWidth = null;
                if (otherBinWidth == (long)otherBinWidth) {
                    missingBinWidth = String.format("%d",(long)otherBinWidth);
                } else {
                    missingBinWidth = String.format("%.2f", otherBinWidth);
                }
                missingBinWidth = trimTrailingZeroDecimals(missingBinWidth);
                AchillesResult ar = new AchillesResult(MEASUREMENT_GENDER_ANALYSIS_ID, conceptId, unitName, String.valueOf(OTHER), otherRemaining, null, String.valueOf(otherBinWidth), 20L, 20L);
                aa.addResult(ar);
            }
        } else {

            List<AchillesResult> maleResults = new ArrayList<>();
            List<AchillesResult> femaleResults = new ArrayList<>();
            List<AchillesResult> otherResults = new ArrayList<>();

            for(AchillesResult ar: aa.getResults()){
                String analysisStratumName=ar.getAnalysisStratumName();
                if(Long.valueOf(ar.getStratum3()) == MALE ){
                    maleResults.add(ar);
                }else if(Long.valueOf(ar.getStratum3()) == FEMALE ){
                    femaleResults.add(ar);
                }else if(Long.valueOf(ar.getStratum3()) == OTHER ){
                    otherResults.add(ar);
                }
                if (analysisStratumName == null || analysisStratumName.equals("")) {
                    ar.setAnalysisStratumName(QuestionConcept.genderStratumNameMap.get(ar.getStratum2()));
                }
            }

            if (("numeric").equals(type)) {
                if (maleResults.size() == 0) {
                    AchillesResult achillesResult = new AchillesResult(MEASUREMENT_GENDER_ANALYSIS_ID, conceptId, "No Unit", String.valueOf(MALE), "0", null, "0", 20L, 20L);
                    aa.addResult(achillesResult);
                }
                if (femaleResults.size() == 0) {
                    AchillesResult ar = new AchillesResult(MEASUREMENT_GENDER_ANALYSIS_ID, conceptId, unitName, String.valueOf(FEMALE), "0", null, "0", 20L, 20L);
                    aa.addResult(ar);
                }
                if (otherResults.size() == 0) {
                    AchillesResult ar = new AchillesResult(MEASUREMENT_GENDER_ANALYSIS_ID, conceptId, unitName, String.valueOf(OTHER), "0", null, "0", 20L, 20L);
                    aa.addResult(ar);
                }
            } else if(("text").equals(type)) {
                if (maleResults.size() == 0) {
                    AchillesResult achillesResult = new AchillesResult(MEASUREMENT_GENDER_ANALYSIS_ID, conceptId, "No Unit", String.valueOf(MALE), "Null", null, "0", 20L, 20L);
                    aa.addResult(achillesResult);
                }
                if (femaleResults.size() == 0) {
                    AchillesResult ar = new AchillesResult(MEASUREMENT_GENDER_ANALYSIS_ID, conceptId, unitName, String.valueOf(FEMALE), "Null", null, "0", 20L, 20L);
                    aa.addResult(ar);
                }
                if (otherResults.size() == 0) {
                    AchillesResult ar = new AchillesResult(MEASUREMENT_GENDER_ANALYSIS_ID, conceptId, unitName, String.valueOf(OTHER), "Null", null, "0", 20L, 20L);
                    aa.addResult(ar);
                }
            }

        }

    }

    public static HashMap<String,List<AchillesResult>> seperateUnitResults(AchillesAnalysis aa){
        List<String> distinctUnits = new ArrayList<>();

        for(AchillesResult ar:aa.getResults()){
            if(!distinctUnits.contains(ar.getStratum2()) && !Strings.isNullOrEmpty(ar.getStratum2())){
                distinctUnits.add(ar.getStratum2());
            }
        }

        Multimap<String, AchillesResult> resultsWithUnits = Multimaps
                .index(aa.getResults(), AchillesResult::getStratum2);

        HashMap<String,List<AchillesResult>> seperatedResults = new HashMap<>();

        for(String key:resultsWithUnits.keySet()){
            seperatedResults.put(key,new ArrayList<>(resultsWithUnits.get(key)));
        }
        return seperatedResults;
    }

    public static HashMap<String,List<AchillesResultDist>> seperateDistResultsByUnit(List<AchillesResultDist> results) {
        Multimap<String, AchillesResultDist> distResultsWithUnits = Multimaps
                .index(results, AchillesResultDist::getStratum2);
        HashMap<String,List<AchillesResultDist>> seperatedResults = new HashMap<>();

        for(String key:distResultsWithUnits.keySet()){
            seperatedResults.put(key,new ArrayList<>(distResultsWithUnits.get(key)));
        }

        return seperatedResults;
    }

    public String trimTrailingZeroDecimals(String s) {
        String trimmedValue = null;
        if (s != null) {
            trimmedValue = s.indexOf(".") < 0 ? s : s.replaceAll("0*$", "").replaceAll("\\.$", "");
        }
        return trimmedValue;
    }

    public float normalizeBinWidth(Float bMin, Float bMax) {
        Float binWidth = (float)0;

        if (((bMax - bMin)/11) >= 5) {
            binWidth = (float) (Math.round(((bMax-bMin)/11)/5)*5);
        } else if (((bMax-bMin)/11) >= 0.1 && ((bMax-bMin)/11) <= 1) {
            binWidth = (float) (Math.ceil((float)(((bMax-bMin)/11))/0.1)*0.1);
        } else if (((bMax-bMin)/11) >= 1 && ((bMax-bMin)/11) <= 2) {
            binWidth = (float) (Math.round((float)(((bMax-bMin)/11))/2)*2);
        } else if (((bMax-bMin)/11) >= 2 && ((bMax-bMin)/11) <= 3) {
            binWidth = (float) (Math.round((float)(((bMax-bMin)/11))/3)*3);
        } else if (((bMax-bMin)/11) >= 3 && ((bMax-bMin)/11) <= 5) {
            binWidth = (float) (Math.round((float)(((bMax-bMin)/11))/5)*5);
        } else {
            binWidth = (float) (Math.round(((bMax-bMin)/11))*10.0/10.0);
        }

        return binWidth;
    }
}