package org.pmiops.workbench.cdr;

import org.mapstruct.Mapper;
import org.pmiops.workbench.model.AchillesResultDist;
import org.pmiops.workbench.model.AchillesResult;
import org.pmiops.workbench.model.Analysis;
import org.mapstruct.Mapping;
import org.pmiops.workbench.cdr.model.DbAchillesResultDist;
import org.pmiops.workbench.cdr.model.DbAchillesResult;
import org.pmiops.workbench.cdr.model.DbAchillesAnalysis;
import org.pmiops.workbench.utils.mappers.CommonMappers;
import org.pmiops.workbench.utils.mappers.MapStructConfig;


@Mapper(
        config = MapStructConfig.class,
        uses = {CommonMappers.class})
public interface AchillesMapper {
    AchillesResultDist dbModelToClient(DbAchillesResultDist db);

    AchillesResult dbModelToClient(DbAchillesResult db);

    AchillesResult makeCopyResult(AchillesResult ar);

    Analysis makeCopyAnalysis(Analysis aa);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "analysisStratumName", ignore = true)
    @Mapping(target = "measurementValueType", ignore = true)
    AchillesResult makeCopyAchillesResult(Long analysisId, String stratum1, String stratum2, String stratum3, String stratum4, String stratum5, String stratum6, String stratum7, Long countValue, Long sourceCountValue);

    @Mapping(target = "distResults", source="achillesResultDistList")
    Analysis dbModelToClient(DbAchillesAnalysis db);

    default boolean isNonEmpty(String s) {
        return s != null && !s.isEmpty();
    }
}