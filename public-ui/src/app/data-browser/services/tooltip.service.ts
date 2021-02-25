import { Injectable } from '@angular/core';


export interface Tooltip {
  title: string;
  texts: Array<string>;
}

// Const for tooltip component
export const tooltips = {
  'Search Across Data Types': {
        texts: ['Conduct a search across all ', 'All of Us',
            `Research Program data types, including surveys, physical measurements taken at the time of participant enrollment
             (“program physical measurements”), and electronic health record (EHR) data. Search using common keywords and/or
             billing or data standards codes (i.e., SNOMED, CPT, ICD). `]
  },
  'raceEthnicityQuestionHelpText': {
        texts: [`Through "The Basics" program survey, participants self-report race and ethnicity information to the`,
                `Research Program. Each participant who answered this survey question is only counted once in the counts below. If
                 a participant selected more than one option, they are counted in the “more than one race/ethnicity” category.`,
                `To learn more about this question, please visit “The Basics” in the Survey Explorer under Data Sources`]
  },
  'conceptCodeHelpText': {
        texts: ['The concept code is an additional piece of information that\n' +
                        'can be utilized to find medical concepts in the ',
                 `All of Us`,
                 'data set. Concept codes are\n' +
                        'specific to the ',
                 `All of Us`,
                 'Research Program data and are assigned ' +
                        'to all medical concepts.\n' +
                        'In some instances, a medical concept may not be assigned ' +
                        'a source or standard vocabulary code.\n' +
                        'In these instances, the concept code can be utilized to\n' +
                        'query the data for the medical concept.']
  },
  'genderIdentityQuestionHelpText': {
    texts: [`Through “The Basics” survey, participants who have completed the initial steps of the program self-report gender
                  identity information to the `, `All of Us`,
            `Research Program. Because participants can select more than one option,
                  counts and percentages may not add up to 100%. To learn more about this question, please visit “The Basics” in the Survey Explorer under Data Sources`]
  },
  'matchingConceptsHelpText': {
            texts: ['Medical concepts are similar to medical terms; ' +
                            'they capture medical information\n' +
                            'in an individual’s records and may sometimes have values associated with them.\n' +
                            'For example, “height” is a medical concept that has a measurement value (in centimeters).\n' +
                            'These concepts are categorized into different domains. ' +
                            'Domains are types of medical information.\n' +
                            'The Data Browser searches the ', `All of Us`,
                  'public data for medical concepts that\n' +
                            'match the keyword or code entered in the search bar.\n' +
                            'The Data Browser counts how many participants have at least\n' +
                            'one mention of the matching medical concepts in their records.\n' +
                            'Matching medical concepts that have the highest participant counts ' +
                            'are returned at the top of the list.']
  },
  'ehrDomainHelpText' : 'Electronic health records contain information ' +
        'about an individual’s health.\n' +
        'Medical concepts are similar to medical terms;\n' +
        'they capture medical information in individual records and may sometimes ' +
        'have values associated with them.\n' +
        'For example, “height” is a medical concept that has a ' +
        'measurement value (in centimeters).\n' +
        'These concepts are categorized into different domains. ' +
        'Domains are types of medical information.\n' +
        'There are numerous domains of data in EHR records, ' +
        'but some of the most common domains include conditions, drug exposures,' +
        ' measurements, and procedures.',
  'physicalMeasurements' : `Measurements taken at the time of participant enrollment,
     including blood pressure, heart rate, height, weight, waist and hip circumference,
      pregnancy status, and wheelchair use.`,
  'surveyExplorerUrl' : 'https://www.researchallofus.org/data/data-sources/survey-explorer/',
  'fitbitTileHelpText' : `Optional measurements from participants' trackers and wristband. These are used to measure their heart rate and daily physical activity.`,
  'condition': 'Medical concepts that describe the ' +
          'health status of an individual, ' +
          'such as medical diagnoses, are found in the conditions domain.',
  'drug': 'Medical concepts that capture information regarding prescription ' +
          'and over-the-counter medicines, vaccines, and large-molecule biologic therapies. ' +
          'Drug exposures can be related to orders, prescriptions written, pharmacy dispensing,' +
          ' procedural administrations, and patient-reported information.',
  'measurement': 'Medical concepts that capture values resulting from ' +
          'examinations or tests are captured by the measurements domain. ' +
          'The measurements domain may include vital signs, lab values, ' +
          'quantitative findings from pathology reports, etc.',
  'procedure': 'Medical concepts that capture information related to activities or ' +
          'processes that are ordered or carried out on individuals for ' +
          'diagnostic or therapeutic purposes are captured by the procedures domain.',
  'the basics': `This survey asks basic demographic questions including
                 questions about a participant's work and home.`,
  'overall health': `This survey collects information about a participant’s overall health
                     including general health, daily activities, and women’s health topics.`,
  'lifestyle': `This survey asks questions about a participant’s use of tobacco, alcohol,
                     and recreational drugs.`,
  'personal medical history': `This survey collects information about past medical history,
                                   including medical conditions.`,
  'family health history': `This survey collects information about the medical history of
                                participants' immediate biological family members`,
  'health care access & utilization': `This survey asks questions about participants' access
                                           to and use of health care.`,
  'covid-19 participant experience (cope)': 'This survey includes information about the impact of COVID-19 on participant mental and physical health.',
  'pmValueChartHelpText' : 'Values provide the numeric result of the ' +
         'physical measurements taken at the time of participant enrollment. ' +
         'Unit of measurement displayed has not been converted so each data ' +
         'point represents a unique participant.',
  'pmAgeChartHelpText' : 'The age bar chart displays a binned distribution of the ages at ' +
         'which the participants had the physical measurement taken.',
  'histogramUnitChartText': 'Toggle here to view unit specific histograms',
  'surveyBSChart': `The sex assigned to a child at birth, most often based on
                    the child’s external anatomy. Counts are the total sum of participants of the
                    sex assigned who selected this answer.`,
  'surveyAgeChartHelpText' : 'The age bar chart displays a binned distribution of the ' +
        'ages at which the participants took the indicated survey.',
  'versionChartHelpText' : 'Surveys were released to participants for completion at different ' +
        'time points during the COVID-19 pandemic and has multiple versions. Even though most of ' +
        'the content is consistent between versions, some questions were modified.',
  'valueChartHelpText' : 'Values provide the numeric result of an ' +
        'examination or test done on a participant. ' +
        'For example, a participant’s measurement of their body ' +
        'temperature might have a value of 96.8 degrees. ' +
        'Values can also be reported in different units, ' +
        'such as Fahrenheit or Celsius for body temperature.',
  'participantCountHelpText' : `The overall participant count listed in the header for this column
       includes all participants that have at least one medical concept from this domain in their
       electronic health record (EHR). Participants may have more than one medical concept from
       this domain in their records but they will only be counted once. The count returned for
       each medical concept result (each row) is a count of participants with at least one mention
       of the medical concept in their record. Participants may have more than one mention of a
       medical concept in their record but will only be counted once. All participant counts are
       approximate to protect participant privacy. Participant counts are rounded to the nearest
       multiple of 20. Participant counts of 0 - 20 are returned as ≤ 20.`,
  'vocabularyCodeHelpText' : `Individual health records often contain medical information that means
       the same thing but may be recorded in many different ways.
       Source concepts are the way the data was originally represented in a patient’s record.
       The vocabulary code listed here is a standard vocabulary code for the medical
       information. Standard codes are ways of representing data that is recorded many
       different ways in original patient records but essentially means the same thing.`,
      'surveyParticipantCountHelpText' : `Participants could select more than one answer.
      Total Counts may be greater than 100%.`,
      'rolledUpConceptsHelpText' : `Each concept in the hierarchy including the top level concept
       returns a count of unique participants with at least one mention of the medical concept in
        their records. As a result, within a hierarchy, participants may be counted for more than one
        medical concept in the hierarchy, but never more than once for the same concept. As a result,
         the sum total of counts for the descendants in the tree may be more than the count
         returned for the top level concept.`,
  'allOfUsHelpText' : `All of Us`,
  'q2RolledCategoriesHelpText' : `“Other” includes the following categories: Middle Eastern or North African,
      Native Hawaiian or other Pacific Islander, and None of these describe me.`,
  'fitbitAllDataHelpText' : `Summary of participant counts for Fitbit data available across all variables.`,
  'fitbitHeartZoneHelpText' : `Heart rate zones are personalized based on resting heart rate and age. Heart rate by zone summaries
      report the amount of time a participant spent in each heart rate zone.`,
  'fitbitHeartRateHelpText' : `Heart rate represented granularly at the minute level. Heart rate zones are the highest number of times your heart
      can safely beat in one minute.`,
  'fitbitActivityDailyHelpText' : `Activity data summarized as a daily report. Activity (daily summary) is a summary and list of a participant's
      activities and activity log entries for a given day.`,
  'fitbitActivityStepsHelpText' : `Activity data represented granularly at the minute level. Intraday steps are the total summary of a participant's
      daily calories and steps.`,
  'percentageOfParticipants': `The overall participant count of this medical concept divided by the total number of participants`,
  'valueFilter': `This code contains values. Search the medical concept keyword to see related Labs & Measurements results`,
  'orderFilter': `This code contains orders. Search the medical concept keyword to see related Labs & Measurements results.`,
  'conceptSynonyms': `Medical concepts often have alternative names and descriptions, known as synonyms. Alternate names and descriptions, if available, are listed for each medical concept.`,
  'Sex Assigned at Birth': `The sex assigned to a child at birth, most often based on the child’s external anatomy. \n Counts are the total sum of participants with the medical
                          concept mentioned in their electronic health record (EHR).`,
  'Gender Identity':   `Gender identity refers to one’s internal sense of gender (e.g. being a man, a woman, or genderqueer) that may
                            or may not correspond to a person’s \n`,
  'Race / Ethnicity': `“Race” refers to physical differences that groups and cultures
                                consider socially significant, while “ethnicity” refers to shared culture, such as language,
                                ancestry, practices, and beliefs. Although race and ethnicity have historically been asked
                                as separate questions, recent data from the Census Bureau determined that combining the
                                question leads to better understanding of the question as well as improving the accuracy of
                                resulting data on race and ethnicity. Participants are able to select more than one
                                race/ethnicity which can lead to the bar charts totaling more than 100%.`,
  'Age': `The age bar chart displays a binned distribution of the ages at which
                     medical concepts first occurred in participants' electronic health records. For example, if
                     a medical concept occurred in a participant’s record at age 25 and again at age 43, 45 and 47
                     the participant is included once in the bar chart at the age of first occurrence, age 25. \n Counts are the total sum of participants with the medical
                     concept mentioned in their electronic health record (EHR). \n`,
  'Sources': 'Individual health records often contain medical ' +
                         'information that means the same thing ' +
                         'but may be recorded in many different ways. \n' +
                         'The sources represent the many different ways that the standard medical concept ' +
                         'returned in the search results has been recorded in patient records. \n' +
                         'The sources bar chart provides the top 10 source concepts from the All of Us data.',
  'Values': 'Values provide the numeric result of an ' +
                        'examination or test done on a participant. ' +
                        'For example, a participant’s measurement of their body ' +
                        'temperature might have a value of 96.8 degrees. ' +
                        'Values can also be reported in different units, ' +
                        'such as Fahrenheit or Celsius for body temperature.',
};

export const getTooltip = (textKey) => {
    if (typeof tooltips[textKey] === 'string') {
            return [tooltips[textKey]];
    } else {
            return tooltips[textKey]['texts'];
    }
};

@Injectable({
  providedIn: 'root'
})

export class TooltipService {
  tooltips = {
'Search Across Data Types': {
        texts: ['Conduct a search across all ', 'All of Us',
            `Research Program data types, including surveys, physical measurements taken at the time of participant enrollment
             (“program physical measurements”), and electronic health record (EHR) data. Search using common keywords and/or
             billing or data standards codes (i.e., SNOMED, CPT, ICD). `]
  },
  'raceEthnicityQuestionHelpText': {
        texts: [`Through "The Basics" program survey, participants self-report race and ethnicity information to the`,
                `Research Program. Each participant who answered this survey question is only counted once in the counts below. If
                 a participant selected more than one option, they are counted in the “more than one race/ethnicity” category.`,
                `To learn more about this question, please visit “The Basics” in the Survey Explorer under Data Sources`]
  },
  'conceptCodeHelpText': {
        texts: ['The concept code is an additional piece of information that\n' +
                        'can be utilized to find medical concepts in the ',
                 `All of Us`,
                 'data set. Concept codes are\n' +
                        'specific to the ',
                 `All of Us`,
                 'Research Program data and are assigned ' +
                        'to all medical concepts.\n' +
                        'In some instances, a medical concept may not be assigned ' +
                        'a source or standard vocabulary code.\n' +
                        'In these instances, the concept code can be utilized to\n' +
                        'query the data for the medical concept.']
  },
    'genderIdentityQuestionHelpText': {
      texts: [`Through “The Basics” survey, participants who have completed the initial steps of the program self-report gender
                    identity information to the `, `All of Us`,
              `Research Program. Because participants can select more than one option,
                    counts and percentages may not add up to 100%. To learn more about this question, please visit “The Basics” in the Survey Explorer under Data Sources`]
    },
    'matchingConceptsHelpText': {
        texts: ['Medical concepts are similar to medical terms; ' +
                        'they capture medical information\n' +
                        'in an individual’s records and may sometimes have values associated with them.\n' +
                        'For example, “height” is a medical concept that has a measurement value (in centimeters).\n' +
                        'These concepts are categorized into different domains. ' +
                        'Domains are types of medical information.\n' +
                        'The Data Browser searches the ', `All of Us`,
              'public data for medical concepts that\n' +
                        'match the keyword or code entered in the search bar.\n' +
                        'The Data Browser counts how many participants have at least\n' +
                        'one mention of the matching medical concepts in their records.\n' +
                        'Matching medical concepts that have the highest participant counts ' +
                        'are returned at the top of the list.']
    },
  'ehrDomainHelpText' : 'Electronic health records contain information ' +
        'about an individual’s health.\n' +
        'Medical concepts are similar to medical terms;\n' +
        'they capture medical information in individual records and may sometimes ' +
        'have values associated with them.\n' +
        'For example, “height” is a medical concept that has a ' +
        'measurement value (in centimeters).\n' +
        'These concepts are categorized into different domains. ' +
        'Domains are types of medical information.\n' +
        'There are numerous domains of data in EHR records, ' +
        'but some of the most common domains include conditions, drug exposures,' +
        ' measurements, and procedures.',
  'physicalMeasurements' : `Measurements taken at the time of participant enrollment,
     including blood pressure, heart rate, height, weight, waist and hip circumference,
      pregnancy status, and wheelchair use.`,
  'fitbitTileHelpText' : `Optional measurements from participants' trackers and wristband. These are used to measure their heart rate and daily physical activity.`,
  'condition': 'Medical concepts that describe the ' +
          'health status of an individual, ' +
          'such as medical diagnoses, are found in the conditions domain.',
  'drug': 'Medical concepts that capture information regarding prescription ' +
          'and over-the-counter medicines, vaccines, and large-molecule biologic therapies. ' +
          'Drug exposures can be related to orders, prescriptions written, pharmacy dispensing,' +
          ' procedural administrations, and patient-reported information.',
  'measurement': 'Medical concepts that capture values resulting from ' +
          'examinations or tests are captured by the measurements domain. ' +
          'The measurements domain may include vital signs, lab values, ' +
          'quantitative findings from pathology reports, etc.',
  'procedure': 'Medical concepts that capture information related to activities or ' +
          'processes that are ordered or carried out on individuals for ' +
          'diagnostic or therapeutic purposes are captured by the procedures domain.',
  'the basics': `This survey asks basic demographic questions including
                        questions about a participant's work and home.`,
  'overall health': `This survey collects information about a participant’s overall health
                     including general health, daily activities, and women’s health topics.`,
  'lifestyle': `This survey asks questions about a participant’s use of tobacco, alcohol,
                     and recreational drugs.`,
  'personal medical history': `This survey collects information about past medical history,
                                   including medical conditions.`,
  'family health history': `This survey collects information about the medical history of
                                participants' immediate biological family members`,
  'health care access & utilization': `This survey asks questions about participants' access
                                           to and use of health care.`,
  'covid-19 participant experience (cope)': 'This survey includes information about the impact of COVID-19 on participant mental and physical health.',
  'pmValueChartHelpText' : 'Values provide the numeric result of the ' +
         'physical measurements taken at the time of participant enrollment. ' +
         'Unit of measurement displayed has not been converted so each data ' +
         'point represents a unique participant.',
  'pmAgeChartHelpText' : 'The age bar chart displays a binned distribution of the ages at ' +
         'which the participants had the physical measurement taken.',
  'histogramUnitChartText': 'Toggle here to view unit specific histograms',
  'surveyBSChart': `The sex assigned to a child at birth, most often based on
                   the child’s external anatomy. Counts are the total sum of participants of the
                   sex assigned who selected this answer.`,
  'surveyAgeChartHelpText' : 'The age bar chart displays a binned distribution of the ' +
        'ages at which the participants took the indicated survey.',
  'versionChartHelpText' : 'Surveys were released to participants for completion at different ' +
        'time points during the COVID-19 pandemic and has multiple versions. Even though most of ' +
        'the content is consistent between versions, some questions were modified.',
  'valueChartHelpText' : 'Values provide the numeric result of an ' +
        'examination or test done on a participant. ' +
        'For example, a participant’s measurement of their body ' +
        'temperature might have a value of 96.8 degrees. ' +
        'Values can also be reported in different units, ' +
        'such as Fahrenheit or Celsius for body temperature.',
  'participantCountHelpText' : `The overall participant count listed in the header for this column
       includes all participants that have at least one medical concept from this domain in their
       electronic health record (EHR). Participants may have more than one medical concept from
       this domain in their records but they will only be counted once. The count returned for
       each medical concept result (each row) is a count of participants with at least one mention
       of the medical concept in their record. Participants may have more than one mention of a
       medical concept in their record but will only be counted once. All participant counts are
       approximate to protect participant privacy. Participant counts are rounded to the nearest
       multiple of 20. Participant counts of 0 - 20 are returned as ≤ 20.`,
  'vocabularyCodeHelpText' : `Individual health records often contain medical information that means
       the same thing but may be recorded in many different ways.
       Source concepts are the way the data was originally represented in a patient’s record.
       The vocabulary code listed here is a standard vocabulary code for the medical
       information. Standard codes are ways of representing data that is recorded many
       different ways in original patient records but essentially means the same thing.`,
  'surveyParticipantCountHelpText' : `Participants could select more than one answer.
      Total Counts may be greater than 100%.`,
  'rolledUpConceptsHelpText' : `Each concept in the hierarchy including the top level concept
       returns a count of unique participants with at least one mention of the medical concept in
        their records. As a result, within a hierarchy, participants may be counted for more than one
        medical concept in the hierarchy, but never more than once for the same concept. As a result,
         the sum total of counts for the descendants in the tree may be more than the count
         returned for the top level concept.`,
  'allOfUsHelpText' : `All of Us`,
  'surveyExplorerUrl' : 'https://www.researchallofus.org/data/data-sources/survey-explorer/',
  'q2RolledCategoriesHelpText' : `“Other” includes the following categories: Middle Eastern or North African,
      Native Hawaiian or other Pacific Islander, and None of these describe me.`,
  'fitbitAllDataHelpText' : `Summary of participant counts for Fitbit data available across all variables.`,
  'fitbitHeartZoneHelpText' : `Heart rate zones are personalized based on resting heart rate and age. Heart rate by zone summaries
      report the amount of time a participant spent in each heart rate zone.`,
  'fitbitHeartRateHelpText' : `Heart rate represented granularly at the minute level. Heart rate zones are the highest number of times your heart
      can safely beat in one minute.`,
  'fitbitActivityDailyHelpText' : `Activity data summarized as a daily report. Activity (daily summary) is a summary and list of a participant's
      activities and activity log entries for a given day.`,
  'fitbitActivityStepsHelpText' : `Activity data represented granularly at the minute level. Intraday steps are the total summary of a participant's
      daily calories and steps.`,
  'percentageOfParticipants': `The overall participant count of this medical concept divided by the total number of participants`,
  'valueFilter': `This code contains values. Search the medical concept keyword to see related Labs & Measurements results`,
  'orderFilter': `This code contains orders. Search the medical concept keyword to see related Labs & Measurements results.`,
  'conceptSynonyms': `Medical concepts often have alternative names and descriptions, known as synonyms. Alternate names and descriptions, if available, are listed for each medical concept.`,
  'Sex Assigned at Birth': `The sex assigned to a child at birth, most often based on the child’s external anatomy. \n Counts are the total sum of participants with the medical
                            concept mentioned in their electronic health record (EHR).`,
  'Gender Identity':   `Gender identity refers to one’s internal sense of gender (e.g. being a man, a woman, or genderqueer) that may
                              or may not correspond to a person’s \n`,
  'Race / Ethnicity': `“Race” refers to physical differences that groups and cultures
                       consider socially significant, while “ethnicity” refers to shared culture, such as language,
                       ancestry, practices, and beliefs. Although race and ethnicity have historically been asked
                       as separate questions, recent data from the Census Bureau determined that combining the
                       question leads to better understanding of the question as well as improving the accuracy of
                       resulting data on race and ethnicity. Participants are able to select more than one
                       race/ethnicity which can lead to the bar charts totaling more than 100%.`,
  'Age': `The age bar chart displays a binned distribution of the ages at which
          medical concepts first occurred in participants' electronic health records. For example, if
          a medical concept occurred in a participant’s record at age 25 and again at age 43, 45 and 47
          the participant is included once in the bar chart at the age of first occurrence, age 25. \n Counts are the total sum of participants with the medical
          concept mentioned in their electronic health record (EHR). \n`,
  'Sources': `Individual health records often contain medical information that means the same thing
              but may be recorded in many different ways. The sources represent the many different ways that the standard medical concept
              returned in the search results has been recorded in patient records.
              The sources bar chart provides the top 10 source concepts from the All of Us data.`,
  'Values': `Values provide the numeric result of an examination or test done on a participant.
             For example, a participant’s measurement of their body
             temperature might have a value of 96.8 degrees.
             Values can also be reported in different units,
             such as Fahrenheit or Celsius for body temperature.`,
  };
  constructor() { }
}
