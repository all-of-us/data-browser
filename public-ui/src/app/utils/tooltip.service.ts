import { Injectable } from '@angular/core';

@Injectable()
export class TooltipService {
  biologicalSexChartHelpText = 'Sex assigned at birth';
  genderIdentityChartHelpText = 'Gender identity refers to one’s internal \n' +
    'sense of gender (e.g. being a man, a woman, or genderqueer) that may \n' +
    'or may not correspond to a person’s \n' +
    'sex assigned at birth or to a person’s secondary sex characteristics.';
  ehrAgeChartHelpText = `The age bar chart displays a binned distribution
   of the ages at which medical concepts first occurred in participants
    electronic health records. For example, if a medical concept occurred
   in a participant’s record at age 25 and again at age 43, 45 and 47 the participant is
    included once in the bar chart at the age of first occurrence, age 25.`;
  surveyAgeChartHelpText = 'The age bar chart displays a binned distribution of the ' +
    'ages at which the participants took the indicated survey.';
  pmAgeChartHelpText = 'The age bar chart displays a binned distribution of the ages at ' +
    'which the participants had the physical measurement taken.';
  raceEthnicityChartHelpText =`Race / ethnicity are categories that describe groups to which
   individuals identify with or belong in the eyes of the community`;
  sourcesChartHelpText = 'Individual health records often contain medical ' +
    'information that means the same thing ' +
    'but may be recorded in many different ways. \n' +
    'The sources represent the many different ways that the standard medical concept ' +
    'returned in the search results has been recorded in patient records. \n' +
    'The sources bar chart provides the top 10 source concepts from the All of Us data.';
  matchingConceptsHelpText = 'Medical concepts are similar to medical terms; ' +
    'they capture medical information\n' +
    'in an individual’s records and may sometimes have values associated with them.\n' +
    'For example, “height” is a medical concept that has a measurement value (in centimeters).\n' +
    'These concepts are categorized into different domains. ' +
    'Domains are types of medical information.\n' +
    'The Data Browser searches the All of Us public data for medical concepts that\n' +
    'match the keyword or code entered in the search bar.\n' +
    'The Data Browser counts how many participants have at least\n' +
    'one mention of the matching medical concepts in their records.\n' +
    'Matching medical concepts that have the highest participant counts ' +
    'are returned at the top of the list.';
  theBasicsSurvey = `This survey asks basic demographic questions including
     questions about a participant's work and home.`;
  overallHealthSurvey = `This survey collects information about a participant’s overall health
      including general health, daily activities, and women’s health topics.`;
  lifestyleSurvey = `This survey asks questions about a participant’s use of tobacco, alcohol,
   and recreational drugs.`;
  physicalMeasurements = `Measurements taken at the time of participant enrollment,
 including blood pressure, heart rate, height, weight, waist and hip circumference,
  pregnancy status and wheelchair use.`;
  domainHelpText = {
    'condition': 'Medical concepts that describe the ' +
    'health status of an individual, ' +
    'such as medical diagnoses, are found in the conditions domain.',
    'drug': 'Medical concepts that capture information about the utilization of a ' +
    'drug when ingested or otherwise introduced into ' +
    'the body are captured by the drug exposures domain.',
    'measurement': 'Medical concepts that capture values resulting from ' +
    'examinations or tests are captured by the measurements domain. ' +
    'The measurements domain may include vital signs, lab values, ' +
    'quantitative findings from pathology reports, etc.',
    'procedure': 'Medical concepts that capture information related to activities or ' +
    'processes that are ordered or carried out on individuals for ' +
    'diagnostic or therapeutic purposes are captured by the procedures domain.',
    'the basics' : this.theBasicsSurvey,
    'overall health' : this.overallHealthSurvey,
    'lifestyle' : this.lifestyleSurvey};
  conceptCodeHelpText = 'The concept code is an additional piece of information that\n' +
    'can be utilized to find medical concepts in the All of Us data set. Concept codes are\n' +
    'specific to the All of Us Research Program data and are assigned ' +
    'to all medical concepts.\n' +
    'In some instances, a medical concept may not be assigned ' +
    'a source or standard vocabulary code.\n' +
    'In these instances, the concept code can be utilized to\n' +
    'query the data for the medical concept.';
  ehrDomainHelpText = 'Electronic health records contain information ' +
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
    ' measurements and procedures.';
  valueChartHelpText = 'Values provide the numeric result of an ' +
    'examination or test done on a participant. ' +
    'For example, a participant’s measurement of their body ' +
    'temperature might have a value of 96.8 degrees. ' +
    'Values can also be reported in different units, ' +
    'such as Fahrenheit or Celsius for body temperature.';
  constructor() { }

}
