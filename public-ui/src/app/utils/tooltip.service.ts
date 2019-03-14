import { Injectable } from '@angular/core';

@Injectable()
export class TooltipService {
  biologicalSexChartHelpText = 'Sex assigned at birth. ';
  genderIdentityChartHelpText = 'Gender identity refers to one’s internal sense of ' +
    'gender (e.g. being a man, a woman, or genderqueer) that may or may not correspond ' +
    'to a person’s sex assigned at birth or to a person’s secondary sex characteristics.';
  ageChartHelpText = 'The age at occurrence bar chart provides a binned age \n' +
    'distribution for participants at the time the medical concept ' +
    'being queried occurred in their records. \n' +
    'If an individual’s record contains more than one mention of a concept, \n' +
    'the age at occurrence is included for each mention. \n' +
    'As a result, a participant may be counted more ' +
    'than once in the distribution. ';
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
  constructor() { }

}
