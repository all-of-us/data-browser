package org.pmiops.workbench.cdr;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import static org.mapstruct.NullValuePropertyMappingStrategy.SET_TO_DEFAULT;
import org.mapstruct.CollectionMappingStrategy;
import org.pmiops.workbench.cdr.model.DbQuestionConcept;
import org.pmiops.workbench.model.QuestionConcept;
import org.pmiops.workbench.utils.mappers.CommonMappers;
import org.pmiops.workbench.utils.mappers.MapStructConfig;

@Mapper(
        config = MapStructConfig.class,
        uses = {CommonMappers.class})
public interface QuestionConceptMapper {
    @Mapping(target = "conceptId", source = "db.dbQuestionConceptId.conceptId")
    @Mapping(target = "conceptName", source = "db.conceptName")
    @Mapping(target = "conceptCode", source = "db.conceptCode")
    @Mapping(target = "surveyName", source = "db.surveyName")
    @Mapping(target = "surveyConceptId", source = "db.dbQuestionConceptId.surveyConceptId")
    @Mapping(target = "countValue", source = "db.countValue")
    @Mapping(target = "sub", source = "db.sub")
    @Mapping(target = "path", source = "db.dbQuestionConceptId.path")
    @Mapping(target = "isParentQuestion", source = "db.isParentQuestion")
    @Mapping(target = "questionOrderNumber", source = "db.questionOrderNumber")
    @Mapping(target = "questionString", source = "db.questionString")
    @Mapping(target = "countAnalysis", source = "db.countAnalysis")
    @Mapping(target = "genderAnalysis", source = "db.genderAnalysis")
    @Mapping(target = "ageAnalysis", source = "db.ageAnalysis")
    @Mapping(target = "versionAnalysis", source = "db.versionAnalysis")
    QuestionConcept dbModelToClient(DbQuestionConcept db);

    default boolean isNonEmpty(String s) {
        return s != null && !s.isEmpty();
    }
}