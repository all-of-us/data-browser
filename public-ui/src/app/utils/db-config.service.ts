import { Injectable } from '@angular/core';
import { DataBrowserService } from 'publicGenerated/api/dataBrowser.service';
import { Analysis } from 'publicGenerated/model/analysis';
import { ConceptGroup } from './conceptGroup';
import { ConceptWithAnalysis } from './conceptWithAnalysis';


@Injectable()

export class DbConfigService {
  /* CONSTANTS */
  MALE_GENDER_ID = '8507';
  FEMALE_GENDER_ID = '8532';
  // OTHER_GENDER_ID = '8521';
  // Current data has 0 for other gender.
  OTHER_GENDER_ID = '0';
  INTERSEX_GENDER_ID = '1585848';
  NONE_GENDER_ID = '1585849';
  PREGNANCY_CONCEPT_ID = '903120';
  WHEEL_CHAIR_CONCEPT_ID = '903111';

  COUNT_ANALYSIS_ID = 3000;
  GENDER_ANALYSIS_ID = 3101;
  GENDER_IDENTITY_ANALYSIS_ID = 3107;
  RACE_ETHNICITY_ANALYSIS_ID = 3108;
  AGE_ANALYSIS_ID = 3102;
  SURVEY_COUNT_ANALYSIS_ID = 3110;
  SURVEY_GENDER_ANALYSIS_ID = 3111;
  SURVEY_GENDER_IDENTITY_ANALYSIS_ID = 3113;
  SURVEY_RACE_ETHNICITY_ANALYSIS_ID = 3114;
  SURVEY_AGE_ANALYSIS_ID = 3112;
  SURVEY_VERSION_ANALYSIS_ID = 3113;
  MEASUREMENT_AGE_ANALYSIS_ID = 3112;
  MEASUREMENT_VALUE_ANALYSIS_ID = 1900;
  ETHNICITY_ANALYSIS_ID = 3104;
  RACE_ANALYSIS_ID = 3103;
  GENDER_PERCENTAGE_ANALYSIS_ID = 3310;
  AGE_PERCENTAGE_ANALYSIS_ID = 3311;
  SURVEY_GENDER_PERCENTAGE_ANALYSIS_ID = 3331;
  SURVEY_AGE_PERCENTAGE_ANALYSIS_ID = 3332;
  PM_CONCEPTS = [903118, 903115, 903133, 903121, 903135, 903136, 903126, 903111, 903120];
  FITBIT_MEASUREMENTS = ['Any Fitbit Data', 'Heart Rate (Summary)', 'Heart rate (minute-level)', 'Activity (daily summary)', 'Activity intraday steps (minute-level)'];
  VALID_AGE_DECILES = ['2', '3', '4', '5', '6', '7', '8', '9'];

  GENDER_STRATUM_MAP = {
    '8507': 'Male',
    '8532': 'Female',
    '8521': 'Other',
    '0': 'Other',
    '8551': 'Unknown',
    '8570': 'Ambiguous',
    '1585849': 'None of these describe me',
    '1585848': 'Intersex',
  };

  AGE_STRATUM_MAP = {
    '2': '18-29',
    '3': '30-39',
    '4': '40-49',
    '5': '50-59',
    '6': '60-69',
    '7': '70-79',
    '8': '80-89',
    '9': '89+'
  };

  VERSION_STRATUM_MAP = {
    'January': '1',
    'February': '2',
    'March': '3',
    'April': '4',
    'May': '5',
    'June': '6',
    'July/August': '7',
    'September': '9',
    'October': '10',
    'November': '11',
    'December': '12'
  };

  UNIT_ORDER = {
    '903133': ['Inches', 'Centimeter'],
    '903118': ['Millimeter Mercury Column'],
    '903115': ['Millimeter Mercury Column'],
    '903121': ['Centimeter'],
    '903135': ['Kilogram'],
    '903136': ['Centimeter'],
    '903126': ['Centimeter']
  };

  /* Colors for chart */

  GENDER_COLORS = {
    '8507': '#8DC892',
    '8532': '#6CAEE3',
    '1585848': '#4259A5',
    '1585849': '#252660',
    '0': '#4259A5'
  };

  GENDER_IDENTITY_COLORS = {
    '1585839': '#8DC892',
    '1585840': '#6CAEE3',
    '903070': '#252660',
    '903096': '#252660',
    '903079': '#80C4EC',
    '1585841': '#216fb4',
    '1585842': '#80C4EC',
    '1585843': '#8DC892'
  };

  /* Age colors -- for now we just use one color pending design */
  AGE_COLOR = '#252660';

  /* Map for age decile to color */
  AGE_COLORS = {
    '1': '#252660',
    '2': '#4259A5',
    '3': '#6CAEE3',
    '4': '#80C4EC',
    '5': '#F8C75B',
    '6': '#8DC892',
    '7': '#F48673',
    '8': '#BF85F6',
    '9': '#BAE78A',
    '10': '#8299A5',
    '11': '#000000',
    '12': '#DDDDDD'
  };
  COLUMN_COLOR = '#2691D0';
  TOTAL_COLUMN_COLOR = '#262262';
  AXIS_LINE_COLOR = '#979797';

  GENDER_PM_COLOR = '#bee1ff';

  /* Chart Styles */
  CHART_TITLE_STYLE = {
    'color': '#262262', 'font-family': 'GothamBook', 'font-size': '22px', 'font-weight': 'normal'
  };
  DATA_LABEL_STYLE = {
    'color': '#f6f6f8', 'font-family': 'GothamBook', 'fontSize': '15px', 'padding': '10px',
    'font-weight': '300', 'textOutline': 'none',
  };
  GI_DATA_LABEL_STYLE = {
    'color': '#f6f6f8', 'font-family': 'GothamBook', 'font-size': '22px',
    'font-weight': '300', 'textOutline': 'none'
  };
  MULTIPLE_ANSWER_SURVEY_QUESTIONS = [43528428, 1585952, 1585806, 1585838];

  pmGroups: ConceptGroup[] = [];
  physicalMeasurementsFound: Number;
  genderAnalysis: Analysis;

  surveyRouteToIds = {'the-basics': 1586134,
  'lifestyle': 1585855,
  'overall-health': 1585710,
  'personal-medical-history': 43529712,
  'health-care-access-and-utilization': 43528895,
  'family-health-history': 43528698,
  'covid-19-participant-experience': 1333342};

  conceptIdNames = [
    { conceptId: 1585855, conceptName: 'Lifestyle' },
    { conceptId: 1585710, conceptName: 'Overall Health' },
    { conceptId: 1586134, conceptName: 'The Basics' },
    { conceptId: 43529712, conceptName: 'Personal Medical History' },
    { conceptId: 43528895, conceptName: 'Health Care Access and Utilization' },
    { conceptId: 43528698, conceptName: 'Family Health History' },
    { conceptId: 1333342, conceptName: 'COVID-19 Participant Experience' }
  ];

  // chart options
  lang = {
    noData: {
      style: {
        fontWeight: 'bold',
        fontSize: '15px',
        color: '#303030'
      }
    }
  };

  credits = {
    enabled: false
  };

  yAxis = {
    title: {
      text: null
    },
    min: 20,
    labels: {
      style: {
        fontSize: '12px',
      },
      formatter: function() {
        const label = this.axis.defaultLabelFormatter.call(this);
        // Change <= 20 count to display '<= 20'
        if (label <= 20) {
          return '&#8804; 20';
        }
        return label;
      },
      useHTML: true,
    },
    lineWidth: 1,
    lineColor: this.AXIS_LINE_COLOR,
    gridLineColor: 'transparent'
  };

  routeToDomain = {
    'conditions': 'condition',
    'drug-exposures': 'drug',
    'labs-and-measurements': 'measurement',
    'procedures': 'procedure'
  };
  domainToRoute = {
    'condition': 'conditions',
    'drug': 'drug-exposures',
    'measurement': 'labs-and-measurements',
    'procedure': 'procedures'
  };

  eightColors = [
    '#2F4B7C', '#F99059', '#496D91', '#E75955',
    '#6790A2', '#93003A', '#BFE1C6', '#C5254A'
  ];

  tenColors = [
    '#2F4B7C', '#FA9B58', '#44668D', '#BC1B48', '#769EA7',
    '#F06F57', '#5B829C', '#93003A', '#BFE1C6', '#DB4451'
  ];

  fourteenColors = [
    '#2F4B7C', '#FBA858', '#88AFAB', '#CB2D4C', '#3E5E88', '#F78858', '#719AA6', '#B11044', '#4D7294',
    '#EE6857', '#5E869E', '#93003A', '#93003A', '#DF4A53'
  ];

  eightteenColors = [
    '#2F4B7C', '#FA9659', '#BFE1C6', '#D2364F', '#AB0A42', '#6F98A0', '#3A5A86', '#93B8AC', '#FBAF57',
    '#527997', '#F57D58', '#46698F', '#EC6556', '#C02049', '#60889F', '#80A8AA', '#E14D53', '#93003A',
  ];

  twentyFiveColors = [
    '#00429D', '#93C4D2', '#6492C0', '#B61A49', '#E37B7E', '#FBAF57', '#73A2C6', '#FA9659', '#4771B2',
    '#DF6772', '#A5D5D8', '#3761AB', '#D0CCB6', '#D95367', '#DAB8A7', '#D3F4E0', '#E38F8B', '#2451A4',
    '#5681B9', '#A60841', '#BFE1C6', '#C42D52', '#82B3CD', '#F57D58', '#93003A'
  ];


  constructor(private api: DataBrowserService) {
    window['dataLayer'] = window['dataLayer'] || {};
    let chartType = 'histogram';
    let group = new ConceptGroup('blood-pressure', 'Mean Blood Pressure');
    group.concepts.push(new ConceptWithAnalysis('903118', 'Systolic', chartType));
    group.concepts.push(new ConceptWithAnalysis('903115', 'Diastolic', chartType));
    this.pmGroups.push(group);

    group = new ConceptGroup('height', 'Height');
    group.concepts.push(new ConceptWithAnalysis('903133', group.groupName, chartType));
    this.pmGroups.push(group);

    group = new ConceptGroup('weight', 'Weight');
    group.concepts.push(new ConceptWithAnalysis('903121', group.groupName, chartType));
    this.pmGroups.push(group);

    group = new ConceptGroup('mean-waist', 'Mean waist circumference');
    group.concepts.push(new ConceptWithAnalysis('903135', group.groupName, chartType));
    this.pmGroups.push(group);

    group = new ConceptGroup('mean-hip', 'Mean hip circumference');
    group.concepts.push(new ConceptWithAnalysis('903136', group.groupName, chartType));
    this.pmGroups.push(group);

    group = new ConceptGroup('mean-heart-rate', 'Mean heart rate');
    group.concepts.push(new ConceptWithAnalysis('903126', group.groupName, chartType));
    this.pmGroups.push(group);

    chartType = 'column';

    group = new ConceptGroup('wheel-chair', 'Wheel chair use');
    group.concepts.push(new ConceptWithAnalysis('903111', group.groupName, chartType));
    this.pmGroups.push(group);

    group = new ConceptGroup('pregnancy', 'Pregnancy');
    group.concepts.push(new ConceptWithAnalysis('903120', group.groupName, chartType));
    this.pmGroups.push(group);

  }

  getGenderAnalysisResults() {
    // Load up common simple data needed on pages
    // Get Demographic totals
    this.api.getGenderAnalysis().subscribe(result => {
      this.genderAnalysis = result;
    });
  }

  public triggerEvent(eventName: string, eventCategory: string, eventAction: string,
    eventLabel: string, searchTerm: string, tooltipAction: string) {
    window['dataLayer'].push({
      'event': eventName,
      'category': 'Data Browser ' + eventCategory,
      'action': eventAction,
      'label': eventLabel,
      'landingSearchTerm': searchTerm,
      'tooltipsHoverAction': tooltipAction
    });
  }

  public matchPhysicalMeasurements(searchString: string) {
    if (!this.pmGroups || this.pmGroups.length === 0) {
      return 0;
    } else if (!searchString) {
      return this.pmGroups.length;
    }
    return this.pmGroups.filter(conceptgroup =>
      conceptgroup.groupName.toLowerCase().includes(searchString.toLowerCase())).length;
  }

  public matchFitbitMeasurements(searchString: string) {
    return this.FITBIT_MEASUREMENTS.filter(name => name.toLowerCase().includes(
      searchString.toLowerCase())).length;
  }
}

