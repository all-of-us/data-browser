package org.pmiops.workbench.cdr;

import org.mapstruct.Mapper;
import org.pmiops.workbench.model.MeasurementConceptInfo;
import org.pmiops.workbench.model.Concept;
import org.pmiops.workbench.cdr.model.DbMeasurementConceptInfo;
import org.pmiops.workbench.cdr.model.DbConcept;
import org.mapstruct.Mapping;
import org.pmiops.workbench.utils.mappers.CommonMappers;
import org.pmiops.workbench.utils.mappers.MapStructConfig;

@Mapper(
        config = MapStructConfig.class,
        uses = {CommonMappers.class})
public interface ConceptMapper {
    @Mapping(target = "conceptSynonyms", source="synonyms")
    @Mapping(target = "measurementConceptInfo", source="dbMeasurementConceptInfo")
    Concept dbModelToClient(DbConcept db);

    default boolean isNonEmpty(String s) {
        return s != null && !s.isEmpty();
    }
}