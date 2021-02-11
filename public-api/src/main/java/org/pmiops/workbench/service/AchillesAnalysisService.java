package org.pmiops.workbench.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.pmiops.workbench.model.Analysis;
import org.pmiops.workbench.model.AchillesResult;
import org.pmiops.workbench.model.AchillesResultDist;
import org.pmiops.workbench.model.SurveyMetadata;
import org.pmiops.workbench.cdr.model.DbAchillesResult;
import org.pmiops.workbench.cdr.model.DbAchillesResultDist;
import org.pmiops.workbench.cdr.dao.AchillesAnalysisDao;
import org.pmiops.workbench.cdr.AchillesMapper;
import com.google.common.collect.ImmutableList;
import org.pmiops.workbench.model.CountAnalysis;
import org.pmiops.workbench.model.ConceptAnalysis;
import com.google.common.collect.Multimaps;
import com.google.common.collect.Multimap;
import java.util.List;
import java.util.ArrayList;
import java.util.Set;
import java.util.TreeSet;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.util.Collections;
import java.util.Arrays;
import java.util.Iterator;
import java.util.Comparator;
import com.google.common.base.Strings;
import org.pmiops.workbench.model.AnalysisIdConstant;
import org.pmiops.workbench.model.CommonStorageEnums;

@Service
public class AchillesAnalysisService {
    private final AchillesAnalysisDao achillesAnalysisDao;
    private final AchillesResultDistService achillesResultDistService;
    private final AchillesMapper achillesMapper;

    public static final long MALE = 8507;
    public static final long FEMALE = 8532;
    public static final long INTERSEX = 1585848;
    public static final long NONE = 1585849;
    public static final long OTHER = 0;

    public static Map<String, String> ageStratumNameMap = new HashMap<String, String>();
    public static Map<String, String> genderStratumNameMap = new HashMap<String, String>();

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
    }

    @Autowired
    public AchillesAnalysisService(AchillesAnalysisDao achillesAnalysisDao, AchillesMapper achillesMapper, AchillesResultDistService achillesResultDistService) {
        this.achillesAnalysisDao = achillesAnalysisDao;
        this.achillesMapper = achillesMapper;
        this.achillesResultDistService = achillesResultDistService;
    }

    public Analysis findAnalysisById(Long analysisId) {
        return achillesMapper.dbModelToClient(achillesAnalysisDao.findAnalysisById(analysisId));
    }

    public List<Analysis> findAnalysisByIdsAndDomain(List<Long> analysisId, String domainId) {
        return achillesAnalysisDao.findAnalysisByIdsAndDomain(analysisId, domainId).stream()
                .map(achillesMapper::dbModelToClient)
                .collect(Collectors.toList());
    }

    public List<Analysis> findSurveyAnalysisByIds(List<Long> analysisId, String domainId) {
        return achillesAnalysisDao.findSurveyAnalysisByIds(analysisId, domainId).stream()
                .map(achillesMapper::dbModelToClient)
                .collect(Collectors.toList());
    }

    public List<Analysis> findConceptAnalysisResults(String conceptId,List<Long> analysisIds) {
        return achillesAnalysisDao.findConceptAnalysisResults(conceptId, analysisIds).stream()
                .map(achillesMapper::dbModelToClient)
                .collect(Collectors.toList());
    }

    public List<Analysis> findSubQuestionResults(List<Long> analysisIds, List<String> questionIds) {
        return achillesAnalysisDao.findSubQuestionResults(analysisIds, questionIds).stream()
                .map(achillesMapper::dbModelToClient)
                .collect(Collectors.toList());
    }

    public List<Analysis> findSurveyAnalysisResults(String survey_concept_id, List<String> question_concept_ids) {
        return achillesAnalysisDao.findSurveyAnalysisResults(survey_concept_id, question_concept_ids).stream()
                .map(achillesMapper::dbModelToClient)
                .collect(Collectors.toList());
    }

    public List<Analysis> findSurveyQuestionResults(List<Long> analysisId, String surveyConceptId, String questionConceptId, String path) {
        return achillesAnalysisDao.findSurveyQuestionResults(analysisId, surveyConceptId, questionConceptId, path).stream()
                .map(achillesMapper::dbModelToClient)
                .collect(Collectors.toList());
    }

    public List<Analysis> findAnalysisByIds(List<Long> analysisIds) {
        return achillesAnalysisDao.findAnalysisByIds(analysisIds).stream()
                .map(achillesMapper::dbModelToClient)
                .collect(Collectors.toList());
    }

    public List<Analysis> findSurveyQuestionCounts(List<Long> analysisIds, String questionConceptId, String questionPath) {
        return achillesAnalysisDao.findSurveyQuestionCounts(analysisIds, questionConceptId, questionPath).stream()
                .map(achillesMapper::dbModelToClient)
                .collect(Collectors.toList());
    }

    public Analysis getGenderAnalysis() {
        Analysis genderAnalysis = achillesMapper.dbModelToClient(achillesAnalysisDao.findAnalysisById(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.GENDER_ANALYSIS)));
        addGenderStratum(genderAnalysis,1, "0", null);
        return genderAnalysis;
    }

    public CountAnalysis getCountAnalysis(String domainId, String domainDesc, ImmutableList<Long> analysisIds, int stratum) {
        List<Analysis> analysisList;
        if (domainDesc.equals("survey")) {
            analysisList = achillesAnalysisDao.findSurveyAnalysisByIds(analysisIds, domainId)
                    .stream()
                    .map(achillesMapper::dbModelToClient)
                    .collect(Collectors.toList());
        } else {
            analysisList = achillesAnalysisDao.findAnalysisByIdsAndDomain(analysisIds, domainId)
                    .stream()
                    .map(achillesMapper::dbModelToClient)
                    .collect(Collectors.toList());
        }

        CountAnalysis countAnalysis = new CountAnalysis();
        countAnalysis.setDomainId(domainId);
        Analysis genderCountAnalysis = analysisList.stream().filter(aa -> aa.getAnalysisId() == (domainDesc.equals("survey") ? 3200 : 3300)).collect(Collectors.toList()).get(0);
        Analysis ageCountAnalysis = analysisList.stream().filter(aa -> aa.getAnalysisId() == (domainDesc.equals("survey") ? 3201 : 3301)).collect(Collectors.toList()).get(0);
        addGenderStratum(genderCountAnalysis,stratum, domainId, null);
        addAgeStratum(ageCountAnalysis, domainId, null,  stratum);
        countAnalysis.setGenderCountAnalysis(genderCountAnalysis);
        countAnalysis.setAgeCountAnalysis(ageCountAnalysis);
        return countAnalysis;
    }

    public List<ConceptAnalysis> getFitbitConceptAnalyses(List<String> concepts) {
        List<Analysis> analysisList = achillesAnalysisDao.findAnalysisByIdsAndDomain(ImmutableList.of(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.GENDER_ANALYSIS_ID), CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.AGE_ANALYSIS_ID),
                CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.COUNT_ANALYSIS_ID), CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.PARTICIPANT_COUNT_BY_DATE_ANALYSIS_ID)), "Fitbit").stream()
                .map(achillesMapper::dbModelToClient)
                .collect(Collectors.toList());
        List<ConceptAnalysis> conceptAnalysisList=new ArrayList<>();
        HashMap<Long, Analysis> analysisHashMap = new HashMap<>();
        for(Analysis aa: analysisList){
            analysisHashMap.put(aa.getAnalysisId(), aa);
        }
        for (String concept: concepts) {

            ConceptAnalysis conceptAnalysis=new ConceptAnalysis();

            Analysis countAnalysis = achillesMapper.makeCopyAnalysis(analysisHashMap.get(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.COUNT_ANALYSIS_ID)));
            Analysis ageAnalysis = achillesMapper.makeCopyAnalysis(analysisHashMap.get(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.AGE_ANALYSIS_ID)));
            Analysis genderAnalysis = achillesMapper.makeCopyAnalysis(analysisHashMap.get(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.GENDER_ANALYSIS_ID)));
            Analysis participantCountAnalysis = achillesMapper.makeCopyAnalysis(analysisHashMap.get(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.PARTICIPANT_COUNT_BY_DATE_ANALYSIS_ID)));

            countAnalysis.setResults(analysisHashMap.get(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.COUNT_ANALYSIS_ID)).getResults());
            ageAnalysis.setResults(analysisHashMap.get(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.AGE_ANALYSIS_ID)).getResults().stream().filter(ar -> ar.getStratum1().equals(concept)).collect(Collectors.toList()));
            genderAnalysis.setResults(analysisHashMap.get(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.GENDER_ANALYSIS_ID)).getResults().stream().filter(ar -> ar.getStratum1().equals(concept)).collect(Collectors.toList()));
            participantCountAnalysis.setResults(analysisHashMap.get(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.PARTICIPANT_COUNT_BY_DATE_ANALYSIS_ID)).getResults().stream().filter(ar -> ar.getStratum1().equals(concept)).collect(Collectors.toList()));
            participantCountAnalysis.getResults().sort(Comparator.comparing(AchillesResult::getStratum2));

            addGenderStratum(genderAnalysis,2, concept, null);
            addAgeStratum(ageAnalysis, concept, null, 2);

            conceptAnalysis.setConceptId(concept);
            conceptAnalysis.setCountAnalysis(countAnalysis);
            conceptAnalysis.setGenderAnalysis(genderAnalysis);
            conceptAnalysis.setAgeAnalysis(ageAnalysis);
            conceptAnalysis.setParticipantCountAnalysis(participantCountAnalysis);
            conceptAnalysisList.add(conceptAnalysis);
        }
        return conceptAnalysisList;
    }

    public List<ConceptAnalysis> getConceptAnalyses(List<String> conceptIds, String domainId) {
        List<ConceptAnalysis> conceptAnalysisList=new ArrayList<>();

        List<DbAchillesResultDist> overallDistResults = achillesResultDistService.fetchByAnalysisIdsAndConceptIds(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.MEASUREMENT_DIST_ANALYSIS_ID), conceptIds);
        Multimap<String, DbAchillesResultDist> conceptDistResults = Multimaps.index(overallDistResults, DbAchillesResultDist::getStratum1);

        for(String conceptId: conceptIds){
            ConceptAnalysis conceptAnalysis=new ConceptAnalysis();
            boolean isMeasurement = false;

            List<Analysis> analysisList = achillesAnalysisDao.findConceptAnalysisResults(conceptId,ImmutableList.of(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.GENDER_ANALYSIS_ID),
                    CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.AGE_ANALYSIS_ID), CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.COUNT_ANALYSIS_ID),
                    CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.MEASUREMENT_GENDER_ANALYSIS_ID), CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.MEASUREMENT_DIST_ANALYSIS_ID), CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.MEASUREMENT_GENDER_UNIT_ANALYSIS_ID))).stream()
                    .map(achillesMapper::dbModelToClient)
                    .collect(Collectors.toList());

            HashMap<Long, Analysis> analysisHashMap = new HashMap<>();
            for (Analysis aa : analysisList) {
                analysisHashMap.put(aa.getAnalysisId(), aa);
            }

            conceptAnalysis.setConceptId(conceptId);
            Iterator it = analysisHashMap.entrySet().iterator();
            while (it.hasNext()) {
                Map.Entry pair = (Map.Entry) it.next();
                Long analysisId = (Long) pair.getKey();
                Analysis aa = (Analysis) pair.getValue();
                //aa.setUnitName(unitName);
                if (!analysisId.equals(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.MEASUREMENT_GENDER_UNIT_ANALYSIS_ID)) && !analysisId.equals(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.MEASUREMENT_GENDER_ANALYSIS_ID)) && !analysisId.equals(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.MEASUREMENT_DIST_ANALYSIS_ID)) && !Strings.isNullOrEmpty(domainId)) {
                    aa.setResults(aa.getResults().stream().filter(ar -> ar.getStratum3().equalsIgnoreCase(domainId)).collect(Collectors.toList()));
                }

                if (analysisId.equals(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.COUNT_ANALYSIS_ID))) {
                    conceptAnalysis.setCountAnalysis(aa);
                } else if (analysisId.equals(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.GENDER_ANALYSIS_ID))) {
                    addGenderStratum(aa, 2, conceptId, null);
                    conceptAnalysis.setGenderAnalysis(aa);
                } else if (analysisId.equals(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.AGE_ANALYSIS_ID))) {
                    addAgeStratum(aa, conceptId, null, 2);
                    conceptAnalysis.setAgeAnalysis(aa);
                } else if (analysisId.equals(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.MEASUREMENT_GENDER_ANALYSIS_ID))) {
                    Map<String, List<AchillesResult>> results = seperateUnitResults(aa);

                    List<Analysis> unitSeperateAnalysis = new ArrayList<>();
                    if (conceptDistResults != null) {
                        Multimap<String, DbAchillesResultDist> conceptDistResultsByUnit = Multimaps.index(conceptDistResults.get(conceptId), DbAchillesResultDist::getStratum2);
                        for (String unit : conceptDistResultsByUnit.keySet()) {
                            if (results.containsKey(unit)) {
                                Analysis unitGenderAnalysis = achillesMapper.makeCopyAnalysis(aa);
                                unitGenderAnalysis.setResults(results.get(unit));
                                unitGenderAnalysis.setUnitName(unit);
                                if (!unit.equalsIgnoreCase("no unit")) {
                                    processMeasurementGenderMissingBins(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.MEASUREMENT_DIST_ANALYSIS_ID), unitGenderAnalysis, conceptId, unit, new ArrayList<>(conceptDistResultsByUnit.get(unit)), "numeric");
                                } else {
                                    //Seperate text and numeric values
                                    ArrayList<AchillesResult> textValues = new ArrayList<>();
                                    ArrayList<AchillesResult> numericValues = new ArrayList<>();
                                    // In case no unit has a mix of text and numeric values, only display text values as mix does not make sense to user.
                                    for (AchillesResult result : unitGenderAnalysis.getResults()) {
                                        if (result.getStratum5() == null || result.getStratum5().trim().isEmpty()) {
                                            result.setMeasurementValueType("numeric");
                                            numericValues.add(result);
                                        } else {
                                            result.setMeasurementValueType("text");
                                            textValues.add(result);
                                        }
                                    }

                                    if (textValues.size() > 0) {
                                        processMeasurementGenderMissingBins(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.MEASUREMENT_DIST_ANALYSIS_ID), unitGenderAnalysis, conceptId, null, null, "text");
                                    }
                                    if (numericValues.size() > 0) {
                                        processMeasurementGenderMissingBins(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.MEASUREMENT_DIST_ANALYSIS_ID), unitGenderAnalysis, conceptId, null, null, "numeric");
                                    }
                                    unitGenderAnalysis.setResults(results.get(unit));
                                    unitGenderAnalysis.setUnitName(unit);

                                }
                                unitSeperateAnalysis.add(unitGenderAnalysis);
                            }
                        }
                    } else {
                        unitSeperateAnalysis.add(aa);
                    }
                    addGenderStratum(aa, 3, conceptId, null);
                    isMeasurement = true;
                    conceptAnalysis.setMeasurementValueGenderAnalysis(unitSeperateAnalysis);
                } else if (analysisId.equals(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.MEASUREMENT_GENDER_UNIT_ANALYSIS_ID))) {
                    Map<String, List<AchillesResult>> results = seperateUnitResults(aa);
                    List<Analysis> unitSeperateAnalysis = new ArrayList<>();
                    for (String unit : results.keySet()) {
                        Analysis unitGenderCountAnalysis = achillesMapper.makeCopyAnalysis(aa);
                        unitGenderCountAnalysis.setResults(results.get(unit));
                        unitGenderCountAnalysis.setUnitName(unit);
                        unitSeperateAnalysis.add(unitGenderCountAnalysis);
                    }
                    isMeasurement = true;
                    conceptAnalysis.setMeasurementGenderCountAnalysis(unitSeperateAnalysis);
                } }

            if (isMeasurement) {
                // Fetches analysis object 1815 with empty results
                Analysis measurementDistAnalysis = achillesMapper.dbModelToClient(achillesAnalysisDao.findAnalysisById(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.MEASUREMENT_DIST_ANALYSIS_ID)));
                List<AchillesResultDist> achillesResultDistList = conceptDistResults.get(conceptId).stream()
                        .map(achillesMapper::dbModelToClient)
                        .collect(Collectors.toList());
                HashMap<String, List<AchillesResultDist>> results = seperateDistResultsByUnit(achillesResultDistList);
                List<Analysis> unitSeperateAnalysis = new ArrayList<>();
                for (String unit : results.keySet()) {
                    Analysis mDistAnalysis = achillesMapper.makeCopyAnalysis(measurementDistAnalysis);
                    mDistAnalysis.setDistResults(results.get(unit));
                    mDistAnalysis.setUnitName(unit);
                    unitSeperateAnalysis.add(mDistAnalysis);
                }
                conceptAnalysis.setMeasurementDistributionAnalysis(unitSeperateAnalysis);
            }
            conceptAnalysisList.add(conceptAnalysis);
        }
        return conceptAnalysisList;
    }

    public void addGenderStratum(Analysis aa, int stratum, String conceptId, List<DbAchillesResult> ehrCountResults){
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
            Set<String> completeGenderStratumList = new TreeSet<String>(Arrays.asList("8507", "8532", "0"));
            completeGenderStratumList.removeAll(uniqueGenderStratums);
            for(String missingGender: completeGenderStratumList){
                AchillesResult missingResult = null;
                if (aa.getAnalysisId() == CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.EHR_GENDER_COUNT_ANALYSIS_ID)) {
                    missingResult = achillesMapper.makeCopyAchillesResult(aa.getAnalysisId(), domainConceptId, null, conceptId, missingGender, null, null,null, 20L, 20L);
                } else {
                    if (stratum == 1) {
                        missingResult = achillesMapper.makeCopyAchillesResult(aa.getAnalysisId(), missingGender, null, null, null, null, null,null, 20L, 20L);
                    } else if (stratum == 2) {
                        missingResult = achillesMapper.makeCopyAchillesResult(aa.getAnalysisId(), conceptId, missingGender, null, null, null, null,null, 20L, 20L);
                    } else if (stratum == 3) {
                        missingResult = achillesMapper.makeCopyAchillesResult(aa.getAnalysisId(), conceptId, null, missingGender, null, null, null,null, 20L, 20L);
                    }
                }
                missingResult.setAnalysisStratumName(genderStratumNameMap.get(missingGender));
                aa.getResults().add(missingResult);
            }
        }
        aa.setResults(aa.getResults().stream().filter(ar -> ar.getAnalysisStratumName() != null).collect(Collectors.toList()));
    }

    public void addAgeStratum(Analysis aa, String conceptId, List<DbAchillesResult> ehrCountResults, int stratum){
        Set<String> uniqueAgeDeciles = new TreeSet<String>();
        for(AchillesResult ar: aa.getResults()){
            String analysisStratumName=ar.getAnalysisStratumName();
            if (analysisStratumName == null || analysisStratumName.equals("")) {
                if (stratum == 2 && ar.getStratum2() != null && !ar.getStratum2().equals("0")) {
                        uniqueAgeDeciles.add(ar.getStratum2());
                        ar.setAnalysisStratumName(ageStratumNameMap.get(ar.getStratum2()));
                } else if (stratum == 4 && ar.getStratum4() != null && !ar.getStratum4().equals("0")) {
                        uniqueAgeDeciles.add(ar.getStratum4());
                        ar.setAnalysisStratumName(ageStratumNameMap.get(ar.getStratum4()));
                }
            }
        }
        aa.setResults(aa.getResults().stream().filter(ar -> ar.getAnalysisStratumName() != null).collect(Collectors.toList()));
        if(uniqueAgeDeciles.size() < 8){
            if (aa.getAnalysisId() == CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.EHR_AGE_COUNT_ANALYSIS_ID)) {
                Set<String> completeAgeDeciles = new TreeSet<String>(Arrays.asList("2", "3", "4", "5", "6", "7", "8", "9"));
                completeAgeDeciles.removeAll(uniqueAgeDeciles);
                for(String missingAgeDecile: completeAgeDeciles){
                    List<DbAchillesResult> ehrAgeCountResults = null;
                    ehrAgeCountResults  = ehrCountResults.stream().filter(ar -> ar.getStratum4() != null && ar.getStratum4().equals(missingAgeDecile)).collect(Collectors.toList());
                    AchillesResult missingResult = null;
                    if (ehrAgeCountResults != null && ehrAgeCountResults.size() > 0) {
                        missingResult = achillesMapper.makeCopyAchillesResult(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.EHR_AGE_COUNT_ANALYSIS_ID), conceptId, null, null, missingAgeDecile, null, null, null, 20L, 20L);
                    } else {
                        missingResult = achillesMapper.makeCopyAchillesResult(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.EHR_AGE_COUNT_ANALYSIS_ID), conceptId, null, null, missingAgeDecile, null, null, null, 20L, 20L);
                    }
                    missingResult.setAnalysisStratumName(ageStratumNameMap.get(missingAgeDecile));
                    aa.getResults().add(missingResult);
                }
            } else {
                Set<String> completeAgeDeciles = new TreeSet<String>(Arrays.asList("2", "3", "4", "5", "6", "7", "8", "9"));
                completeAgeDeciles.removeAll(uniqueAgeDeciles);
                for(String missingAgeDecile: completeAgeDeciles){
                    AchillesResult missingResult = achillesMapper.makeCopyAchillesResult(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.AGE_ANALYSIS_ID), conceptId, missingAgeDecile, null, null, null, null, null, 20L, 20L);
                    missingResult.setAnalysisStratumName(ageStratumNameMap.get(missingAgeDecile));
                    aa.getResults().add(missingResult);
                }
            }
        }
    }

    public static HashMap<String,List<AchillesResult>> seperateUnitResults(Analysis aa){
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

    public void processMeasurementGenderMissingBins(Long analysisId, Analysis aa, String conceptId, String unitName, List<DbAchillesResultDist> resultDists, String type) {

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

            for(DbAchillesResultDist ard:resultDists){
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
                AchillesResult achillesResult = achillesMapper.makeCopyAchillesResult(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.MEASUREMENT_GENDER_ANALYSIS_ID), conceptId, unitName, String.valueOf(MALE), maleRemaining, null, String.valueOf(missingBinWidth), null, 20L, 20L);
                aa.addResultsItem(achillesResult);
            }

            for(String femaleRemaining: femaleRangesInResults){
                String missingBinWidth = null;
                if (femaleBinWidth == (long)femaleBinWidth) {
                    missingBinWidth = String.format("%d",(long)femaleBinWidth);
                } else {
                    missingBinWidth = String.format("%.2f", femaleBinWidth);
                }
                missingBinWidth = trimTrailingZeroDecimals(missingBinWidth);
                AchillesResult ar = achillesMapper.makeCopyAchillesResult(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.MEASUREMENT_GENDER_ANALYSIS_ID), conceptId, unitName, String.valueOf(FEMALE), femaleRemaining, null, String.valueOf(missingBinWidth), null, 20L, 20L);
                aa.addResultsItem(ar);
            }

            for(String otherRemaining: otherRangesInResults){
                String missingBinWidth = null;
                if (otherBinWidth == (long)otherBinWidth) {
                    missingBinWidth = String.format("%d",(long)otherBinWidth);
                } else {
                    missingBinWidth = String.format("%.2f", otherBinWidth);
                }
                missingBinWidth = trimTrailingZeroDecimals(missingBinWidth);
                AchillesResult ar = achillesMapper.makeCopyAchillesResult(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.MEASUREMENT_GENDER_ANALYSIS_ID), conceptId, unitName, String.valueOf(OTHER), otherRemaining, null, String.valueOf(missingBinWidth), null, 20L, 20L);
                aa.addResultsItem(ar);
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
                    AchillesResult achillesResult = achillesMapper.makeCopyAchillesResult(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.MEASUREMENT_GENDER_ANALYSIS_ID), conceptId, "No Unit", String.valueOf(MALE), "0", null, "0", null, 20L, 20L);
                    aa.addResultsItem(achillesResult);
                }
                if (femaleResults.size() == 0) {
                    AchillesResult ar = achillesMapper.makeCopyAchillesResult(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.MEASUREMENT_GENDER_ANALYSIS_ID), conceptId, unitName, String.valueOf(FEMALE), "0", null, "0", null, 20L, 20L);
                    aa.addResultsItem(ar);
                }
                if (otherResults.size() == 0) {
                    AchillesResult ar = achillesMapper.makeCopyAchillesResult(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.MEASUREMENT_GENDER_ANALYSIS_ID), conceptId, unitName, String.valueOf(OTHER), "0", null, "0", null, 20L, 20L);
                    aa.addResultsItem(ar);
                }
            } else if(("text").equals(type)) {
                if (maleResults.size() == 0) {
                    AchillesResult achillesResult = achillesMapper.makeCopyAchillesResult(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.MEASUREMENT_GENDER_ANALYSIS_ID), conceptId, "No Unit", String.valueOf(MALE), "Null", null, "0", null, 20L, 20L);
                    aa.addResultsItem(achillesResult);
                }
                if (femaleResults.size() == 0) {
                    AchillesResult ar = achillesMapper.makeCopyAchillesResult(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.MEASUREMENT_GENDER_ANALYSIS_ID), conceptId, unitName, String.valueOf(FEMALE), "Null", null, "0", null, 20L, 20L);
                    aa.addResultsItem(ar);
                }
                if (otherResults.size() == 0) {
                    AchillesResult ar = achillesMapper.makeCopyAchillesResult(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.MEASUREMENT_GENDER_ANALYSIS_ID), conceptId, unitName, String.valueOf(OTHER), "Null", null, "0", null, 20L, 20L);
                    aa.addResultsItem(ar);
                }
            }

        }

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

    public String trimTrailingZeroDecimals(String s) {
        String trimmedValue = null;
        if (s != null) {
            trimmedValue = s.indexOf(".") < 0 ? s : s.replaceAll("0*$", "").replaceAll("\\.$", "");
        }
        return trimmedValue;
    }

    public float normalizeBinWidth(Float bMin, Float bMax) {
        float binWidth;

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

    public List<SurveyMetadata> mapAnalysesToQuestions(List<Analysis> analyses, List<SurveyMetadata> questions) {
        Map<Long, Analysis> analysisMap = analyses.stream().collect(Collectors.toMap(Analysis::getAnalysisId, Analysis -> Analysis));
        Multimap<String, AchillesResult> countAnalysisResultsByQuestion = Multimaps.index(
                analysisMap.get(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.SURVEY_COUNT_ANALYSIS_ID)).getResults(), AchillesResult::getStratum2);
        Multimap<String, AchillesResult> genderAnalysisResultsByQuestion = Multimaps.index(
                analysisMap.get(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.SURVEY_GENDER_ANALYSIS_ID)).getResults(), AchillesResult::getStratum2);
        Multimap<String, AchillesResult> ageAnalysisResultsByQuestion = Multimaps.index(
                analysisMap.get(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.SURVEY_AGE_ANALYSIS_ID)).getResults(), AchillesResult::getStratum2);
        Multimap<String, AchillesResult> versionAnalysisResultsByQuestion = Multimaps.index(
                analysisMap.get(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.SURVEY_VERSION_ANALYSIS_ID)).getResults(), AchillesResult::getStratum2);

        for(SurveyMetadata q: questions) {
            Analysis countAnalysis = analysisMap.get(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.SURVEY_COUNT_ANALYSIS_ID));
            if (countAnalysis != null) {
                Analysis ca = achillesMapper.makeCopyAnalysis(countAnalysis);
                ca.setResults(new ArrayList<>(
                        countAnalysisResultsByQuestion.get(String.valueOf(q.getConceptId()))));
                q.setCountAnalysis(ca);
            }
            Analysis genderAnalysis = analysisMap.get(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.SURVEY_GENDER_ANALYSIS_ID));
            if (genderAnalysis != null) {
                Analysis ga = achillesMapper.makeCopyAnalysis(genderAnalysis);
                ga.setResults(new ArrayList<>(
                        genderAnalysisResultsByQuestion.get(String.valueOf(q.getConceptId()))));
                q.setGenderAnalysis(ga);
            }
            Analysis ageAnalysis = analysisMap.get(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.SURVEY_AGE_ANALYSIS_ID));
            if (ageAnalysis != null) {
                Analysis aa = achillesMapper.makeCopyAnalysis(ageAnalysis);
                aa.setResults(new ArrayList<>(
                        ageAnalysisResultsByQuestion.get(String.valueOf(q.getConceptId()))));
                q.setAgeAnalysis(aa);
            }
            Analysis versionAnalysis = analysisMap.get(CommonStorageEnums.analysisIdFromName(AnalysisIdConstant.SURVEY_VERSION_ANALYSIS_ID));
            if (versionAnalysis != null) {
                Analysis aa = achillesMapper.makeCopyAnalysis(versionAnalysis);
                aa.setResults(new ArrayList<>(
                        versionAnalysisResultsByQuestion.get(String.valueOf(q.getConceptId()))));
                q.setVersionAnalysis(aa);
            }
        }
        return questions;
    }
}