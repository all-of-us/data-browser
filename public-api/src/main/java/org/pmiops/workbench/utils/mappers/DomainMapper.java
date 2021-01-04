package org.pmiops.workbench.cdr;

import org.mapstruct.Mapper;
import org.pmiops.workbench.model.SurveyModule;
import org.pmiops.workbench.model.DomainInfo;
import org.pmiops.workbench.cdr.model.DbSurveyModule;
import org.pmiops.workbench.cdr.model.DbDomainInfo;
import org.mapstruct.Mapping;
import org.pmiops.workbench.utils.mappers.CommonMappers;
import org.pmiops.workbench.utils.mappers.MapStructConfig;

@Mapper(
        config = MapStructConfig.class,
        uses = {CommonMappers.class})
public interface DomainMapper {
    SurveyModule dbModelToClient(DbSurveyModule db);

    @Mapping(target = "domain", source="db.domainEnum")
    @Mapping(target = "domainConceptId", source="db.conceptId")
    DomainInfo dbModelToClient(DbDomainInfo db);

    default boolean isNonEmpty(String s) {
        return s != null && !s.isEmpty();
    }
}