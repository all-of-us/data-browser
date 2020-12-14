package org.pmiops.workbench.cdr;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.pmiops.workbench.db.model.CdrVersion;
import org.pmiops.workbench.utils.mappers.CommonMappers;
import org.pmiops.workbench.utils.mappers.MapStructConfig;

@Mapper(
        config = MapStructConfig.class,
        uses = {CommonMappers.class})
public interface CdrVersionMapper {
    org.pmiops.workbench.model.CdrVersion dbModelToClient(CdrVersion db);

    default boolean isNonEmpty(String s) {
        return s != null && !s.isEmpty();
    }
}