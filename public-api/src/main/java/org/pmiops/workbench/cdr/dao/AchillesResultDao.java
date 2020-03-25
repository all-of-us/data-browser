package org.pmiops.workbench.cdr.dao;

import org.pmiops.workbench.cdr.model.AchillesResult;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface AchillesResultDao extends CrudRepository<AchillesResult, Long> {
    AchillesResult findAchillesResultByAnalysisId(Long analysisId);

    @Query(nativeQuery=true, value="select distinct * from achilles_results ar where ar.analysis_id=3110 and ar.stratum_1=?1 and ar.stratum_2 in (?2) \n" +
            "and exists (select * from survey_question_map where SUBSTRING_INDEX(path, '.', ?3) like concat('%',stratum_3,'%') and generate_counts=1 and stratum_3 is not null and length(stratum_3) > 0 \n" +
            "and SUBSTRING_INDEX(path, '.', ?3) like concat('%',stratum_2,'%'))")
    List<AchillesResult> findCountAnalysisResultsWithSubQuestions(String surveyConceptId, List<String> questionConceptIds, int pathCheckFlag);



    @Query(nativeQuery=true, value="select distinct ar.* from achilles_results ar where ar.analysis_id=3110 and ar.stratum_1=?1 and ar.stratum_2 in (?2)\n" +
            "and exists\n" +
            "(select * from achilles_results ar1 where ar1.analysis_id=3110 and ar1.stratum_1=?1 and ar1.stratum_2=ar.stratum_3)")
    List<AchillesResult> findFMHCountAnalysisResultsWithSubQuestions(String surveyConceptId, List<String> questionConceptIds);


    @Query(nativeQuery=true, value="SELECT distinct ar.id, ar.analysis_id, ar.stratum_1, ar.stratum_2, ar.stratum_3, ar.stratum_4, 0 as stratum_5, ar.stratum_6, ar.count_value, ar.source_count_value \n" +
            "FROM survey_question_map sqm JOIN achilles_results ar ON sqm.path LIKE CONCAT('%', ar.stratum_3, '%') and LENGTH(sqm.path) - LENGTH(REPLACE(sqm.path, '.', '')) = 2 \n" +
            "JOIN achilles_results ar2 ON sqm.question_concept_id=ar2.stratum_2 and ar2.analysis_id=3110 \n" +
            "where ar.stratum_2=?1 and ar.analysis_id=3110 \n" +
            "and (match(sqm.question_text) against (?2 in boolean mode) \n" +
            "or match(ar2.stratum_4) against(?2 in boolean mode) > 0) \n" +
            "union distinct select distinct ar3.id, ar3.analysis_id, ar3.stratum_1, ar3.stratum_2, ar3.stratum_3, ar3.stratum_4, 1 as stratum_5, ar3.stratum_6, ar3.count_value, ar3.source_count_value \n" +
            "FROM survey_question_map sqm JOIN achilles_results ar ON sqm.path LIKE CONCAT('%', ar.stratum_3, '%') and LENGTH(sqm.path) - LENGTH(REPLACE(sqm.path, '.', '')) = 4 \n" +
            "JOIN achilles_results ar2 ON sqm.question_concept_id=ar2.stratum_2 and ar2.analysis_id=3110 \n" +
            "JOIN achilles_results ar3 ON ar3.stratum_3=SUBSTRING_INDEX(SUBSTRING_INDEX(sqm.path, '.', 2), '.', -1) \n" +
            "where ar.stratum_2=?1 and ar.analysis_id=3110 and ar3.analysis_id=3110 \n" +
            "and (match(sqm.question_text) against (?2 in boolean mode) \n" +
            "or match(ar2.stratum_4) against(?2 in boolean mode) > 0)")
    List<AchillesResult> getMatchingResultIds(String question_concept_id, String search_word);
}
