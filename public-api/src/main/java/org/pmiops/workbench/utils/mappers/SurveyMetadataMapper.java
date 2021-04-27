package org.pmiops.workbench.cdr;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.pmiops.workbench.cdr.model.DbSurveyMetadata;
import org.pmiops.workbench.model.SurveyMetadata;
import org.pmiops.workbench.utils.mappers.CommonMappers;
import org.pmiops.workbench.utils.mappers.MapStructConfig;

@Mapper(
        config = MapStructConfig.class,
        uses = {CommonMappers.class})
public interface SurveyMetadataMapper {
    @Mapping(target = "conceptId", source = "db.dbSurveyMetadataId.conceptId")
    @Mapping(target = "surveyConceptId", source = "db.dbSurveyMetadataId.surveyConceptId")
    @Mapping(target = "path", source = "db.dbSurveyMetadataId.path")
    @Mapping(target = "countAnalysis.distResults", source="db.countAnalysis.achillesResultDistList")
    @Mapping(target = "genderAnalysis.distResults", source="db.genderAnalysis.achillesResultDistList")
    @Mapping(target = "ageAnalysis.distResults", source="db.ageAnalysis.achillesResultDistList")
    @Mapping(target = "versionAnalysis.distResults", source="db.versionAnalysis.achillesResultDistList")
    @Mapping(target = "participantCountAnalysis.distResults", source="db.participantCountAnalysis.achillesResultDistList")
    SurveyMetadata dbModelToClient(DbSurveyMetadata db);

    default boolean isNonEmpty(String s) {
        return s != null && !s.isEmpty();
    }
}