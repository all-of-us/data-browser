package org.pmiops.workbench.cdr;

import org.mapstruct.Mapper;
import org.pmiops.workbench.db.model.DbCdrVersion;
import org.pmiops.workbench.model.CdrVersion;
import org.pmiops.workbench.utils.mappers.CommonMappers;
import org.pmiops.workbench.utils.mappers.MapStructConfig;

@Mapper(
        config = MapStructConfig.class,
        uses = {CommonMappers.class})
public interface CdrVersionMapper {
    CdrVersion dbModelToClient(DbCdrVersion db);

    default boolean isNonEmpty(String s) {
        return s != null && !s.isEmpty();
    }
}