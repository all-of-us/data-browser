package org.pmiops.workbench.cdr.dao;
import org.pmiops.workbench.cdr.model.DbAchillesAnalysis;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface AchillesAnalysisDao extends CrudRepository<DbAchillesAnalysis, Long> {
    List<DbAchillesAnalysis> findAll();

    @Query(value = "select distinct a from DbAchillesAnalysis a left join FETCH a.results as r " +
            "where r.stratum1 = ?1 and r.stratum2 in (?2)and a.analysisId in (3110,3111,3112,3113,3320,3321) order by a.analysisId"
    )
    List<DbAchillesAnalysis> findSurveyAnalysisResults(String survey_concept_id, List<String> question_concept_ids);

    @Query(value = "select distinct a from DbAchillesAnalysis a left join FETCH a.results r " +
            "where r.stratum1=?1 and a.analysisId in (?2)"
    )
    List<DbAchillesAnalysis> findConceptAnalysisResults(String concept_id,List<Long> analysisIds);

    @Query(value = "select a from DbAchillesAnalysis a left join FETCH a.results r where a.analysisId=?1")
    DbAchillesAnalysis findAnalysisById(Long analysisId);

    @Query(value = "select a from DbAchillesAnalysis a left join FETCH a.results r where a.analysisId in (?1) and r.stratum3 = ?2")
    List<DbAchillesAnalysis> findAnalysisByIdsAndDomain(List<Long> analysisId, String domainId);

    @Query(value = "select distinct a from DbAchillesAnalysis a left join FETCH a.results r where a.analysisId in (?1)")
    List<DbAchillesAnalysis> findAnalysisByIds(List<Long> analysisId);

    @Query(value = "select a from DbAchillesAnalysis a left join FETCH a.results r where a.analysisId in (?1) and r.stratum1 = ?2")
    List<DbAchillesAnalysis> findSurveyAnalysisByIds(List<Long> analysisId, String domainId);

    @Query(value = "select distinct a from DbAchillesAnalysis a left join FETCH a.results r where a.analysisId in (?1) and r.stratum2=?2 and r.stratum6=?3")
    List<DbAchillesAnalysis> findSurveyQuestionCounts(List<Long> analysisId, String questionConceptId, String questionPath);

    @Query(value = "select distinct a from DbAchillesAnalysis a left join FETCH a.results r where a.analysisId in (?1) and r.stratum1=?2 and r.stratum2=?3 and r.stratum6=?4")
    List<DbAchillesAnalysis> findSurveyQuestionResults(List<Long> analysisId, String surveyConceptId, String questionConceptId, String path);

    @Query(value = "select distinct a from DbAchillesAnalysis a left join FETCH a.results r where r.stratum2 in (?2) and a.analysisId in (?1)")
    List<DbAchillesAnalysis> findSubQuestionResults(List<Long> analysisIds, List<String> questionIds);
}


