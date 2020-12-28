package org.pmiops.workbench.cdr;

import org.mapstruct.Mapper;
import org.pmiops.workbench.model.AchillesResultDist;
import org.pmiops.workbench.cdr.model.DbAchillesResultDist;
import org.pmiops.workbench.utils.mappers.CommonMappers;
import org.pmiops.workbench.utils.mappers.MapStructConfig;

@Mapper(
        config = MapStructConfig.class,
        uses = {CommonMappers.class})
public interface AchillesMapper {
    AchillesResultDist dbModelToClient(DbAchillesResultDist db);

    default boolean isNonEmpty(String s) {
        return s != null && !s.isEmpty();
    }
}