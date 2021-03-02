package org.pmiops.workbench.cdr;

import org.mapstruct.Mapper;
import org.pmiops.workbench.model.Criteria;
import org.pmiops.workbench.cdr.model.DbCriteria;
import org.pmiops.workbench.utils.mappers.CommonMappers;
import org.pmiops.workbench.utils.mappers.MapStructConfig;

@Mapper(
        config = MapStructConfig.class,
        uses = {CommonMappers.class})
public interface CriteriaMapper {
    Criteria dbModelToClient(DbCriteria db);
}