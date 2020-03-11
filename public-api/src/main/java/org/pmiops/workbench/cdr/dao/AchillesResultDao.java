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
}
