package org.pmiops.workbench.cdr;

import org.mapstruct.Mapper;
import org.pmiops.workbench.cdr.model.DbChelH3Cell;
import org.pmiops.workbench.cdr.model.DbChelMetric;
import org.pmiops.workbench.model.ChelH3Cell;
import org.pmiops.workbench.model.ChelMetric;
import org.pmiops.workbench.utils.mappers.CommonMappers;
import org.pmiops.workbench.utils.mappers.MapStructConfig;

/**
 * Field names on the swagger models deliberately match the entity property names one-for-one,
 * so no @Mapping overrides are needed under MapStructConfig's unmappedTargetPolicy = ERROR.
 */
@Mapper(
        config = MapStructConfig.class,
        uses = {CommonMappers.class})
public interface ChelMapper {

    ChelH3Cell dbModelToClient(DbChelH3Cell db);

    ChelMetric dbModelToClient(DbChelMetric db);
}