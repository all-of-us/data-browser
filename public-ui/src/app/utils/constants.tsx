export const domainToRoute = {
    'condition': 'conditions',
    'drug': 'drug-exposures',
    'measurement': 'labs-and-measurements',
    'procedure': 'procedures'
};

export const surveyIdToRoute = {
    '1586134': 'the-basics',
    '1585710': 'overall-health',
    '1585855': 'lifestyle',
    '43529712': 'personal-medical-history',
    '43528895': 'health-care-access-and-utilization',
    '43528698': 'family-health-history',
    '1333342': 'covid-19-participant-experience'
};

export const fitbitConcepts = [{
    id: 1, displayName: 'any Fitbit data',
    conceptName: 'Any Fitbit Data', icon: 'fa-watch-fitness',
    tooltipKey: 'fitbitAllDataHelpText'
},
{
    id: 2, displayName: 'heart rate by zone summary',
    conceptName: 'Heart Rate (Summary)', icon: 'fa-heartbeat',
    tooltipKey: 'fitbitHeartZoneHelpText'
},
{
    id: 3, displayName: 'heart rate (minute-level)',
    conceptName: 'Heart rate (minute-level)', icon: 'fa-monitor-heart-rate',
    tooltipKey: 'fitbitHeartRateHelpText'
},
{
    id: 4, displayName: 'activity (daily summary)',
    conceptName: 'Activity (daily summary)', icon: 'fa-running',
    tooltipKey: 'fitbitActivityDailyHelpText'
},
{
    id: 5, displayName: 'activity intraday steps (minute-level)',
    conceptName: 'Activity intraday steps (minute-level)', icon: 'fa-walking',
    tooltipKey: 'fitbitActivityStepsHelpText'
}];
