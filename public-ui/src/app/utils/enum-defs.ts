export enum GraphType {
  BiologicalSex = 'Sex Assigned at Birth',
  GenderIdentity = 'Gender Identity',
  RaceEthnicity = 'Race / Ethnicity',
  SurveyVersion = 'Survey Versions',
  Age = 'Age',
  AgeWhenSurveyWasTaken = 'Age When Survey Was Taken',
  Sources = 'Sources',
  Values = 'Values',
  None = ''
}

export enum Domain {
    OBSERVATION = 'OBSERVATION',
    PROCEDURE = 'PROCEDURE',
    DRUG = 'DRUG',
    CONDITION = 'CONDITION',
    MEASUREMENT = 'MEASUREMENT',
    DEVICE = 'DEVICE',
    DEATH = 'DEATH',
    VISIT = 'VISIT'
}

export enum DomainType {
  EHR = 'ehr',
  SURVEYS = 'surveys',
  PHYSICAL_MEASUREMENTS = 'physical measurements'
}

export enum StandardConceptFilter {
    ALLCONCEPTS = 'ALL_CONCEPTS',
    STANDARDCONCEPTS = 'STANDARD_CONCEPTS',
    NONSTANDARDCONCEPTS = 'NON_STANDARD_CONCEPTS',
    STANDARDORCODEIDMATCH = 'STANDARD_OR_CODE_ID_MATCH'
}


