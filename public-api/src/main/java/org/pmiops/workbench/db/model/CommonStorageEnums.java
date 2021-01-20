package org.pmiops.workbench.db.model;

import com.google.common.collect.BiMap;
import com.google.common.collect.ImmutableBiMap;
import org.pmiops.workbench.model.AnalysisId;
import org.pmiops.workbench.model.Domain;


public class CommonStorageEnums {

  private static final BiMap<Domain, Short> CLIENT_TO_STORAGE_DOMAIN =
      ImmutableBiMap.<Domain, Short>builder()
          .put(Domain.CONDITION, (short) 0)
          .put(Domain.DEATH, (short) 1)
          .put(Domain.DEVICE, (short) 2)
          .put(Domain.DRUG, (short) 3)
          .put(Domain.MEASUREMENT, (short) 4)
          .put(Domain.OBSERVATION, (short) 5)
          .put(Domain.PROCEDURE, (short) 6)
          .put(Domain.VISIT, (short) 7)
          .build();

  // A mapping from our Domain enum to OMOP domain ID values.
  private static final BiMap<Domain, String> DOMAIN_ID_MAP =
      ImmutableBiMap.<Domain, String>builder()
          .put(Domain.CONDITION, "Condition")
          .put(Domain.DEATH, "Death")
          .put(Domain.DEVICE, "Device")
          .put(Domain.DRUG, "Drug")
          .put(Domain.MEASUREMENT, "Measurement")
          .put(Domain.OBSERVATION, "Observation")
          .put(Domain.PROCEDURE, "Procedure")
          .put(Domain.VISIT, "Visit")
          .build();

  // A mapping from our Analysis Id enum to actual analysis ids in our data.
  private static final BiMap<AnalysisId, Long> ANALYSIS_ID_MAP =
          ImmutableBiMap.<AnalysisId, Long>builder()
                  .put(AnalysisId.PARTICIPANT_COUNT_ANALYSIS_ID, 1L)
                  .put(AnalysisId.COUNT_ANALYSIS_ID, 3000L)
                  .put(AnalysisId.SURVEY_GENDER_COUNT_ANALYSIS_ID, 3200L)
                  .put(AnalysisId.SURVEY_AGE_COUNT_ANALYSIS_ID, 3201L)
                  .put(AnalysisId.GENDER_ANALYSIS_ID, 3101L)
                  .put(AnalysisId.PARTICIPANT_COUNT_BY_DATE_ANALYSIS_ID, 3107L)
                  .put(AnalysisId.AGE_ANALYSIS_ID, 3102L)
                  .put(AnalysisId.SURVEY_VERSION_PARTICIPANT_COUNT_ANALYSIS_ID, 3400L)
                  .put(AnalysisId.SURVEY_VERSION_QUESTION_COUNT_ANALYSIS_ID, 3401L)
                  .put(AnalysisId.SURVEY_COUNT_ANALYSIS_ID, 3110L)
                  .put(AnalysisId.SURVEY_GENDER_ANALYSIS_ID, 3111L)
                  .put(AnalysisId.SURVEY_AGE_ANALYSIS_ID, 3112L)
                  .put(AnalysisId.SURVEY_VERSION_ANALYSIS_ID, 3113L)
                  .put(AnalysisId.SURVEY_QUESTION_GENDER_COUNT_ANALYSIS_ID, 3320L)
                  .put(AnalysisId.SURVEY_QUESTION_AGE_COUNT_ANALYSIS_ID, 3321L)
                  .put(AnalysisId.EHR_GENDER_COUNT_ANALYSIS_ID, 3300L)
                  .put(AnalysisId.EHR_GENDER_COUNT_ANALYSIS_ID, 3301L)
                  .put(AnalysisId.RACE_ANALYSIS_ID, 3103L)
                  .put(AnalysisId.ETHNICITY_ANALYSIS_ID, 3104L)
                  .put(AnalysisId.MEASUREMENT_DIST_ANALYSIS_ID, 1815L)
                  .put(AnalysisId.MEASUREMENT_GENDER_ANALYSIS_ID, 1900L)
                  .put(AnalysisId.MEASUREMENT_GENDER_UNIT_ANALYSIS_ID, 1910L)
                  .put(AnalysisId.RACE_ANALYSIS, 4L)
                  .put(AnalysisId.ETHNICITY_ANALYSIS, 5L)
                  .put(AnalysisId.GENDER_ANALYSIS, 2L)
                  .build();

  public static Domain domainFromStorage(Short domain) {
    return CLIENT_TO_STORAGE_DOMAIN.inverse().get(domain);
  }

  public static Short domainToStorage(Domain domain) {
    return CLIENT_TO_STORAGE_DOMAIN.get(domain);
  }

  public static String domainToDomainId(Domain domain) {
    return DOMAIN_ID_MAP.get(domain);
  }

  public static Long analysisIdFromName(AnalysisId analsyisId) {
    return ANALYSIS_ID_MAP.get(analsyisId);
  }

  public static Domain domainIdToDomain(String domainId) {
    return DOMAIN_ID_MAP.inverse().get(domainId);
  }

}
