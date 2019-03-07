import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import * as highcharts from 'highcharts';

import { Analysis } from '../../../publicGenerated/model/analysis';
import { Concept } from '../../../publicGenerated/model/concept';
import { DbConfigService } from '../../utils/db-config.service';
import { DomainType } from '../../utils/enum-defs';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnChanges {
  @Input() analysis: Analysis;
  @Input() analysis2: Analysis;
  @Input() concepts: Concept[] = []; // Can put in analysis or concepts to chart. Don't put both
  @Input() selectedResult: any; // For ppi question, this is selected answer.
  @Input() pointWidth = 15;   // Optional width of bar or point or box plot
  @Input() backgroundColor = 'transparent'; // Optional background color
  @Input() chartTitle: string;
  @Input() chartType: string;
  @Input() sources = false;
  @Input() genderId: string; // Hack until measurement design of graphs gender overlay
  @Input() domainType: DomainType;
  @Output() resultClicked = new EventEmitter<any>();
  chartOptions: any = null;

  constructor(private dbc: DbConfigService) {
    highcharts.setOptions({
      lang: { thousandsSep: ',' },
    });
  }

  // Render new chart on changes
  ngOnChanges() {
    if ((this.analysis && this.analysis.results && this.analysis.results.length) ||
      (this.concepts && this.concepts.length)) {
      // HC automatically redraws when changing chart options
      this.chartOptions = this.hcChartOptions();
    }
  }

  public isSurveyGenderAnalysis() {
    return this.analysis ?
      (this.analysis.analysisId === this.dbc.SURVEY_GENDER_ANALYSIS_ID ||
        this.analysis.analysisId === this.dbc.SURVEY_GENDER_IDENTITY_ANALYSIS_ID)
      : false;
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
      lang: {
        noData: {
          style: {
            fontWeight: 'bold',
            fontSize: '15px',
            color: '#303030'
          }
        }
      },
      credits: {
        enabled: false
      },
      title: options.title,
      subtitle: {},
      tooltip: {
        followPointer: true,
        backgroundColor: '#f0f2f3',
        borderWidth: 0,
        borderRadius: 10,
        shadow: false,
        style: {
          padding: 0,
          borderRadius: 3,
          fontSize: '18px',
          color: '#262262'
        },
        formatter: function(tooltip) {
          if (this.point.y <= 20) {
            return this.point.name + ' <= ' + '<b>' + this.point.y + '</b>';
          }
          // If not <= 20, use the default formatter
          return tooltip.defaultFormatter.call(this, tooltip);
        }
      },
      plotOptions: {
        series: {
          animation: {
            duration: 100,
          },
          pointWidth: options.pointWidth ? options.pointWidth : null,
          minPointLength: 3,
          events: {
            click: event => {
              // Todo handle click and log events in analytics
              // console.log('plot options clicked ', event.point);
            }
          },
        },
        pie: {
          borderColor: null,
          slicedOffset: 4,
          size:  '100%',
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
          text: null
        },
        min: 20,
        labels: {
          style: {
            fontSize: '18',
          },
          formatter: function () {
            const label = this.axis.defaultLabelFormatter.call(this);
            // Change <= 20 count to display '<= 20'
            if (label <= 20) {
              return '<= 20';
            }
            return label;
          }
        },
        lineWidth: 1,
        lineColor: this.dbc.AXIS_LINE_COLOR,
        gridLineColor: this.backgroundColor
      },
      xAxis: {
        title: {
          text: options.xAxisTitle ? options.xAxisTitle : null
        },
        categories: options.categories,
        // type: 'category',
        labels: {
          align: 'right',
          reserveSpace: true,
          style: {
            whiteSpace: 'wrap',
            fontSize: '18',
          },
        },
        lineWidth: 1,
        lineColor: this.dbc.AXIS_LINE_COLOR
      },
      zAxis: {},
      legend: {
        enabled: false
      },
      series: [options.series],
    };
  }


  public makeChartOptions() {
    if (this.concepts.length > 0) {
      return this.makeConceptChartOptions();
    }
    if (this.analysis.analysisId === this.dbc.COUNT_ANALYSIS_ID ||
      this.analysis.analysisId === this.dbc.SURVEY_COUNT_ANALYSIS_ID) {
      return this.makeCountChartOptions();
    }

    if (this.analysis.analysisId === this.dbc.GENDER_ANALYSIS_ID ||
      this.analysis.analysisId === this.dbc.SURVEY_GENDER_ANALYSIS_ID) {
      return this.makeGenderChartOptions();
    }

    if (this.analysis.analysisId === this.dbc.GENDER_IDENTITY_ANALYSIS_ID ||
      this.analysis.analysisId === this.dbc.SURVEY_GENDER_IDENTITY_ANALYSIS_ID) {
      return this.makeGenderChartOptions();
    }

    /* Todo make charts for ethniticy and race
     * maybe cleanup / generalize pie chart
    if (
      this.analysis.analysisId === this.dbc.ETHNICITY_ANALYSIS_ID ||
      this.analysis.analysisId === this.dbc.RACE_ANALYSIS_ID) {
      return this.makePieChartOptions();
    }*/

    if (this.analysis.analysisId === this.dbc.AGE_ANALYSIS_ID ||
      this.analysis.analysisId === this.dbc.SURVEY_AGE_ANALYSIS_ID) {
      return this.makeAgeChartOptions();
    }
    if (this.analysis.analysisId === this.dbc.MEASUREMENT_VALUE_ANALYSIS_ID) {
      return this.makeMeasurementChartOptions();
    }
    console.log('Error: Can not make chart options for this analysis. :', this.analysis);
  }

  seriesClick(event) {
    // Todo handle click and log events in analytics
    // console.log('Global series clicked ', this.analysis, 'Clicked analysis', event.point);
  }

  public makeCountChartOptions() {
    let data = [];
    let cats = [];
    for (const a of this.analysis.results) {
      data.push({ name: a.stratum4, y: a.countValue, thisCtrl: this, result: a });
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
      series: series,
      categories: cats,
      pointWidth: this.pointWidth,
      xAxisTitle: null,
      tooltip: { pointFormat: '<b>{point.y} </b>' },
    };

  }

  public makeConceptChartOptions() {
    const data = [];
    const cats = [];

    // Sort by count value
    this.concepts = this.concepts.sort((a, b) => {
      if (a.countValue < b.countValue) {
        return 1;
      }
      if (a.countValue > b.countValue) {
        return -1;
      }
      return 0;
    }
    );

    for (const a of this.concepts) {
      data.push({
        name: a.conceptName + ' (' + a.vocabularyId + '-' + a.conceptCode + ') ',
        y: a.countValue,
        color: this.dbc.COLUMN_COLOR
      });
      if (!this.sources) {
        cats.push(a.conceptName);
      } else {
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
        style: {
          fontFamily: 'Gotham-Book'
        },
        tooltip: {
          headerFormat: `<span>
        <span style="font-size:.7em;">{point.key}</span> <br/>`,
          pointFormat: '<b>{point.y}</b></span>'
        },
      },
      title: { text: null, style: this.dbc.CHART_TITLE_STYLE },
      series: series,
      categories: cats,
      pointPadding: 0.25,
      minPointLength: 3,
      pointWidth: 20,
      xAxisTitle: null,
    };

  }

  public makeGenderChartOptions() {
    let results = [];
    let seriesName = '';
    if (this.analysis.analysisId === this.dbc.GENDER_ANALYSIS_ID ||
      this.analysis.analysisId === this.dbc.ETHNICITY_ANALYSIS_ID ||
      this.analysis.analysisId === this.dbc.RACE_ANALYSIS_ID ||
      this.analysis.analysisId === this.dbc.GENDER_IDENTITY_ANALYSIS_ID) {
      results = this.analysis.results;
      seriesName = this.analysis.analysisName;
    } else {
      // For ppi we need to filter the results to the particular answer that the user selected
      // because we only show the breakdown for one answer on this chart
      // results = this.getSelectedResults(this.selectedResult);
      results = this.analysis.results.filter(r => r.stratum4 === this.selectedResult.stratum4);
      // Series name for answers is the answer selected which is in stratum4
      seriesName = this.selectedResult.stratum4;
    }
    let data = [];
    let cats = [];
    for (const a of results) {
      // For normal Gender Analysis , the stratum2 is the gender . For ppi it is stratum5;
      let color = null;
      if (this.chartTitle === 'Biological Sex') {
        if (this.analysis.analysisId === this.dbc.GENDER_ANALYSIS_ID) {
          color = this.dbc.GENDER_COLORS[a.stratum2];
        }
        if (this.analysis.analysisId === this.dbc.SURVEY_GENDER_ANALYSIS_ID) {
          color = this.dbc.GENDER_COLORS[a.stratum5];
        }
        if (this.analysis.analysisId === this.dbc.SURVEY_GENDER_IDENTITY_ANALYSIS_ID) {
          color = this.dbc.GENDER_IDENTITY_COLORS[a.stratum5];
        }
        if (this.analysis.analysisId === this.dbc.GENDER_IDENTITY_ANALYSIS_ID) {
          color = this.dbc.GENDER_IDENTITY_COLORS[a.stratum2];
        }
      } else { color = this.dbc.COLUMN_COLOR; }

      data.push({
        name: a.analysisStratumName
        , y: a.countValue, color: color, sliced: true
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
        type: (this.analysis.analysisId === this.dbc.GENDER_ANALYSIS_ID
          || this.analysis.analysisId === this.dbc.SURVEY_GENDER_ANALYSIS_ID)
          ? 'pie' : 'bar',
        backgroundColor: 'transparent',
        style: {
          fontFamily: 'Gotham-Book'
        },
      },
      title: { text: this.analysis.analysisName, style: this.dbc.CHART_TITLE_STYLE },
      series: series,
      categories: cats,
      pointWidth: this.pointWidth,
      xAxisTitle: null,
      tooltip: {
        headerFormat: '<span> ',
        pointFormat: (this.analysis.analysisId === this.dbc.GENDER_ANALYSIS_ID
          || this.analysis.analysisId === this.dbc.SURVEY_GENDER_ANALYSIS_ID)
          ? `<span style="font-size:.7em">
        <b> {point.y}</b> {point.name}s </span></span>` : `<span style="font-size:.7em">
        <b> {point.y}</b> {point.name} </span></span>`
      }
    };

  }

  public makeAgeChartOptions() {
    let results = [];
    let seriesName = '';
    let ageDecileStratum = '';

    // Question/answers have a different data structure than other concepts
    if (this.analysis.analysisId === this.dbc.AGE_ANALYSIS_ID) {
      results = this.analysis.results;
      seriesName = this.analysis.analysisName;
      ageDecileStratum = 'stratum2';
    } else if (this.analysis.analysisId === this.dbc.SURVEY_AGE_ANALYSIS_ID) {
      // For ppi survey we filter the results to the particular answer that the user selected
      results = this.analysis.results.filter(r => r.stratum4 === this.selectedResult.stratum4);
      // Series name for answers is the answer selected which is in stratum4
      seriesName = this.selectedResult.stratum4;
      ageDecileStratum = 'stratum5';
    }

    // Age results have two stratum-- 1 is concept, 2 is age decile
    // Sort by age decile (stratum2 or stratum5)
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
    for (const a of results) {
      data.push({
        name: a.analysisStratumName,
        y: a.countValue, color: color,
      });
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
      series: series,
      categories: cats,
      pointWidth: this.pointWidth,
      xAxisTitle: null,
      tooltip: {
        headerFormat: '<span> ',
        pointFormat: `<span style="font-size:.7em">
        {point.name}</span> <br/ ><b> {point.y}</b></span>`
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
      data.push({ name: a.stratum4, y: a.countValue, thisCtrl: this, result: a });
    }
    data = data.sort((a, b) => {
      let aVal: any = a.name;
      let bVal: any = b.name;
      // Sort  numeric data as number
      if (isNaN(Number(a.name))) {
        // Don't do anything
      } else {
        // Make a number so sort works
        aVal = Number(aVal);
        bVal = Number(b.name);
      }

      if (aVal > bVal) {
        return 1;
      }
      if (aVal < bVal) {
        return -1;
      }
      return 0;
    });
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
    const unit = this.analysis.unitName ? this.analysis.unitName : '';
    const series: any = {
      name: this.analysis.analysisName,
      colorByPoint: true,
      data: data,
      colors: [this.dbc.COLUMN_COLOR],
    };

    // Note that our data is binned already so we use a column chart to show histogram
    // however we need to style it to make it look like a histogram. Some measurements
    // like pregnancy and wheel chair we don't want a histogram.
    if (this.chartType === 'histogram') {
      // Make column chart look like  a histogram with these options
      series.pointPadding = 0;
      series.borderWidth = 0;
      series.groupPadding = 0;
      series.pointWidth = null;
      series.shadow = false;
    }

    return {
      chart: { type: 'column', backgroundColor: this.backgroundColor },
      title: { text: this.chartTitle },
      series: series,
      categories: cats,
      pointWidth: this.pointWidth,
      xAxisTitle: unit,
      tooltip: {
        headerFormat: '<span style="font-size: 10px">{point.key} ' + unit + '</span><br/>',
        pointFormat: '<b> {point.y} participants </b> '
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

}
