import {capitalize} from '@angular-devkit/core/src/utils/strings';
import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import * as highcharts from 'highcharts';

import { Analysis } from '../../../publicGenerated/model/analysis';
import { Concept } from '../../../publicGenerated/model/concept';
import { SurveyQuestionAnalysis } from '../../../publicGenerated/model/surveyQuestionAnalysis';
import { DbConfigService } from '../../utils/db-config.service';
import { DomainType } from '../../utils/enum-defs';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnChanges, AfterViewInit {
  @Input() analysis: Analysis;
  @Input() analysis2: Analysis;
  @Input() surveyAnalysis: SurveyQuestionAnalysis;
  @Input() concepts: Concept[] = []; // Can put in analysis or concepts to chart. Don't put both
  @Input() selectedResult: any; // For ppi question, this is selected answer.
  @Input() pointWidth = 15;   // Optional width of bar or point or box plot
  @Input() backgroundColor = 'transparent'; // Optional background color
  @Input() chartTitle: string;
  @Input() conceptId: string;
  @Input() chartType: string;
  @Input() sources = false;
  @Input() genderId: string; // Hack until measurement design of graphs gender overlay
  @Input() domainType: DomainType;
  @Input() participantCount = 0;
  @Output() resultClicked = new EventEmitter<any>();
  @Input() domainCountAnalysis: any;
  @Input() conceptName: string;
  @Input() test: string;
  chartOptions: any = null;
  constructor(private dbc: DbConfigService) {
    highcharts.setOptions({
      lang: { thousandsSep: ',' },
    });
  }
  // Render new chart on changes
  ngOnChanges() {
    if ((this.analysis && this.analysis.results && this.analysis.results.length) ||
      (this.concepts && this.concepts.length) ||
      (this.surveyAnalysis && this.surveyAnalysis.surveyQuestionResults &&
        this.surveyAnalysis.surveyQuestionResults.length)) {
      // HC automatically redraws when changing chart options
      this.chartOptions = this.hcChartOptions();
    }
  }
  // renderChart after 1ms to fill container
  ngAfterViewInit() {
    setTimeout(() => {
      if (this.chartOptions) {
        this.chartOptions = this.hcChartOptions();
      }
    }, 1);
  }

  public isGenderIdentityAnalysis() {
    return this.analysis ?
      (this.analysis.analysisId === this.dbc.GENDER_IDENTITY_ANALYSIS_ID ||
        this.analysis.analysisId === this.dbc.SURVEY_GENDER_IDENTITY_ANALYSIS_ID)
      : false;
  }

  public hcChartOptions(): any {
    const options = this.makeChartOptions();
    // Override title if they passed one
    if (this.chartTitle) {
      options.title.text = this.chartTitle;
    }
    return {
      chart: options.chart,
      lang: this.dbc.lang,
      credits: this.dbc.credits,
      title: '',
      subtitle: {},
      tooltip: {
        followPointer: true,
        outside: true,
        formatter: function(tooltip) {
          if (this.point.y <= 20 && this.point.toolTipHelpText.indexOf('% of') === -1) {
            return this.point.toolTipHelpText + '<b> &le; ' + this.point.y + '</b>';
          } else if (this.point.toolTipHelpText.indexOf('% of') >= 0) {
            if (this.point.actualCount <= 20) {
              return this.point.toolTipHelpText + '<b> &le; ' + this.point.actualCount + '</b>';
            } else {
              return this.point.toolTipHelpText + '<b>' + this.point.actualCount + '</b>';
            }
          }
          // If not <= 20, use the default formatter
          return this.point.toolTipHelpText;
        },
        useHTML: true,
        backgroundColor: '#f0f2f3',
        borderWidth: 0,
        shadow: false,
        enabled: true,
      },
      plotOptions: {
        series: {
          animation: {
            duration: 100,
          },
          pointWidth: options.pointWidth ? options.pointWidth : null,
          minPointLength: 3,
          events: {
          },
        },
        pie: {
          borderColor: null,
          slicedOffset: 4,
          size: '100%',
          dataLabels: {
            enabled: true,
            style: this.isGenderIdentityAnalysis()
              ? this.dbc.GI_DATA_LABEL_STYLE : this.dbc.DATA_LABEL_STYLE,
            distance: this.isGenderIdentityAnalysis() ? 3 : -50,
            formatter: function () {
              if (this.percentage < 1) {
                return this.point.name + ' ' + Number(this.percentage).toFixed(1) + '%';
              }
              return this.point.name + ' ' + Number(this.percentage).toFixed(0) + '%';
            }
          }
        },
        column: {
          shadow: false,
          borderColor: null,
          colorByPoint: true,
          groupPadding: 0,
          pointPadding: 0,
          dataLabels: {
            enabled: false,
          },
          events: {},
        },
        bar: {
          shadow: false,
          borderColor: null,
          colorByPoint: true,
          groupPadding: 0,
          pointPadding: 0,
          dataLabels: {
            enabled: false,
          },
          events: {}
        }
      },
      yAxis: {
        title: {
          text: options.yAxisTitle ? options.yAxisTitle : null,
          style: {
            fontWeight: 'bold',
            textTransform: 'capitalize',
          }
        },
        min: ((this.analysis &&
          (this.analysis.analysisId === this.dbc.GENDER_PERCENTAGE_ANALYSIS_ID ||
        this.analysis.analysisId === this.dbc.AGE_PERCENTAGE_ANALYSIS_ID)) ||
          (this.surveyAnalysis &&
            (this.surveyAnalysis.analysisId === this.dbc.SURVEY_GENDER_PERCENTAGE_ANALYSIS_ID ||
          this.surveyAnalysis.analysisId === this.dbc.SURVEY_AGE_PERCENTAGE_ANALYSIS_ID))) ? 0 : 20,
        labels: ((this.analysis &&
          (this.analysis.analysisId === this.dbc.GENDER_PERCENTAGE_ANALYSIS_ID ||
          this.analysis.analysisId === this.dbc.AGE_PERCENTAGE_ANALYSIS_ID)) ||
          (this.surveyAnalysis &&
            (this.surveyAnalysis.analysisId === this.dbc.SURVEY_GENDER_PERCENTAGE_ANALYSIS_ID ||
            this.surveyAnalysis.analysisId === this.dbc.SURVEY_AGE_PERCENTAGE_ANALYSIS_ID))) ? {
          style: {
            fontSize: '12px',
          },
          formatter: function () {
            const label = this.axis.defaultLabelFormatter.call(this);
            return label;
          },
          useHTML: true,
        } : {
          style: {
            fontSize: '12px',
          },
          formatter: function () {
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
        lineColor: this.dbc.AXIS_LINE_COLOR,
        gridLineColor: this.backgroundColor
      },
      xAxis: {
        title: {
          text: options.xAxisTitle ? options.xAxisTitle : null,
          style: {
            fontWeight: 'bold',
            textTransform: 'capitalize',
          }
        },
        categories: options.categories,
        // type: 'category',
        labels: {
          reserveSpace: true,
          style: {
            whiteSpace: 'wrap',
          },
        },
        lineWidth: 1,
        lineColor: this.dbc.AXIS_LINE_COLOR,
        tickLength: 0
      },
      zAxis: {},
      legend: {
        enabled: false
      },
      series: options.series,
    };
  }

  public makeChartOptions() {
    if (this.concepts.length > 0) {
      return this.makeConceptChartOptions();
    }
    if (this.analysis && this.analysis.analysisId === this.dbc.COUNT_ANALYSIS_ID) {
      return this.makeCountChartOptions(this.analysis.results, this.analysis.analysisName);
    }
    if (this.surveyAnalysis &&
      this.surveyAnalysis.analysisId === this.dbc.SURVEY_COUNT_ANALYSIS_ID) {
      return this.makeCountChartOptions(this.surveyAnalysis.surveyQuestionResults,
        this.surveyAnalysis.analysisName);
    }
    if (this.analysis &&
      this.analysis.analysisId === this.dbc.GENDER_ANALYSIS_ID) {
      return this.makeGenderChartOptions(this.analysis.results,
        'Sex Assigned at Birth', 'Sex Assigned at Birth', 'column');
    }
    if (this.surveyAnalysis &&
      (this.surveyAnalysis.analysisId === this.dbc.SURVEY_GENDER_ANALYSIS_ID ||
        this.surveyAnalysis.analysisId === this.dbc.SURVEY_GENDER_PERCENTAGE_ANALYSIS_ID)) {
      return this.makeGenderChartOptions(
        this.surveyAnalysis.surveyQuestionResults.filter(
          r => r.stratum4 === this.selectedResult.stratum4),
        this.surveyAnalysis.analysisName, this.selectedResult.stratum4, 'column');
    }
    if (this.analysis &&
      this.analysis.analysisId === this.dbc.GENDER_IDENTITY_ANALYSIS_ID) {
      return this.makeGenderChartOptions(this.analysis.results,
        this.analysis.analysisName, this.analysis.analysisName, 'bar');
    }
    if (this.surveyAnalysis &&
      this.surveyAnalysis.analysisId === this.dbc.SURVEY_GENDER_IDENTITY_ANALYSIS_ID) {
      return this.makeGenderChartOptions(
        this.surveyAnalysis.surveyQuestionResults.filter(
          r => r.stratum4 === this.selectedResult.stratum4),
        this.surveyAnalysis.analysisName, this.selectedResult.stratum4, 'bar');
    }
    if (this.analysis && this.analysis.analysisId === this.dbc.RACE_ETHNICITY_ANALYSIS_ID) {
      return this.makeRaceEthnicityChartOptions(this.analysis.results,
        this.analysis.analysisName, this.analysis.analysisName);
    }
    if (this.surveyAnalysis &&
      this.surveyAnalysis.analysisId === this.dbc.SURVEY_RACE_ETHNICITY_ANALYSIS_ID) {
      return this.makeRaceEthnicityChartOptions(
        this.surveyAnalysis.surveyQuestionResults.filter(
          r => r.stratum4 === this.selectedResult.stratum4),
        this.selectedResult.stratum4,
        this.surveyAnalysis.analysisName);
    }
    /* Todo make charts for ethniticy and race
     * maybe cleanup / generalize pie chart
    if (
      this.analysis.analysisId === this.dbc.ETHNICITY_ANALYSIS_ID ||
      this.analysis.analysisId === this.dbc.RACE_ANALYSIS_ID) {
      return this.makePieChartOptions();
    }*/
    if (this.analysis && this.analysis.analysisId === this.dbc.AGE_ANALYSIS_ID) {
      return this.makeAgeChartOptions(
        this.analysis.results, 'Age at First Occurrence in Participant Record',
        this.analysis.analysisName,
        'stratum2', this.analysis.analysisId);
    }
    if (this.surveyAnalysis &&
      (this.surveyAnalysis.analysisId === this.dbc.SURVEY_AGE_ANALYSIS_ID ||
        this.surveyAnalysis.analysisId === this.dbc.SURVEY_AGE_PERCENTAGE_ANALYSIS_ID)) {
      return this.makeAgeChartOptions(
        this.surveyAnalysis.surveyQuestionResults.filter(
          r => r.stratum4 === this.selectedResult.stratum4),
        'Age When Survey Was Taken',
        this.selectedResult.stratum4, 'stratum5', this.surveyAnalysis.analysisId);
    }
    if (this.analysis &&
      this.analysis.analysisId === this.dbc.MEASUREMENT_VALUE_ANALYSIS_ID) {
      if (this.isPregnancyOrWheelChair()) {
        return this.makeStackedChartOptions(this.analysis.analysisName);
      }
      return this.makeMeasurementChartOptions();
    }
    if (this.analysis &&
    this.analysis.analysisId === this.dbc.GENDER_PERCENTAGE_ANALYSIS_ID) {
      return this.makeGenderChartOptions(this.analysis.results,
        'Sex Assigned at Birth', 'Sex Assigned at Birth', 'column');
    }
    if (this.analysis && this.analysis.analysisId === this.dbc.AGE_PERCENTAGE_ANALYSIS_ID) {
      return this.makeAgeChartOptions(
        this.analysis.results, 'Age at First Occurrence in Participant Record',
        this.analysis.analysisName,
        'stratum2', this.analysis.analysisId);
    }
    console.log('Error: Can not make chart options for this analysis. :', this.analysis);
  }
  seriesClick(event) {
    // Todo handle click and log events in analytics
    // console.log('Global series clicked ', this.analysis, 'Clicked analysis', event.point);
  }

  public makeCountChartOptions(results: any, analysisName: string) {
    let data = [];
    let cats = [];
    for (const a of results) {
      data.push({ name: a.stratum4, y: a.countValue, thisCtrl: this, result: a, toolTipHelpText:
        '<b>' + a.analysisStratumName + '</b>'});
      cats.push(a.stratum4);
    }
    data = data.sort((a, b) => {
        if (a.name > b.name) {
          return 1;
        }
        if (a.name < b.name) {
          return -1;
        }
        return 0;
      }
    );
    cats = cats.sort((a, b) => {
      if (a > b) {
        return 1;
      }
      if (a < b) {
        return -1;
      }
      return 0;
    });
    const seriesClick = event => {
      const thisCtrl = event.point.options.thisCtrl;
      // Todo handle click and log events in analytics
      // console.log('Count plot Clicked point :', event.point);
      thisCtrl.resultClicked.emit(event.point.result);
    };
    // Override tooltip and colors and such
    const series = {
      name: this.analysis.analysisName,
      colorByPoint: true,
      data: data,
      colors: [this.dbc.COLUMN_COLOR],
      events: {
        click: seriesClick
      }
    };
    return {
      chart: { type: 'column' },
      title: { text: null },
      series: [series],
      categories: cats,
      xAxis: {
        labels: {
          style: {
            align: 'right'
          }
        }
      },
      pointWidth: this.pointWidth,
      xAxisTitle: this.analysis.analysisName,
      yAxisTitle: null,
      tooltip: { pointFormat: '{point.y}' },
    };
  }

  public makeConceptChartOptions() {
    const data = [];
    const cats = [];
    // Sort by count value
    this.concepts = this.concepts.sort((a, b) => {
        if (this.sources) {
          if (a.sourceCountValue < b.sourceCountValue) {
            return 1;
          }
          if (a.sourceCountValue > b.sourceCountValue) {
            return -1;
          }
          return 0;
        } else {
          if (a.countValue < b.countValue) {
            return 1;
          }
          if (a.countValue > b.countValue) {
            return -1;
          }
          return 0;
        }
      }
    );
    for (const a of this.concepts) {
      let toolTipText = '';
      if (!this.sources) {
        if (a.countValue > 20 ) {
          toolTipText = a.conceptName + ' (' + a.vocabularyId + '-' + a.conceptCode + ') ' +
            '<br/>' + 'Pariticipant Count: ' + '<b>' + a.countValue + '</b>';
        } else {
          toolTipText = a.conceptName + ' (' + a.vocabularyId + '-' + a.conceptCode + ') ' +
            '<br/>' + 'Pariticipant Count: ';
        }
        data.push({
          name: a.conceptName + ' (' + a.vocabularyId + '-' + a.conceptCode + ') ',
          y: a.countValue,
          color: this.dbc.COLUMN_COLOR,
          toolTipHelpText: toolTipText
        });
        cats.push(a.conceptName);
      } else {
        if (a.sourceCountValue > 20 ) {
          toolTipText = a.conceptName + ' (' + a.vocabularyId + '-' + a.conceptCode + ') ' +
            '<br/>' + 'Pariticipant Count: ' + '<b>' + a.sourceCountValue + '</b>';
        } else {
          toolTipText = a.conceptName + ' (' + a.vocabularyId + '-' + a.conceptCode + ') ' +
            '<br/>' + 'Pariticipant Count: ';
        }
        data.push({
          name: a.conceptName + ' (' + a.vocabularyId + '-' + a.conceptCode + ') ',
          y: a.sourceCountValue,
          color: this.dbc.COLUMN_COLOR,
          toolTipHelpText: toolTipText
        });
        cats.push(a.vocabularyId + '-' + a.conceptCode);
      }
    }
    // Override tooltip and colors and such
    const series = {
      name: this.concepts[0].domainId, colorByPoint: true, data: data, colors: ['#6CAEE3'],
    };
    return {
      chart: {
        type: this.sources ? 'column' : 'bar',
        backgroundColor: this.backgroundColor,
        tooltip: {
          headerFormat: '<span>{point.key} <br/>',
          pointFormat: '{point.y}</span>'
        },
      },
      title: { text: null, style: this.dbc.CHART_TITLE_STYLE },
      series: [series],
      categories: cats,
      pointPadding: 0.25,
      minPointLength: 3,
      pointWidth: 20,
      xAxisTitle: this.sources ? 'Source Concepts' : 'Top concepts',
      yAxisTitle: 'Participant Count',
    };
  }

  public makeGenderChartOptions(results: any, analysisName: string,
                                seriesName: string, chartType: string) {
    let data = [];
    let cats = [];
    let yAxisLabel = null;
    // LOOP CREATES DYNAMIC CHART VARS
    for (const a of results) {
      // For normal Gender Analysis , the stratum2 is the gender . For ppi it is stratum5;
      let analysisStratumName = null;
      let toolTipHelpText = null;
      let color = null;
      if (this.analysis && this.analysis.analysisId === this.dbc.GENDER_ANALYSIS_ID) {
        color = this.dbc.COLUMN_COLOR;
        analysisStratumName = a.analysisStratumName;
        if (analysisStratumName === null) {
          analysisStratumName = this.dbc.GENDER_STRATUM_MAP[a.stratum2];
        }
        if (a.countValue <= 20) {
          toolTipHelpText = 'Sex Assigned at Birth: ' + '<b>' + analysisStratumName +
            '</b>' + '<br/> Participant Count: ';
        } else {
          toolTipHelpText = 'Sex Assigned at Birth: ' + '<b>' + analysisStratumName + '</b>' +
            '<br/> Participant Count: ' + '<b>' + a.countValue + '</b>';
        }
      }
      if (this.surveyAnalysis &&
        this.surveyAnalysis.analysisId === this.dbc.SURVEY_GENDER_ANALYSIS_ID) {
        color = this.dbc.COLUMN_COLOR;
        analysisStratumName = a.analysisStratumName;
        if (analysisStratumName === null) {
          analysisStratumName = this.dbc.GENDER_STRATUM_MAP[a.stratum5];
        }
        if (a.countValue > 20) {
          toolTipHelpText = 'Answer: ' + a.stratum4 + ' <br/> ' +
            'Sex Assigned at Birth: ' + '<b>' + analysisStratumName + '</b>' +
            '<br/> Participant Count: ' + '<b>' + a.countValue + '</b>';
        } else {
          toolTipHelpText = 'Answer: ' + a.stratum4 + ' <br/> ' +
            'Sex Assigned at Birth: ' + '<b>' + analysisStratumName + '</b>' +
            '<br/> Participant Count: ';
        }
      }
      if (this.surveyAnalysis &&
        this.surveyAnalysis.analysisId === this.dbc.SURVEY_GENDER_PERCENTAGE_ANALYSIS_ID) {
        yAxisLabel = '% of Each Biological Sex that answered with ' + this.selectedResult.stratum4;
        color = this.dbc.COLUMN_COLOR;
        analysisStratumName = a.analysisStratumName;
        if (analysisStratumName === null) {
          analysisStratumName = this.dbc.GENDER_STRATUM_MAP[a.stratum5];
        }
        if (a.percentage === null || a.percentage === 0) {
          toolTipHelpText = 'Answer: ' + a.stratum4 + ' <br/> ' +
            'Sex Assigned at Birth: ' + '<b>' + analysisStratumName + '</b>' +
            '<br/> % of Each Biological Sex that answered' + ': '
            + '<b>' + (a.percentage) + '% </b>' +
            '<br/> Participant Count: ';
        } else {
          toolTipHelpText = 'Answer: ' + a.stratum4 + ' <br/> ' +
            'Sex Assigned at Birth: ' + '<b>' + analysisStratumName + '</b>' +
            '<br/> % of Each Biological Sex that answered' + ': '
            + '<b>' + (a.percentage) + '% </b>' +
            '<br/> Participant Count: ';
        }
      }
      if (this.surveyAnalysis &&
        this.surveyAnalysis.analysisId === this.dbc.SURVEY_GENDER_IDENTITY_ANALYSIS_ID) {
        color = this.dbc.COLUMN_COLOR;
        analysisStratumName = a.analysisStratumName;
        if (analysisStratumName === null) {
          analysisStratumName = this.dbc.GENDER_STRATUM_MAP[a.stratum5];
        }
        toolTipHelpText = 'Answer: ' + a.stratum4 + ' <br/> ' +
          'Gender Identity: ' + '<b>' + analysisStratumName + '</b>';
      }
      if (this.analysis &&
        this.analysis.analysisId === this.dbc.GENDER_IDENTITY_ANALYSIS_ID) {
        color = this.dbc.COLUMN_COLOR;
        toolTipHelpText = 'Answer: ' + a.stratum4 + ' <br/> ' +
          'Gender Identity: ' + '<b>' + analysisStratumName + '</b>';
      }
      if (this.analysis &&
        this.analysis.analysisId === this.dbc.GENDER_PERCENTAGE_ANALYSIS_ID) {
        yAxisLabel = '% of Each Biological Sex with ' + this.conceptName;
        color = this.dbc.COLUMN_COLOR;
        analysisStratumName = a.analysisStratumName;
        if (analysisStratumName === null) {
          analysisStratumName = this.dbc.GENDER_STRATUM_MAP[a.stratum2];
        }
        if (a.stratum4 == null) {
          toolTipHelpText = 'Sex Assigned at Birth: ' + '<b>' + analysisStratumName +
            '</b>' + '<br/> % of Each Biological Sex with ' + this.conceptName +
            ': <b>' + 0 + '% </b>' +
            '<br/> Participant Count: ' ;
        } else {
          toolTipHelpText = 'Sex Assigned at Birth: ' + '<b>' + analysisStratumName +
            '</b>' + '<br/> % of Each Biological Sex with ' + this.conceptName +
            ': <b>' + (+a.stratum4) + '% </b>' +
            '<br/> Participant Count: ';
        }
      }
      if ((this.surveyAnalysis &&
          this.surveyAnalysis.analysisId === this.dbc.SURVEY_GENDER_PERCENTAGE_ANALYSIS_ID)) {
        data.push({
          name: a.analysisStratumName
          , y: +(a.percentage), color: color, sliced: true,
          toolTipHelpText: toolTipHelpText, actualCount: a.countValue,
        });
        cats.push(a.analysisStratumName);
      } else if (this.analysis &&
        this.analysis.analysisId === this.dbc.GENDER_PERCENTAGE_ANALYSIS_ID) {
        if (a.stratum4 === null) {
          data.push({
            name: a.analysisStratumName
            , y: 0, color: color, sliced: true,
            toolTipHelpText: toolTipHelpText, actualCount: a.countValue,
          });
        } else {
          data.push({
            name: a.analysisStratumName
            , y: +(a.stratum4), color: color, sliced: true,
            toolTipHelpText: toolTipHelpText, actualCount: a.countValue,
          });
        }
        cats.push(a.analysisStratumName);
      } else {
        data.push({
          name: a.analysisStratumName
          , y: a.countValue, color: color, sliced: true,
          toolTipHelpText: toolTipHelpText,
        });
        cats.push(a.analysisStratumName);
      }
    }
    data = data.sort((a, b) => {
        if (a.name > b.name) {
          return 1;
        }
        if (a.name < b.name) {
          return -1;
        }
        return 0;
      }
    );
    cats = cats.sort((a, b) => {
      if (a > b) {
        return 1;
      }
      if (a < b) {
        return -1;
      }
      return 0;
    });
    const series = {
      name: seriesName, colorByPoint: true, data: data,
    };
    return {
      chart: { type: 'column', backgroundColor: 'transparent' },
      title: { text: analysisName, style: this.dbc.CHART_TITLE_STYLE },
      series: [series],
      categories: cats,
      color: this.dbc.COLUMN_COLOR,
      pointWidth: this.pointWidth,
      xAxisTitle: analysisName,
      yAxisTitle: yAxisLabel !== null ? yAxisLabel : 'Participant Count',
      tooltip: {
        headerFormat: '<span> ',
        pointFormat: '{point.y} {point.name}</span>',
      }
    };
  }

  public makeRaceEthnicityChartOptions(
    results: any, seriesName: string, analysisName: string) {
    let data = [];
    let cats = [];
    // LOOP CREATES DYNAMIC CHART VARS
    for (const a of results) {
      data.push({
        name: a.analysisStratumName
        , y: a.countValue, sliced: true, color: this.dbc.COLUMN_COLOR,
        toolTipHelpText: '<b>' + a.analysisStratumName + '</b>',
      });
      cats.push(a.analysisStratumName);
    }
    data = data.sort((a, b) => {
        if (a.name > b.name) {
          return 1;
        }
        if (a.name < b.name) {
          return -1;
        }
        return 0;
      }
    );
    cats = cats.sort((a, b) => {
      if (a > b) {
        return 1;
      }
      if (a < b) {
        return -1;
      }
      return 0;
    });
    const series = {
      name: seriesName, colorByPoint: true, data: data,
    };
    return {
      chart: {
        type: 'column',
        backgroundColor: 'transparent',
        style: {
          fontFamily: 'GothamBook, Arial, sans-serif',
        },
      },
      title: { text: analysisName, style: this.dbc.CHART_TITLE_STYLE },
      color: this.dbc.COLUMN_COLOR,
      series: [series],
      categories: cats,
      pointWidth: this.pointWidth,
      xAxisTitle: null,
      yAxisTitle: null,
      tooltip: {
        headerFormat: '<span> ',
        pointFormat: '{point.y} {point.name} </span>'
      }
    };
  }

  public makeAgeChartOptions(results: any, analysisName: string,
                             seriesName: string, ageDecileStratum: string, analysisId: number) {
    let yAxisLabel = null;
    // Age results have two stratum-- 1 is concept, 2 is age decile
    // Sort by age decile (stratum2 or stratum5)
    if (this.domainType === 'physical measurements') {
      seriesName = 'Age When Physical Measurement Was Taken';
    } else if (this.domainType === 'ehr') {
      seriesName = 'Age at First Occurrence in Participant Record';
    }
    results = results.sort((a, b) => {
        const anum = Number(a[ageDecileStratum]);
        const bnum = Number(b[ageDecileStratum]);
        if (anum > bnum) {
          return 1;
        }
        if (anum < bnum) {
          return -1;
        }
        return 0;
      }
    );
    const data = [];
    const cats = [];
    const color = this.dbc.COLUMN_COLOR;
    let ageHelpText = null;
    for (const a of results) {
      let toolTipHelpText = null;
      if (analysisId === this.dbc.AGE_ANALYSIS_ID) {
        ageHelpText = seriesName;
        if (a.countValue > 20 ) {
          toolTipHelpText = ageHelpText + ' : ' +
            '<b>' +  a.analysisStratumName + '</b>' + '<br/> Participant Count: ' +
            '<b>' + a.countValue + '</b>';
        } else {
          toolTipHelpText = ageHelpText + ' : ' +
            '<b>' +  a.analysisStratumName + '</b>' + '<br/> Participant Count: ';
        }
      } else if (analysisId === this.dbc.AGE_PERCENTAGE_ANALYSIS_ID) {
        yAxisLabel = '% of Each Age with ' + this.conceptName;
        ageHelpText = seriesName;
        if (a.stratum4 === null || a.stratum4 === '0') {
          toolTipHelpText = ageHelpText + ' : ' +
            '<b>' +  a.analysisStratumName + '</b>' +
            '<br/>' + '% of Each Age with ' + this.conceptName + ': <b>' +
            '0' + '% </b>' +
            '<br/> Participant Count: ';
        } else {
          toolTipHelpText = ageHelpText + ' : ' +
            '<b>' +  a.analysisStratumName + '</b>' +
            '<br/>' + '% of Each Age with ' + this.conceptName +
            ': <b>' + (+(a.stratum4)) + '% </b>' +
            '<br/> Participant Count: ';
        }
      } else if (analysisId === this.dbc.SURVEY_AGE_ANALYSIS_ID) {
        ageHelpText = 'Age When Survey Was Taken';
        if (a.countValue > 20 ) {
          toolTipHelpText = 'Answer: ' + a.stratum4 + '<br/> ' + ageHelpText + ' : ' +
            '<b> ' +  a.analysisStratumName + ' </b>' +
            '<br/>' + 'Participant Count: ' + '<b>' +  a.countValue + '</b>';
        } else {
          toolTipHelpText = 'Answer: ' + a.stratum4 + '<br/> ' + ageHelpText + ' : ' +
            '<b> ' +  a.analysisStratumName + ' </b>' +
            '<br/>' + 'Participant Count: ';
        }
      } else if (analysisId === this.dbc.SURVEY_AGE_PERCENTAGE_ANALYSIS_ID) {
        yAxisLabel = '% of Each Age that answered with ' + this.selectedResult.stratum4;
        ageHelpText = 'Age When Survey Was Taken';
        if (a.percentage === null || a.percentage === 0) {
          toolTipHelpText = 'Answer: ' + a.stratum4 + '<br/> ' + ageHelpText + ' : ' +
            '<b> ' +  a.analysisStratumName + ' </b>' +
            '<br/>' + '% of Each Age that answered' + ': ' + '<b>' +  0 + '% </b>' +
            '<br/> Participant Count: ';
        } else {
          toolTipHelpText = 'Answer: ' + a.stratum4 + '<br/> ' + ageHelpText + ' : ' +
            '<b> ' +  a.analysisStratumName + ' </b>' +
            '<br/>' + '% of Each Age that answered' + ': ' + '<b>' +  +(a.percentage) + '% </b>' +
            '<br/> Participant Count: ';
        }
      }
      if (analysisId === this.dbc.AGE_PERCENTAGE_ANALYSIS_ID) {
        if (a.stratum4 === null) {
          data.push({
            name: a.analysisStratumName,
            y: 0, color: color,
            toolTipHelpText: toolTipHelpText, actualCount: a.countValue,
          });
        } else {
          data.push({
            name: a.analysisStratumName,
            y: +(a.stratum4), color: color,
            toolTipHelpText: toolTipHelpText, actualCount: a.countValue,
          });
        }
      } else if (analysisId === this.dbc.SURVEY_AGE_PERCENTAGE_ANALYSIS_ID) {
        if (a.percentage === null || a.percentage === 0) {
          data.push({
            name: a.analysisStratumName,
            y: 0, color: color,
            toolTipHelpText: toolTipHelpText, actualCount: a.countValue,
          });
        } else {
          data.push({
            name: a.analysisStratumName,
            y: +(a.percentage), color: color,
            toolTipHelpText: toolTipHelpText, actualCount: a.countValue,
          });
        }
      } else {
        data.push({
          name: a.analysisStratumName,
          y: a.countValue, color: color,
          toolTipHelpText: toolTipHelpText,
        });
      }
      cats.push(a.analysisStratumName);
    }
    const series = {
      name: seriesName,
      colorByPoint: true,
      data: data,
    };
    return {
      chart: { type: 'column', backgroundColor: 'transparent' },
      title: {
        text: this.getChartTitle(this.domainType),
        style: this.dbc.CHART_TITLE_STYLE
      },
      color: this.dbc.COLUMN_COLOR,
      series: [series],
      categories: cats,
      pointWidth: this.pointWidth,
      xAxisTitle: this.domainType === 'physical measurements' ? seriesName : analysisName,
      yAxisTitle: yAxisLabel !== null ? yAxisLabel : 'Participant Count',
      tooltip: {
        headerFormat: '<span> ',
        pointFormat: '{point.name}<br/ > {point.y}</span>'
      }
    };
  }

  // Histogram data analyses come already binned
  // The value is in stratum 4, the unit in stratum5, the countValue in the bin is countValue
  // and we also have
  // sourceCountValue
  public makeMeasurementChartOptions() {
    let data = [];
    const cats = [];
    // Todo overlay genders on one graph , use hack for separate gender graphs now
    // Hack to filter gender
    let results = this.analysis.results.concat([]);
    if (this.genderId) {
      results = results.filter(r => r.stratum3 === this.genderId);
    }
    for (const a of results) {
      let analysisStratumName = a.analysisStratumName;
      if (analysisStratumName === null) {
        analysisStratumName = this.dbc.GENDER_STRATUM_MAP[a.stratum3];
      }
      let tooltipText = '';
      if (a.stratum2 !== 'No unit') {
        if (a.countValue <= 20) {
          tooltipText = '<b>' + analysisStratumName + '</b>' +
            '<br/>' + 'Measurement Value / Range: <b>' + a.stratum4
            + '</b> <br/>' + 'Participant Count: ';
        } else {
          tooltipText = '<b>' + analysisStratumName + '</b>' +
            '<br/>' + 'Measurement Value / Range: <b>' + a.stratum4
            + '</b> <br/>' + 'Participant Count: ' +
            '<b>' + a.countValue + '</b>';
        }
      } else {
        if (a.countValue <= 20) {
          tooltipText = '<b>' + analysisStratumName + '</b>' +
            '<br/>' + 'Measurement Value : <b>' + a.stratum4
            + '</b> <br/>' + 'Participant Count: ';
        } else {
          tooltipText = '<b>' + analysisStratumName + '</b>' +
            '<br/>' + 'Measurement Value : <b>' + a.stratum4
            + '</b> <br/>' + 'Participant Count: ' +
            '<b>' + a.countValue + '</b>';
        }
      }
      data.push({ name: a.stratum4, y: a.countValue, thisCtrl: this,
        result: a, toolTipHelpText: tooltipText, binWidth: a.stratum6});
    }
    const lessThanData = data.filter(
      d => d.name != null && d.name.indexOf('< ') >= 0);
    const greaterThanData = data.filter(
      d => d.name != null && d.name.indexOf('>= ') >= 0);
    data = data.filter(
      d => d.name != null && d.name.indexOf('< ') === -1);
    data = data.filter(
      d => d.name != null && d.name.indexOf('>= ') === -1);
    data = data.sort((a, b) => {
      let aVal: any = a.name;
      let bVal: any = b.name;
      // Sort  numeric data as number
      if (a.name.indexOf(' - ') > 0) {
        aVal = a.name.split(' - ')[1];
      } else if (a.name.indexOf('< ') >= 0) {
        aVal = a.name.replace('< ', '');
      } else if (a.name.indexOf('>= ') >= 0) {
        aVal = a.name.replace('>= ', '');
      }
      if (b.name.indexOf(' - ') > 0) {
        bVal = b.name.split(' - ')[1];
      } else if (b.name.indexOf('< ') >= 0) {
        bVal = b.name.replace('< ', '');
      } else if (b.name.indexOf('>= ') >= 0) {
        bVal = b.name.replace('>= ', '');
      }
      if (isNaN(Number(aVal))) {
        // Don't do anything
      } else {
        // Make a number so sort works
        aVal = Number(aVal);
        bVal = Number(bVal);
      }
      if (aVal > bVal) {
        return -1;
      }
      if (aVal < bVal) {
        return 1;
      }
      return 0;
    });
    if (lessThanData.length > 0 && greaterThanData.length > 0) {
      data[0] = greaterThanData[0];
      data[data.length - 1] = lessThanData[0];
    } else if (lessThanData.length > 0) {
      data[data.length - 1] = lessThanData[0];
    } else if (greaterThanData.length > 0 ) {
      data[0] = greaterThanData[0];
    }
    if (data.length > 2) {
      if (greaterThanData.length === 0) {
        if (isNaN(Number(data[0].name))) {
          // Don't do anything
        } else {
          data[0].name = '>= ' + data[0].name;
        }
      }
      if (lessThanData.length === 0) {
        if (isNaN(Number(data[data.length - 1].name))) {
          // Don't do anything
        } else {
          data[data.length - 1].name = '< ' + data[data.length - 1].name;
        }
      }
    }
    for (const d of data) {
      cats.push(d.name);
    }
    // Todo we will use this later in drill downs and such
    const seriesClick = event => {
      const thisCtrl = event.point.options.thisCtrl;
      // Todo handle click events
      // console.log('Histogram plot Clicked point :',  event.point);
      // thisCtrl.resultClicked.emit(event.point.result);
    };
    // Unit for measurements is in stratum5
    if (this.analysis.unitName === 'cm') {
      this.analysis.unitName = 'centimeter';
    }
    const unit = this.analysis.unitName ? this.analysis.unitName : '';
    const series: any = {
      name: this.analysis.analysisName,
      colorByPoint: true,
      data: data,
      colors: [this.dbc.GENDER_PM_COLOR],
    };
    // Note that our data is binned already so we use a column chart to show histogram
    // however we need to style it to make it look like a histogram. Some measurements
    // like pregnancy and wheel chair we don't want a histogram.
    if (this.chartType === 'histogram') {
      // Make column chart look like  a histogram with these options
      series.pointPadding = 0;
      series.borderWidth = 0;
      series.groupPadding = 0;
      series.pointWidth = 18;
      series.shadow = false;
    }
    return {
      chart: { type: 'bar', backgroundColor: this.backgroundColor },
      title: { text: this.chartTitle },
      series: [series],
      categories: cats,
      pointWidth: this.pointWidth,
      xAxisTitle: unit,
      yAxisTitle: 'Participant Count',
      tooltip: {
        headerFormat: '{point.key} ' + unit + '<br/>',
        pointFormat: '{point.y} participants'
      },
    };
  }

  public getChartTitle(domainType: string) {
    if (domainType === DomainType.EHR) {
      return 'Age at First Occurrence in EHR.';
    } else if (domainType === DomainType.SURVEYS) {
      return 'Age When Survey Was Taken';
    } else if (domainType === DomainType.PHYSICAL_MEASUREMENTS) {
      return 'Age When Physical Measurement Was Taken';
    }
  }

  public makeStackedChartOptions(seriesName: string) {
    const data = [];
    const cats = [];
    const color = this.dbc.COLUMN_COLOR;
    const order = ['8507', '8532', '0'];
    this.analysis.results.sort(function(a, b) {
      return order.indexOf(a.stratum3) - order.indexOf(b.stratum3);
    });
    for (const a of this.analysis.results) {
      data.push({
        name: a.stratum4,
        y: a.countValue, color: color,
        toolTipHelpText: a.analysisStratumName,
      });
      cats.push(a.analysisStratumName);
    }
    const series = {
      name: seriesName,
      colorByPoint: true,
      data: data,
    };
    return {
      chart: { type: 'column', backgroundColor: this.backgroundColor },
      title: { text: this.chartTitle },
      series: [series],
      categories: cats,
      xAxis: {
        categories: cats,
      },
      pointWidth: this.pointWidth,
      xAxisTitle: '',
      yAxisTitle: null,
    };
  }

  public isPregnancyOrWheelChair() {
    if (['903111', '903120'].indexOf(this.conceptId) > -1) {
      return true;
    }
    return false;
  }

  public getNumDecimals (value: any) {
    if ((value % 1) !== 0) {
      return value.toString().split('.')[1].length;
    }
    return 0;
  }

  public getGenderMissingPercentageEhr(stratumFilter: string) {
    const genderCountResults = this.domainCountAnalysis.genderCountAnalysis.results;
    genderCountResults.filter(r => r.stratum4 === stratumFilter);
    if (genderCountResults.length > 0 && genderCountResults[0].countValue > 0) {
      return ((20 / genderCountResults[0].countValue) * 100).toFixed(2);
    } else {
      return 0;
    }
  }
}
