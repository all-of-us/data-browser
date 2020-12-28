package org.pmiops.workbench.cdr;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.pmiops.workbench.cdr.model.DbQuestionConcept;
import org.pmiops.workbench.model.QuestionConcept;
import org.pmiops.workbench.utils.mappers.CommonMappers;
import org.pmiops.workbench.utils.mappers.MapStructConfig;

@Mapper(
        config = MapStructConfig.class,
        uses = {CommonMappers.class})
public interface QuestionConceptMapper {
    @Mapping(target = "conceptId", source = "db.dbQuestionConceptId.conceptId")
    @Mapping(target = "surveyConceptId", source = "db.dbQuestionConceptId.surveyConceptId")
    @Mapping(target = "path", source = "db.dbQuestionConceptId.path")
    @Mapping(target = "countAnalysis.distResults", source="db.countAnalysis.achillesResultDistList")
    @Mapping(target = "genderAnalysis.distResults", source="db.genderAnalysis.achillesResultDistList")
    @Mapping(target = "ageAnalysis.distResults", source="db.ageAnalysis.achillesResultDistList")
    @Mapping(target = "versionAnalysis.distResults", source="db.versionAnalysis.achillesResultDistList")
    QuestionConcept dbModelToClient(DbQuestionConcept db);

    default boolean isNonEmpty(String s) {
        return s != null && !s.isEmpty();
    }
}