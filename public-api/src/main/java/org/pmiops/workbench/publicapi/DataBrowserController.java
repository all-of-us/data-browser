package org.pmiops.workbench.publicapi;

import java.util.logging.Logger;
import java.util.*;
import org.apache.commons.lang3.math.NumberUtils;
import com.google.common.base.Strings;
import org.springframework.http.HttpStatus;
import java.time.*;
import com.google.common.collect.ImmutableList;
import java.net.SocketTimeoutException;
import javax.validation.Valid;
import org.springframework.web.bind.annotation.RequestBody;
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
import org.pmiops.workbench.model.SurveyVersionCountResponse;
import org.pmiops.workbench.model.SurveyQuestionFetchResponse;
import org.pmiops.workbench.model.SearchConceptsRequest;
import org.pmiops.workbench.model.Domain;
import org.pmiops.workbench.model.MatchType;
import org.pmiops.workbench.model.QuestionConceptListResponse;
import org.pmiops.workbench.model.ConceptAnalysisListResponse;
import org.pmiops.workbench.model.AnalysisListResponse;
import org.pmiops.workbench.model.CountAnalysis;
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
import org.pmiops.workbench.exceptions.ServerErrorException;
import org.pmiops.workbench.exceptions.DataNotFoundException;

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
    public static final long SURVEY_GENDER_COUNT_ANALYSIS_ID = 3200;
    public static final long SURVEY_AGE_COUNT_ANALYSIIS_ID = 3201;
    public static final long GENDER_ANALYSIS_ID = 3101;
    public static final long PARTICIPANT_COUNT_BY_DATE_ANALYSIS_ID = 3107;
    public static final long AGE_ANALYSIS_ID = 3102;

    public static final long SURVEY_VERSION_PARTICIPANT_COUNT_ANALYSIS_ID = 3400;
    public static final long SURVEY_VERSION_QUESTION_COUNT_ANALYSIS_ID = 3401;

    public static final long SURVEY_COUNT_ANALYSIS_ID = 3110;
    public static final long SURVEY_GENDER_ANALYSIS_ID = 3111;
    public static final long SURVEY_AGE_ANALYSIS_ID = 3112;
    public static final long SURVEY_VERSION_ANALYSIS_ID = 3113;

    public static final long SURVEY_QUESTION_GENDER_COUNT_ANALYSIS_ID = 3320;
    public static final long SURVEY_QUESTION_AGE_COUNT_ANALYSIS_ID = 3321;

    public static final long EHR_GENDER_COUNT_ANALYSIS_ID = 3300;
    public static final long EHR_AGE_COUNT_ANALYSIS_ID = 3301;

    public static final long RACE_ANALYSIS_ID = 3103;
    public static final long ETHNICITY_ANALYSIS_ID = 3104;

    public static final long MEASUREMENT_DIST_ANALYSIS_ID = 1815;

    public static final long MEASUREMENT_GENDER_DIST_ANALYSIS_ID = 1815;

    public static final long MEASUREMENT_GENDER_ANALYSIS_ID = 1900;
    public static final long MEASUREMENT_GENDER_UNIT_ANALYSIS_ID = 1910;

    public static final ArrayList<Long> FMH_CONDITION_CONCEPT_IDS = new ArrayList<>(Arrays.asList(43528515L, 1384639L, 43528634L, 43528761L, 43529158L, 43529767L, 43529272L, 43529217L, 702786L, 43529966L, 43529638L));
    public static final ArrayList<Long> FMH_FM_CONCEPT_IDS = new ArrayList<>(Arrays.asList(43528764L, 43528763L, 43528649L, 43528651L, 43528650L, 43528765L));

    public static final long MALE = 8507;
    public static final long FEMALE = 8532;
    public static final long INTERSEX = 1585848;
    public static final long NONE = 1585849;
    public static final long OTHER = 0;

    public static final long GENDER_ANALYSIS = 2;
    public static final long RACE_ANALYSIS = 4;
    public static final long ETHNICITY_ANALYSIS = 5;

    public static Map<String, String> ageStratumNameMap = new HashMap<String, String>();
    public static Map<String, String> versionStratumNameMap = new HashMap<String, String>();
    public static Map<String, String> genderStratumNameMap = new HashMap<String, String>();
    public static Set<String> validAgeDeciles = new TreeSet<String>(Arrays.asList(new String[]{"2", "3", "4", "5", "6", "7", "8", "9"}));

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

    public static void setAgeStratumNameMap() {
        ageStratumNameMap.put("2", "18-29");
        ageStratumNameMap.put("3", "30-39");
        ageStratumNameMap.put("4", "40-49");
        ageStratumNameMap.put("5", "50-59");
        ageStratumNameMap.put("6", "60-69");
        ageStratumNameMap.put("7", "70-79");
        ageStratumNameMap.put("8", "80-89");
        ageStratumNameMap.put("9", "89+");
    }

    public static void setSurveyVersionNameMap() {
        versionStratumNameMap.put("January", "1");
        versionStratumNameMap.put("February", "2");
        versionStratumNameMap.put("March", "3");
        versionStratumNameMap.put("April", "4");
        versionStratumNameMap.put("May", "5");
        versionStratumNameMap.put("June", "6");
        versionStratumNameMap.put("July/August", "7");
        versionStratumNameMap.put("September", "9");
        versionStratumNameMap.put("October", "10");
        versionStratumNameMap.put("November", "11");
        versionStratumNameMap.put("December", "12");
    }

    public static void setGenderStratumNameMap() {
        /* This is to slow to use the db */
        genderStratumNameMap.put("8507", "Male");
        genderStratumNameMap.put("8532", "Female");
        genderStratumNameMap.put("8521", "Other");
        genderStratumNameMap.put("8551", "Unknown");
        genderStratumNameMap.put("8570", "Ambiguous");
        genderStratumNameMap.put("1585849", "None of these describe me");
        genderStratumNameMap.put("1585848", "Intersex");
        genderStratumNameMap.put("0", "Other");
    }

    static {
        setAgeStratumNameMap();
        setGenderStratumNameMap();
        setSurveyVersionNameMap();
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
    private static final Function<QuestionConcept, org.pmiops.workbench.model.QuestionConcept>
            TO_CLIENT_QUESTION_CONCEPT =
            new Function<QuestionConcept, org.pmiops.workbench.model.QuestionConcept>() {
                @Override
                public org.pmiops.workbench.model.QuestionConcept apply(QuestionConcept concept) {

                    org.pmiops.workbench.model.Analysis countAnalysis=null;
                    org.pmiops.workbench.model.Analysis genderAnalysis=null;
                    org.pmiops.workbench.model.Analysis ageAnalysis=null;
                    org.pmiops.workbench.model.Analysis versionAnalysis=null;

                    if(concept.getCountAnalysis() != null){
                        countAnalysis = TO_CLIENT_ANALYSIS.apply(concept.getCountAnalysis());
                    }
                    if(concept.getGenderAnalysis() != null){
                        genderAnalysis = TO_CLIENT_ANALYSIS.apply(concept.getGenderAnalysis());
                    }
                    if(concept.getAgeAnalysis() != null){
                        ageAnalysis = TO_CLIENT_ANALYSIS.apply(concept.getAgeAnalysis());
                    }
                    if(concept.getVersionAnalysis() != null){
                        versionAnalysis = TO_CLIENT_ANALYSIS.apply(concept.getVersionAnalysis());
                    }

                    return new org.pmiops.workbench.model.QuestionConcept()
                            .conceptId(concept.getQuestionConceptId().getConceptId())
                            .conceptName(concept.getConceptName())
                            .conceptCode(concept.getConceptCode())
                            .surveyName(concept.getSurveyName())
                            .surveyConceptId(concept.getQuestionConceptId().getSurveyConceptId())
                            .countValue(concept.getCountValue())
                            .sub(concept.getSub())
                            .path(concept.getQuestionConceptId().getPath())
                            .isParentQuestion(concept.getIsParentQuestion())
                            .questionOrderNumber(concept.getQuestionOrderNumber())
                            .questionString(concept.getQuestionString())
                            .countAnalysis(countAnalysis)
                            .genderAnalysis(genderAnalysis)
                            .ageAnalysis(ageAnalysis)
                            .versionAnalysis(versionAnalysis);
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
    private static final Function<ConceptAnalysis, ConceptAnalysis>
            TO_CLIENT_CONCEPTANALYSIS=
            new Function<ConceptAnalysis, ConceptAnalysis>() {
                @Override
                public ConceptAnalysis apply(ConceptAnalysis ca) {
                    return new ConceptAnalysis()
                            .conceptId(ca.getConceptId())
                            .countAnalysis(ca.getCountAnalysis())
                            .genderAnalysis(ca.getGenderAnalysis())
                            .ageAnalysis(ca.getAgeAnalysis())
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

                    if (o.getAnalysisId() == SURVEY_AGE_ANALYSIS_ID || o.getAnalysisId() == SURVEY_GENDER_ANALYSIS_ID) {
                        String rStratum5Name = o.getAnalysisStratumName();
                        String analysisStratumName = o.getAnalysisStratumName();
                        if (rStratum5Name == null || rStratum5Name.equals("")) {
                            if (o.getAnalysisId() == SURVEY_AGE_ANALYSIS_ID && validAgeDeciles.contains(o.getStratum5())) {
                                o.setAnalysisStratumName(ageStratumNameMap.get(o.getStratum5()));
                                analysisStratumName = ageStratumNameMap.get(o.getStratum5());
                            }
                            if (o.getAnalysisId() == SURVEY_GENDER_ANALYSIS_ID) {
                                o.setAnalysisStratumName(genderStratumNameMap.get(o.getStratum5()));
                                analysisStratumName = genderStratumNameMap.get(o.getStratum5());
                            }
                        }
                    }

                    if (o.getAnalysisId() == SURVEY_VERSION_ANALYSIS_ID) {
                        String rStratum7Name = o.getAnalysisStratumName();
                        String analysisStratumName = o.getAnalysisStratumName();
                        if (rStratum7Name == null || rStratum7Name.equals("")) {
                            o.setAnalysisStratumName(versionStratumNameMap.get(o.getStratum7()));
                            analysisStratumName = versionStratumNameMap.get(o.getStratum7());
                        }
                    }

                    String stratum7 = o.getStratum7();
                    if (o.getAnalysisId() == SURVEY_COUNT_ANALYSIS_ID) {
                        if (o.getStratum3().equals("903096")) {
                            stratum7 = "";
                        }
                    }

                    return new org.pmiops.workbench.model.AchillesResult()
                            .id(o.getId())
                            .analysisId(o.getAnalysisId())
                            .stratum1(o.getStratum1())
                            .stratum2(o.getStratum2())
                            .stratum3(o.getStratum3())
                            .stratum4(o.getStratum4())
                            .stratum5(o.getStratum5())
                            .stratum6(o.getStratum6())
                            .stratum7(stratum7)
                            .analysisStratumName(o.getAnalysisStratumName())
                            .measurementValueType(o.getMeasurementValueType())
                            .countValue(o.getCountValue())
                            .sourceCountValue(o.getSourceCountValue());
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
        try {
            CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());
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
            CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());
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
            CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());
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
            CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }

        List<DomainInfo> domainInfos =  null;
        List<SurveyModule> surveyModules = null;

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
                domainInfos = domainInfoDao.findStandardOrCodeMatchConceptCounts(domainKeyword, query, toMatchConceptIds, measurementQuery);
            } else if (measurementQuery == -1){
                domainInfos = domainInfoDao.findStandardOrCodeMatchConceptCountsWithoutMeasurementCounts(domainKeyword, query, toMatchConceptIds);
            } else if (measurementQuery == 2) {
                domainInfos = domainInfoDao.findStandardOrCodeMatchConceptCountsWithNoFilter(domainKeyword, query, toMatchConceptIds);
            }

            surveyModules = surveyModuleDao.findSurveyModuleQuestionCounts(surveyKeyword, FMH_CONDITION_CONCEPT_IDS, FMH_FM_CONCEPT_IDS);
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

            domainInfos =  ImmutableList.copyOf(domainInfoDao.findDomainTotals(getTests, getOrders));
            surveyModules = ImmutableList.copyOf(surveyModuleDao.findByCanShowNotOrderByOrderNumberAsc(0));
        }

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
        try {
            CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }
        CdrVersion cdrVersion = cdrVersionDao.findByIsDefault(true);
        if (cdrVersion == null) {
            throw new DataNotFoundException("Cdr Version table is not available. Please check if the database is up and version is right.");
        }
        return ResponseEntity.ok(TO_CLIENT_CDR_VERSION.apply(cdrVersion));
    }

    @Override
    public ResponseEntity<org.pmiops.workbench.model.Analysis> getGenderAnalysis(){
        try {
            CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }
        AchillesAnalysis genderAnalysis = achillesAnalysisDao.findAnalysisById(GENDER_ANALYSIS);
        Optional.ofNullable(genderAnalysis).orElseThrow(() -> new DataNotFoundException("Gender Analysis data is not available"));
        addGenderStratum(genderAnalysis,1, "0", null);
        return ResponseEntity.ok(TO_CLIENT_ANALYSIS.apply(genderAnalysis));
    }

    @Override
    public ResponseEntity<SurveyQuestionFetchResponse> getSurveyQuestions(Long surveyConceptId, String searchWord) {
        try {
            CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }

        SurveyQuestionFetchResponse response = new SurveyQuestionFetchResponse();

        SurveyModule surveyModule = surveyModuleDao.findByConceptId(surveyConceptId);

        response.setSurvey(SurveyModule.TO_CLIENT_SURVEY_MODULE.apply(surveyModule));

        String surveyKeyword = ConceptService.modifyMultipleMatchKeyword(searchWord, ConceptService.SearchType.SURVEY_COUNTS);

        List<QuestionConcept> questions = new ArrayList<>();

        if (searchWord == null || searchWord.isEmpty()) {
            // Get all the questions
            questions = questionConceptDao.getSurveyQuestions(surveyConceptId);
        } else {
            // TODO Get only the matching questions
            questions = questionConceptDao.getMatchingSurveyQuestions(surveyConceptId, searchWord);
        }

        QuestionConceptListResponse questionResp = new QuestionConceptListResponse();
        questionResp.setItems(questions.stream().map(TO_CLIENT_QUESTION_CONCEPT).collect(Collectors.toList()));

        response.setQuestions(questionResp);
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<SurveyQuestionFetchResponse> getSubQuestions(Long surveyConceptId, Long questionConceptId, Long answerConceptId, Integer level) {
        try {
            CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }
        SurveyQuestionFetchResponse response = new SurveyQuestionFetchResponse();

        List<QuestionConcept> questions = new ArrayList<>();

        if (level == 1) {
            questions = questionConceptDao.getSubQuestionsLevel1(String.valueOf(questionConceptId), String.valueOf(answerConceptId), String.valueOf(surveyConceptId));
        } else if (level == 2) {
            questions = questionConceptDao.getSubQuestionsLevel2(String.valueOf(answerConceptId));
        }

        List<String> questionIds = new ArrayList<>();

        for(QuestionConcept qc: questions) {
            questionIds.add(String.valueOf(qc.getQuestionConceptId().getConceptId()));
        }

        List<AchillesAnalysis> surveyAnalysisList = achillesAnalysisDao.findSubQuestionResults(ImmutableList.of(3110L, 3111L, 3112L, 3113L), questionIds);

        QuestionConceptListResponse questionResp = new QuestionConceptListResponse();
        questionResp.setItems(mapAnalysesToQuestions(surveyAnalysisList, questions.stream().map(TO_CLIENT_QUESTION_CONCEPT).collect(Collectors.toList())));

        response.setQuestions(questionResp);

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<SurveyQuestionFetchResponse> getFMHQuestions(Long surveyConceptId, List<String> questionConceptIds, String searchWord) {
        try {
            CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }
        SurveyQuestionFetchResponse response = new SurveyQuestionFetchResponse();

        SurveyModule surveyModule = surveyModuleDao.findByConceptId(surveyConceptId);

        response.setSurvey(SurveyModule.TO_CLIENT_SURVEY_MODULE.apply(surveyModule));

        List<QuestionConcept> questions = new ArrayList<>();

        if (searchWord == null || searchWord.isEmpty()) {
            // Get all the questions
            questions = questionConceptDao.getFMHQuestions(questionConceptIds);
        } else {
            // TODO Get only the matching questions
            questions = questionConceptDao.getMatchingFMHQuestions(questionConceptIds, searchWord);
        }

        QuestionConceptListResponse questionResp = new QuestionConceptListResponse();
        questionResp.setItems(questions.stream().map(TO_CLIENT_QUESTION_CONCEPT).collect(Collectors.toList()));

        List<String> questionIds = new ArrayList<>();

        response.setQuestions(questionResp);
        return ResponseEntity.ok(response);

    }

    @Override
    public ResponseEntity<QuestionConceptListResponse> getFMHSurveyQuestionResults(String questionConceptId, String answerConceptId) {
        try {
            CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }

        QuestionConceptListResponse resp = new QuestionConceptListResponse();

        List<QuestionConcept> subQuestions = questionConceptDao.getSubQuestionsLevel1(questionConceptId, answerConceptId, "43528698");

        List<String> questionConceptIds = new ArrayList<>();

        for(QuestionConcept q: subQuestions) {
            questionConceptIds.add(String.valueOf(q.getQuestionConceptId().getConceptId()));
        }

        List<AchillesAnalysis> analyses = achillesAnalysisDao.findSurveyAnalysisResults("43528698", questionConceptIds);

        List<org.pmiops.workbench.model.QuestionConcept> mappedQuestions = mapAnalysesToQuestions(analyses, subQuestions.stream().map(TO_CLIENT_QUESTION_CONCEPT).collect(Collectors.toList()));

        resp.setItems(mappedQuestions);

        return ResponseEntity.ok(resp);
    }

    @Override
    public ResponseEntity<AnalysisListResponse> getSurveyQuestionResults(Long surveyConceptId, Long questionConceptId, String questionPath) {
        try {
            CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }

        AnalysisListResponse analysisListResponse = new AnalysisListResponse();
        List<AchillesAnalysis> surveyAnalysisList = achillesAnalysisDao.findSurveyQuestionResults(ImmutableList.of(3110L, 3111L, 3112L, 3113L), String.valueOf(surveyConceptId), String.valueOf(questionConceptId), questionPath);
        analysisListResponse.setItems(surveyAnalysisList.stream().map(TO_CLIENT_ANALYSIS).collect(Collectors.toList()));

        return ResponseEntity.ok(analysisListResponse);
    }

    @Override
    public ResponseEntity<SurveyVersionCountResponse> getSurveyVersionCounts(Long surveyConceptId) {
        try {
            CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }

        SurveyVersionCountResponse surveyVersionCountResponse = new SurveyVersionCountResponse();

        List<AchillesAnalysis> surveyAnalysisList = achillesAnalysisDao.findAnalysisByIds(ImmutableList.of(SURVEY_VERSION_PARTICIPANT_COUNT_ANALYSIS_ID, SURVEY_VERSION_QUESTION_COUNT_ANALYSIS_ID));
        AnalysisListResponse analysisListResponse = new AnalysisListResponse();
        analysisListResponse.setItems(surveyAnalysisList.stream().map(TO_CLIENT_ANALYSIS).collect(Collectors.toList()));
        surveyVersionCountResponse.setAnalyses(analysisListResponse);

        return ResponseEntity.ok(surveyVersionCountResponse);
    }

    @Override
    public ResponseEntity<CountAnalysis> getCountAnalysis(String domainId, String domainDesc) {
        CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());

        if (domainDesc.equals("ehr")) {
            List<AchillesAnalysis> ehrAnalysesList = achillesAnalysisDao.findAnalysisByIdsAndDomain(ImmutableList.of(3300L, 3301L), domainId);
            CountAnalysis ehrCountAnalysis = new CountAnalysis();
            ehrCountAnalysis.setDomainId(domainId);
            AchillesAnalysis genderCountAnalysis = ehrAnalysesList.stream().filter(aa -> aa.getAnalysisId() == 3300).collect(Collectors.toList()).get(0);
            AchillesAnalysis ageCountAnalysis = ehrAnalysesList.stream().filter(aa -> aa.getAnalysisId() == 3301).collect(Collectors.toList()).get(0);
            addGenderStratum(genderCountAnalysis,4, domainId, null);
            addAgeStratum(ageCountAnalysis, domainId, null,  4);
            ehrCountAnalysis.setGenderCountAnalysis(TO_CLIENT_ANALYSIS.apply(genderCountAnalysis));
            ehrCountAnalysis.setAgeCountAnalysis(TO_CLIENT_ANALYSIS.apply(ageCountAnalysis));
            return ResponseEntity.ok(ehrCountAnalysis);
        } else if (domainDesc.equals("survey")){
            List<AchillesAnalysis> ehrAnalysesList = achillesAnalysisDao.findSurveyAnalysisByIds(ImmutableList.of(SURVEY_GENDER_COUNT_ANALYSIS_ID, SURVEY_AGE_COUNT_ANALYSIIS_ID), domainId);
            CountAnalysis surveyCountAnalysis = new CountAnalysis();
            surveyCountAnalysis.setDomainId(domainId);
            AchillesAnalysis genderCountAnalysis = ehrAnalysesList.stream().filter(aa -> aa.getAnalysisId() == SURVEY_GENDER_COUNT_ANALYSIS_ID).collect(Collectors.toList()).get(0);
            AchillesAnalysis ageCountAnalysis = ehrAnalysesList.stream().filter(aa -> aa.getAnalysisId() == SURVEY_AGE_COUNT_ANALYSIIS_ID).collect(Collectors.toList()).get(0);
            addGenderStratum(genderCountAnalysis,2, domainId, null);
            addAgeStratum(ageCountAnalysis, domainId, null,  2);
            surveyCountAnalysis.setGenderCountAnalysis(TO_CLIENT_ANALYSIS.apply(genderCountAnalysis));
            surveyCountAnalysis.setAgeCountAnalysis(TO_CLIENT_ANALYSIS.apply(ageCountAnalysis));
            return ResponseEntity.ok(surveyCountAnalysis);
        } else {
            List<AchillesAnalysis> ehrAnalysesList = achillesAnalysisDao.findAnalysisByIdsAndDomain(ImmutableList.of(3300L, 3301L), domainId);
            CountAnalysis ehrCountAnalysis = new CountAnalysis();
            ehrCountAnalysis.setDomainId(domainId);
            AchillesAnalysis genderCountAnalysis = ehrAnalysesList.stream().filter(aa -> aa.getAnalysisId() == 3300).collect(Collectors.toList()).get(0);
            AchillesAnalysis ageCountAnalysis = ehrAnalysesList.stream().filter(aa -> aa.getAnalysisId() == 3301).collect(Collectors.toList()).get(0);
            addGenderStratum(genderCountAnalysis,4, domainId, null);
            addAgeStratum(ageCountAnalysis, domainId, null,  4);
            ehrCountAnalysis.setGenderCountAnalysis(TO_CLIENT_ANALYSIS.apply(genderCountAnalysis));
            ehrCountAnalysis.setAgeCountAnalysis(TO_CLIENT_ANALYSIS.apply(ageCountAnalysis));
            return ResponseEntity.ok(ehrCountAnalysis);
        }
    }

    @Override
    public ResponseEntity<AnalysisListResponse> getSurveyQuestionCounts(String questionConceptId, String questionPath) {
        try {
            CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }
        List<AchillesAnalysis> surveyQuestionCountList = achillesAnalysisDao.findSurveyQuestionCounts(ImmutableList.of(3320L, 3321L), questionConceptId, questionPath);

        AnalysisListResponse analysisListResponse = new AnalysisListResponse();
        analysisListResponse.setItems(surveyQuestionCountList.stream().map(TO_CLIENT_ANALYSIS).collect(Collectors.toList()));
        return ResponseEntity.ok(analysisListResponse);
    }

    @Override
    public ResponseEntity<ConceptAnalysisListResponse> getConceptAnalysisResults(List<String> conceptIds, String domainId){
        try {
            CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }

        ConceptAnalysisListResponse resp=new ConceptAnalysisListResponse();
        List<ConceptAnalysis> conceptAnalysisList=new ArrayList<>();

        List<AchillesAnalysis> ehrAnalysesList = achillesAnalysisDao.findAnalysisByIdsAndDomain(ImmutableList.of(3300L, 3301L), domainId);

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

            List<AchillesAnalysis> analysisList = achillesAnalysisDao.findConceptAnalysisResults(conceptId,ImmutableList.of(GENDER_ANALYSIS_ID, AGE_ANALYSIS_ID, COUNT_ANALYSIS_ID, MEASUREMENT_GENDER_ANALYSIS_ID, MEASUREMENT_DIST_ANALYSIS_ID, MEASUREMENT_GENDER_UNIT_ANALYSIS_ID));


            if (analysisList.size() == 0) {
                throw new DataNotFoundException("Cannot find analysis data of this concept");
            }

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
                }else if(analysisId == AGE_ANALYSIS_ID){
                    addAgeStratum(aa, conceptId, null, 2);
                    conceptAnalysis.setAgeAnalysis(TO_CLIENT_ANALYSIS.apply(aa));
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
                                        //Seperate text and numeric values
                                        ArrayList<AchillesResult> textValues = new ArrayList<>();
                                        ArrayList<AchillesResult> numericValues = new ArrayList<>();
                                        // In case no unit has a mix of text and numeric values, only display text values as mix does not make sense to user.
                                        for (AchillesResult result: unitGenderAnalysis.getResults()) {
                                            if (result.getStratum5() == null || result.getStratum5().trim().isEmpty()) {
                                                result.setMeasurementValueType("numeric");
                                                numericValues.add(result);
                                            } else {
                                                result.setMeasurementValueType("text");
                                                textValues.add(result);
                                            }
                                        }

                                        if (textValues.size() > 0) {
                                            processMeasurementGenderMissingBins(MEASUREMENT_GENDER_DIST_ANALYSIS_ID,unitGenderAnalysis, conceptId, null, null, "text");
                                        }
                                        if (numericValues.size() > 0) {
                                            processMeasurementGenderMissingBins(MEASUREMENT_GENDER_DIST_ANALYSIS_ID,unitGenderAnalysis, conceptId, null, null, "numeric");
                                        }
                                        unitGenderAnalysis.setResults(results.get(unit));
                                        unitGenderAnalysis.setUnitName(unit);

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

    @Override
    public ResponseEntity<AnalysisListResponse> getFitbitAnalysisResults() {
        try {
            CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }

        List<AchillesAnalysis> analysisList = achillesAnalysisDao.findAnalysisByIdsAndDomain(ImmutableList.of(GENDER_ANALYSIS_ID, AGE_ANALYSIS_ID, COUNT_ANALYSIS_ID, PARTICIPANT_COUNT_BY_DATE_ANALYSIS_ID), "Fitbit");

        return null;
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
            CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());
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
    public ResponseEntity<org.pmiops.workbench.model.AchillesResult> getParticipantCount() {
        try {
            CdrVersionContext.setCdrVersionNoCheckAuthDomain(defaultCdrVersionProvider.get());
        } catch(NullPointerException ie) {
            throw new ServerErrorException("Cannot set default cdr version");
        }
        AchillesResult result = achillesResultDao.findAchillesResultByAnalysisId(PARTICIPANT_COUNT_ANALYSIS_ID);
        if (result == null) {
            throw new DataNotFoundException("Participant count could not be fetched. Please check the achilles results table if row with analysis id 1 is present in there.");
        }
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
        String domainConceptId = null;
        for(AchillesResult ar: aa.getResults()){
            String analysisStratumName =ar.getAnalysisStratumName();
            if (analysisStratumName == null || analysisStratumName.equals("")) {
                if (stratum == 1) {
                    uniqueGenderStratums.add(ar.getStratum1());
                    ar.setAnalysisStratumName(genderStratumNameMap.get(ar.getStratum1()));
                } else if (stratum == 2) {
                    uniqueGenderStratums.add(ar.getStratum2());
                    ar.setAnalysisStratumName(genderStratumNameMap.get(ar.getStratum2()));
                } else if (stratum == 3) {
                    uniqueGenderStratums.add(ar.getStratum3());
                    ar.setAnalysisStratumName(genderStratumNameMap.get(ar.getStratum3()));
                } else if (stratum == 4) {
                    domainConceptId = ar.getStratum1();
                    uniqueGenderStratums.add(ar.getStratum4());
                    ar.setAnalysisStratumName(genderStratumNameMap.get(ar.getStratum4()));
                }
            }
        }
        if(uniqueGenderStratums.size() < 3) {
            Set<String> completeGenderStratumList = new TreeSet<String>(Arrays.asList(new String[] {"8507", "8532", "0"}));
            completeGenderStratumList.removeAll(uniqueGenderStratums);
            for(String missingGender: completeGenderStratumList){
                AchillesResult missingResult = null;
                if (aa.getAnalysisId() == EHR_GENDER_COUNT_ANALYSIS_ID) {
                    missingResult = new AchillesResult(aa.getAnalysisId(), domainConceptId, null, conceptId, missingGender, null, null, 20L, 20L);
                } else {
                    if (stratum == 1) {
                        missingResult = new AchillesResult(aa.getAnalysisId(), missingGender, null, null, null, null, null, 20L, 20L);
                    } else if (stratum == 2) {
                        missingResult = new AchillesResult(aa.getAnalysisId(), conceptId, missingGender, null, null, null, null, 20L, 20L);
                    } else if (stratum == 3) {
                        missingResult = new AchillesResult(aa.getAnalysisId(), conceptId, null, missingGender, null, null, null, 20L, 20L);
                    }
                }
                missingResult.setAnalysisStratumName(genderStratumNameMap.get(missingGender));
                aa.getResults().add(missingResult);
            }
        }
        aa.setResults(aa.getResults().stream().filter(ar -> ar.getAnalysisStratumName() != null).collect(Collectors.toList()));
    }

    public void addAgeStratum(AchillesAnalysis aa, String conceptId, List<AchillesResult> ehrCountResults, int stratum){
        Set<String> uniqueAgeDeciles = new TreeSet<String>();
        for(AchillesResult ar: aa.getResults()){
            String analysisStratumName=ar.getAnalysisStratumName();
            if (analysisStratumName == null || analysisStratumName.equals("")) {
                if (stratum == 2) {
                    if (ar.getStratum2() != null && !ar.getStratum2().equals("0")) {
                        uniqueAgeDeciles.add(ar.getStratum2());
                        ar.setAnalysisStratumName(ageStratumNameMap.get(ar.getStratum2()));
                    }
                } else if (stratum == 4) {
                    if (ar.getStratum4() != null && !ar.getStratum4().equals("0")) {
                        uniqueAgeDeciles.add(ar.getStratum4());
                        ar.setAnalysisStratumName(ageStratumNameMap.get(ar.getStratum4()));
                    }
                }
            }
        }
        aa.setResults(aa.getResults().stream().filter(ar -> ar.getAnalysisStratumName() != null).collect(Collectors.toList()));
        if(uniqueAgeDeciles.size() < 8){
            if (aa.getAnalysisId() == EHR_AGE_COUNT_ANALYSIS_ID) {
                Set<String> completeAgeDeciles = new TreeSet<String>(Arrays.asList(new String[] {"2", "3", "4", "5", "6", "7", "8", "9"}));
                completeAgeDeciles.removeAll(uniqueAgeDeciles);
                for(String missingAgeDecile: completeAgeDeciles){
                    List<AchillesResult> ehrAgeCountResults = null;
                    try {
                        ehrAgeCountResults  = ehrCountResults.stream().filter(ar -> ar.getStratum4().equals(missingAgeDecile)).collect(Collectors.toList());
                    } catch(NullPointerException npe) {
                    }
                    AchillesResult missingResult = null;
                    if (ehrAgeCountResults != null && ehrAgeCountResults.size() > 0) {
                        AchillesResult result = ehrAgeCountResults.get(0);
                        String percentageValue = String.valueOf(Math.round((20/result.getCountValue())*100/2)*2);
                        missingResult = new AchillesResult(EHR_AGE_COUNT_ANALYSIS_ID, conceptId, null, null, missingAgeDecile, null, null, 20L, 20L);
                    } else {
                        missingResult = new AchillesResult(EHR_AGE_COUNT_ANALYSIS_ID, conceptId, null, null, missingAgeDecile, null, null, 20L, 20L);
                    }
                    missingResult.setAnalysisStratumName(ageStratumNameMap.get(missingAgeDecile));
                    aa.getResults().add(missingResult);
                }
            } else {
                Set<String> completeAgeDeciles = new TreeSet<String>(Arrays.asList(new String[] {"2", "3", "4", "5", "6", "7", "8", "9"}));
                completeAgeDeciles.removeAll(uniqueAgeDeciles);
                for(String missingAgeDecile: completeAgeDeciles){
                    AchillesResult missingResult = new AchillesResult(AGE_ANALYSIS_ID, conceptId, missingAgeDecile, null, null, null, null, 20L, 20L);
                    missingResult.setAnalysisStratumName(ageStratumNameMap.get(missingAgeDecile));
                    aa.getResults().add(missingResult);
                }
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

            Collections.sort(maleBinRanges);
            Collections.sort(femaleBinRanges);
            Collections.sort(otherBinRanges);

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
                    ar.setAnalysisStratumName(genderStratumNameMap.get(ar.getStratum3()));
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
                    ar.setAnalysisStratumName(genderStratumNameMap.get(ar.getStratum2()));
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

    public List<org.pmiops.workbench.model.QuestionConcept> mapAnalysesToQuestions(List<AchillesAnalysis> analyses, List<org.pmiops.workbench.model.QuestionConcept> questions) {
        Map<Long, List<AchillesResult>> countAnalysisResultsByQuestion = new HashMap<>();
        Map<Long, List<AchillesResult>> genderAnalysisResultsByQuestion = new HashMap<>();
        Map<Long, List<AchillesResult>> ageAnalysisResultsByQuestion = new HashMap<>();
        Map<Long, List<AchillesResult>> versionAnalysisResultsByQuestion = new HashMap<>();

        AchillesAnalysis countAnalysis = null;
        AchillesAnalysis genderAnalysis = null;
        AchillesAnalysis ageAnalysis = null;
        AchillesAnalysis versionAnalysis = null;

        for (AchillesAnalysis aa: analyses) {
            if (aa.getAnalysisId() == SURVEY_COUNT_ANALYSIS_ID) {
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
            if (aa.getAnalysisId() == SURVEY_GENDER_ANALYSIS_ID) {
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
            if (aa.getAnalysisId() == SURVEY_AGE_ANALYSIS_ID) {
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
            if (aa.getAnalysisId() == SURVEY_VERSION_ANALYSIS_ID) {

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

        for(org.pmiops.workbench.model.QuestionConcept q: questions) {
            if (countAnalysis != null) {
                AchillesAnalysis ca = new AchillesAnalysis(countAnalysis);
                ca.setResults(countAnalysisResultsByQuestion.get(q.getConceptId()));
                q.setCountAnalysis(TO_CLIENT_ANALYSIS.apply(ca));
            }
            if (genderAnalysis != null) {
                AchillesAnalysis ga = new AchillesAnalysis(genderAnalysis);
                ga.setResults(genderAnalysisResultsByQuestion.get(q.getConceptId()));
                q.setGenderAnalysis(TO_CLIENT_ANALYSIS.apply(ga));
            }
            if (ageAnalysis != null) {
                AchillesAnalysis aa = new AchillesAnalysis(ageAnalysis);
                aa.setResults(ageAnalysisResultsByQuestion.get(q.getConceptId()));
                q.setAgeAnalysis(TO_CLIENT_ANALYSIS.apply(aa));
            }
            if (versionAnalysis != null) {
                AchillesAnalysis aa = new AchillesAnalysis(versionAnalysis);
                aa.setResults(versionAnalysisResultsByQuestion.get(q.getConceptId()));
                q.setVersionAnalysis(TO_CLIENT_ANALYSIS.apply(aa));
            }
        }

        return questions;
    }
}