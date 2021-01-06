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

    @Mapping(target = "distResults", source="achillesResultDistList")
    Analysis dbModelToClient(DbAchillesAnalysis db);

    default boolean isNonEmpty(String s) {
        return s != null && !s.isEmpty();
    }
}