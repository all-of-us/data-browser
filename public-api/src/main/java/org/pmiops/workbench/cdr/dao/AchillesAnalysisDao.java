package org.pmiops.workbench.cdr.dao;
import org.pmiops.workbench.cdr.model.AchillesAnalysis;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface AchillesAnalysisDao extends CrudRepository<AchillesAnalysis, Long> {
    List<AchillesAnalysis> findAll();

    @Query(value = "select distinct a from AchillesAnalysis a left join FETCH a.results as r " +
            "where r.stratum1 = ?1 and r.stratum2 in (?2) and a.analysisId in (3110,3111,3112,3320,3321) order by a.analysisId"
    )
    List<AchillesAnalysis> findSurveyAnalysisResults(String survey_concept_id, List<String> question_concept_ids);

    @Query(value = "select distinct a from AchillesAnalysis a left join FETCH a.results as r " +
            "where r.stratum1 = ?1 and r.stratum2 in (?2) and r.stratum6 LIKE ?3 and a.analysisId in (3110,3111,3112,3320,3321) order by a.analysisId"
    )
    List<AchillesAnalysis> findSubSurveyAnalysisResults(String survey_concept_id, List<String> question_concept_ids, String result_concept_id);


    @Query(value = "select distinct a from AchillesAnalysis a left join FETCH a.results r " +
            "where r.stratum1=?1 and a.analysisId in (?2)"
    )
    List<AchillesAnalysis> findConceptAnalysisResults(String concept_id,List<Long> analysisIds);

    @Query(value = "select a from AchillesAnalysis a left join FETCH a.results r where a.analysisId=?1")
    AchillesAnalysis findAnalysisById(Long analysisId);


    @Query(value = "select a from AchillesAnalysis a left join FETCH a.results r where a.analysisId in (?1) and r.stratum3 = ?2")
    List<AchillesAnalysis> findAnalysisByIds(List<Long> analysisId, String domainId);

    @Query(value = "select distinct a from AchillesAnalysis a left join FETCH a.results r where a.analysisId in (?1) and r.stratum2=?2 and r.stratum6=?3")
    List<AchillesAnalysis> findSurveyQuestionCounts(List<Long> analysisId, String questionConceptId, String questionPath);
}


