import { environment } from "environments/environment";

const fitbitUpdateFlag = environment.fitbitCDRUpdate;

export const domainToRoute = {
  condition: "conditions",
  drug: "drug-exposures",
  measurement: "labs-and-measurements",
  procedure: "procedures",
};

export const surveyIdToRoute = {
  "1586134": "the-basics",
  "1585710": "overall-health",
  "1585855": "lifestyle",
  "43529712": "personal-medical-history",
  "43528895": "health-care-access-and-utilization",
  "43528698": "family-health-history",
  "1333342": "covid-19-participant-experience",
};

export const routeToDomain = {
  conditions: "condition",
  "drug-exposures": "drug",
  "labs-and-measurements": "measurement",
  procedures: "procedure",
};

export const genomicTileMetadata = {
  name: "SNVs/Indels",
  description:
    "View aggregate counts of participants with any genomic data, Whole Genomic Sequence (WGS) data, \
    or Array data in the All of Us dataset.",
  description2:
    "Define a genomic region to search; results show aggregated allele counts, \
                         allele frequency, and variant information in the All of Us dataset, based on WGS Data.",
  wgsSRParticipantCount: 0,
  wgsLRParticipantCount: 0,
  wgsSVParticipantCount: 0,
  microarrayParticipantCount: 0,
  domain: "Genomics",
};

export const PM_CONCEPTS = [
  "903118",
  "903115",
  "903133",
  "903121",
  "903135",
  "903136",
  "903126",
  "903111",
  "903120",
];

export const fitbitConcepts = [
  {
    id: 1,
    displayName: "any Fitbit data",
    conceptName: "Any Fitbit Data",
    icon: "faWatchFitness",
    tooltipKey: "fitbitAllDataHelpText",
  },
  {
    id: 2,
    displayName: "heart rate by zone summary",
    conceptName: "Heart Rate (Summary)",
    icon: "faHeartPulse",
    tooltipKey: "fitbitHeartZoneHelpText",
  },
  {
    id: 3,
    displayName: "heart rate (minute-level)",
    conceptName: "Heart rate (minute-level)",
    icon: "faMonitorWaveform",
    tooltipKey: "fitbitHeartRateHelpText",
  },
  {
    id: 4,
    displayName: "activity daily summary",
    conceptName: "Activity daily summary",
    icon: "faPersonRunning",
    tooltipKey: "fitbitActivityDailyHelpText",
  },
  {
    id: 5,
    displayName: "activity intraday steps (minute-level)",
    conceptName: "Activity intraday steps (minute-level)",
    icon: "faPersonWalking",
    tooltipKey: "fitbitActivityStepsHelpText",
  },
];

if (fitbitUpdateFlag) {
  fitbitConcepts.push({
    id: 6,
    displayName: "sleep daily summary",
    conceptName: "sleep daily summary",
    icon: "faBedPulse",
    tooltipKey: "sleepDailySummaryHelpText",
  });

  fitbitConcepts.push({
    id: 7,
    displayName: "sleep level (sequence by level)",
    conceptName: "Sleep Level (Sequence by level)",
    icon: "faBedPulse",
    tooltipKey: "sleepLevelHelpText",
  });
}

export const VARIANT_POPULATION_DETAILS = [
  {
    Ancestry: "African",
    AlleleCount: 0,
    AlleleNumber: 0,
    AlleleFrequency: 0,
    HomozygoteCount: 0,
    color: "#1F78B4",
  },
  {
    Ancestry: "East Asian",
    AlleleCount: 0,
    AlleleNumber: 0,
    AlleleFrequency: 0,
    HomozygoteCount: 0,
    color: "#A27BD7",
  },
  {
    Ancestry: "European",
    AlleleCount: 0,
    AlleleNumber: 0,
    AlleleFrequency: 0,
    HomozygoteCount: 0,
    color: "#F8C854",
  },
  {
    Ancestry: "Americas",
    AlleleCount: 0,
    AlleleNumber: 0,
    AlleleFrequency: 0,
    HomozygoteCount: 0,
    color: "#6CABE4",
  },
  {
    Ancestry: "Middle Eastern",
    AlleleCount: 0,
    AlleleNumber: 0,
    AlleleFrequency: 0,
    HomozygoteCount: 0,
    color: "#CB2D4C",
  },
  {
    Ancestry: "South Asian",
    AlleleCount: 0,
    AlleleNumber: 0,
    AlleleFrequency: 0,
    HomozygoteCount: 0,
    color: "#8BC990",
  },
  {
    Ancestry: "Remaining",
    AlleleCount: 0,
    AlleleNumber: 0,
    AlleleFrequency: 0,
    HomozygoteCount: 0,
    color: "#B2AEAD",
  },
  {
    Ancestry: "Total",
    AlleleCount: 0,
    AlleleNumber: 0,
    AlleleFrequency: 0,
    HomozygoteCount: 0,
  },
];

export const prepVariantPopulationDetails = (variantDetails) => {
  VARIANT_POPULATION_DETAILS[0].AlleleCount = variantDetails.afrAlleleCount;
  VARIANT_POPULATION_DETAILS[0].AlleleNumber = variantDetails.afrAlleleNumber;
  VARIANT_POPULATION_DETAILS[0].AlleleFrequency =
    variantDetails.afrAlleleFrequency;
  VARIANT_POPULATION_DETAILS[0].HomozygoteCount =
    variantDetails.afrHomozygoteCount;
  VARIANT_POPULATION_DETAILS[1].AlleleCount = variantDetails.easAlleleCount;
  VARIANT_POPULATION_DETAILS[1].AlleleNumber = variantDetails.easAlleleNumber;
  VARIANT_POPULATION_DETAILS[1].AlleleFrequency =
    variantDetails.easAlleleFrequency;
  VARIANT_POPULATION_DETAILS[1].HomozygoteCount =
    variantDetails.easHomozygoteCount;
  VARIANT_POPULATION_DETAILS[2].AlleleCount = variantDetails.eurAlleleCount;
  VARIANT_POPULATION_DETAILS[2].AlleleNumber = variantDetails.eurAlleleNumber;
  VARIANT_POPULATION_DETAILS[2].AlleleFrequency =
    variantDetails.eurAlleleFrequency;
  VARIANT_POPULATION_DETAILS[2].HomozygoteCount =
    variantDetails.eurHomozygoteCount;
  VARIANT_POPULATION_DETAILS[3].AlleleCount = variantDetails.amrAlleleCount;
  VARIANT_POPULATION_DETAILS[3].AlleleNumber = variantDetails.amrAlleleNumber;
  VARIANT_POPULATION_DETAILS[3].AlleleFrequency =
    variantDetails.amrAlleleFrequency;
  VARIANT_POPULATION_DETAILS[3].HomozygoteCount =
    variantDetails.amrHomozygoteCount;
  VARIANT_POPULATION_DETAILS[4].AlleleCount = variantDetails.midAlleleCount;
  VARIANT_POPULATION_DETAILS[4].AlleleNumber = variantDetails.midAlleleNumber;
  VARIANT_POPULATION_DETAILS[4].AlleleFrequency =
    variantDetails.midAlleleFrequency;
  VARIANT_POPULATION_DETAILS[4].HomozygoteCount =
    variantDetails.midHomozygoteCount;
  VARIANT_POPULATION_DETAILS[5].AlleleCount = variantDetails.sasAlleleCount;
  VARIANT_POPULATION_DETAILS[5].AlleleNumber = variantDetails.sasAlleleNumber;
  VARIANT_POPULATION_DETAILS[5].AlleleFrequency =
    variantDetails.sasAlleleFrequency;
  VARIANT_POPULATION_DETAILS[5].HomozygoteCount =
    variantDetails.sasHomozygoteCount;
  VARIANT_POPULATION_DETAILS[6].AlleleCount = variantDetails.othAlleleCount;
  VARIANT_POPULATION_DETAILS[6].AlleleNumber = variantDetails.othAlleleNumber;
  VARIANT_POPULATION_DETAILS[6].AlleleFrequency =
    variantDetails.othAlleleFrequency;
  VARIANT_POPULATION_DETAILS[6].HomozygoteCount =
    variantDetails.othHomozygoteCount;
  VARIANT_POPULATION_DETAILS[7].AlleleCount = variantDetails.totalAlleleCount;
  VARIANT_POPULATION_DETAILS[7].AlleleNumber = variantDetails.totalAlleleNumber;
  VARIANT_POPULATION_DETAILS[7].AlleleFrequency =
    variantDetails.totalAlleleFrequency;
  VARIANT_POPULATION_DETAILS[7].HomozygoteCount =
    variantDetails.totalHomozygoteCount;
  return VARIANT_POPULATION_DETAILS;
};
