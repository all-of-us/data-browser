import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import {AchillesResult, DataBrowserService, SurveyQuestionAnalysis} from '../../../publicGenerated';
import { DbConfigService } from '../../utils/db-config.service';
import { GraphType } from '../../utils/enum-defs';
import {TooltipService} from '../../utils/tooltip.service';

@Component({
  selector: 'app-survey-chart',
  templateUrl: './survey-chart.component.html',
  styleUrls: ['./survey-chart.component.css', '../../styles/template.css']
})
export class SurveyChartComponent implements OnInit {
  @Input() graphButtons: string[];
  @Input() question: any;
  @Input() answer: any;
  @Input() selectedAnalysis: any;
  @Input() selectedResult: any;
  @Input() surveyName: string;
  @Input() searchTerm: string;
  @Input() subGraphButtons: string[];
  @Input() genderQuestionCounts: any;
  @Input() ageQuestionCounts: any;
  graphToShow = GraphType.BiologicalSex;
  graphDataToShow = 'Percentage (%)';
  private subscriptions: ISubscription[] = [];
  genderPercentageAnalysis: any;
  agePercentageAnalysis: any;

  constructor(private tooltipText: TooltipService,
              public dbc: DbConfigService,
              private api: DataBrowserService) { }

  ngOnInit() {
  }

  public resetSelectedGraphs() {
    this.graphToShow = GraphType.None;
  }

  public selectGraphType(g, q: any, answer: any) {
    this.resetSelectedGraphs();
    this.graphToShow = g;
    this.dbc.triggerEvent('conceptClick', 'View Graphs',
      'Expand to see graphs', this.surveyName + ' - Q'
      + q.actualQuestionNumber + ' - ' +  q.conceptName + ' - ' + answer.stratum4 +
      ' - ' + this.graphToShow, this.searchTerm, null);
    q.graphToShow = this.graphToShow;
    switch (g) {
      case GraphType.GenderIdentity:
        q.selectedAnalysis = q.genderIdentityAnalysis;
        break;
      case GraphType.AgeWhenSurveyWasTaken:
        q.selectedAnalysis = q.ageAnalysis;
        this.selectGraph(q.graphDataToShow, q, answer);
        break;
      case GraphType.RaceEthnicity:
        q.selectedAnalysis = q.raceEthnicityAnalysis;
        break;
      default:
        q.selectedAnalysis = q.genderAnalysis;
        this.selectGraph(q.graphDataToShow, q, answer);
        break;
    }
  }

  public selectGraph(sg: any, q: any, answer: any) {
    q.graphDataToShow = sg;
    if (q.graphDataToShow === 'Percentage (%)') {
      switch (q.graphToShow) {
        case GraphType.BiologicalSex:
          this.genderPercentageAnalysis = JSON.parse(JSON.stringify(q.genderAnalysis));
          this.genderPercentageAnalysis.surveyQuestionResults = [];
          const surveyQuestionResultsWithPercentage1 = [];
          for (const ar of q.genderAnalysis.surveyQuestionResults) {
            const countResult = this.genderQuestionCounts
              .filter(gc => gc.stratum2 === ar.stratum2 &&
              gc.stratum5 === ar.stratum5 && gc.stratum6 === ar.stratum6);
            const arWithPercentage = JSON.parse(JSON.stringify(ar));
            if (countResult && countResult.length > 0) {
              arWithPercentage.percentage =
                ((ar.countValue / countResult[0].countValue) * 100).toFixed(2);
            } else {
              arWithPercentage.percentage = 0;
            }
            surveyQuestionResultsWithPercentage1.push(arWithPercentage);
          }
          this.genderPercentageAnalysis.surveyQuestionResults =
            surveyQuestionResultsWithPercentage1;
          this.genderPercentageAnalysis.analysisId = 3331;
          q.selectedAnalysis = this.genderPercentageAnalysis;
          break;
        case GraphType.AgeWhenSurveyWasTaken:
          this.agePercentageAnalysis = JSON.parse(JSON.stringify(q.ageAnalysis));
          this.agePercentageAnalysis.surveyQuestionResults = [];
          const surveyQuestionResultsWithPercentage2 = [];
          for (const ar of q.ageAnalysis.surveyQuestionResults) {
            const countResult = this.ageQuestionCounts.filter(gc => gc.stratum2 === ar.stratum2 &&
              gc.stratum5 === ar.stratum5 && gc.stratum6 === ar.stratum6);
            const arWithPercentage = JSON.parse(JSON.stringify(ar));
            if (countResult && countResult.length > 0) {
              arWithPercentage.percentage =
                ((ar.countValue / countResult[0].countValue) * 100).toFixed(2);
            } else {
              arWithPercentage.percentage = 0;
            }
            surveyQuestionResultsWithPercentage2.push(arWithPercentage);
          }
          this.agePercentageAnalysis.surveyQuestionResults = surveyQuestionResultsWithPercentage2;
          this.agePercentageAnalysis.analysisId = 3332;
          q.selectedAnalysis = this.agePercentageAnalysis;
          break;
      }
    } else {
      switch (q.graphToShow) {
        case GraphType.BiologicalSex:
          q.selectedAnalysis = q.genderAnalysis;
          break;
        case GraphType.AgeWhenSurveyWasTaken:
          q.selectedAnalysis = q.ageAnalysis;
          break;
      }
    }
  }

  public showToolTip(g: string) {
    if (g === 'Sex Assigned at Birth') {
      return this.tooltipText.biologicalSexChartHelpText;
    }
    if (g === 'Gender Identity') {
      return this.tooltipText.genderIdentityChartHelpText;
    }
    if (g === 'Race / Ethnicity') {
      return this.tooltipText.raceEthnicityChartHelpText;
    }
    if (g === 'Age When Survey Was Taken') {
      return this.tooltipText.surveyAgeChartHelpText;
    }
    if (g === 'Sources') {
      return this.tooltipText.sourcesChartHelpText;
    }
  }

  public toolTipPos(g) {
    if (g === 'Sex Assigned at Birth') {
      return 'bottom-right';
    }
    return 'bottom-left';
  }

  public hoverOnTooltip(q: any, a: any, g, event: string) {
    this.dbc.triggerEvent('tooltipsHover', 'Tooltips', 'Hover',
      this.surveyName + ' - Q' +  q.actualQuestionNumber
      + ' - ' +  q.conceptName + ' - ' + a.stratum4 +
      ' - ' + g, null,
      'Survey Chart Tooltip');
  }

  public isPercentageAnalysis(question: any) {
    if (question.graphDataToShow &&
      question.graphDataToShow.toLowerCase().indexOf('percentage') >= 0) {
      return true;
    }
    return false;
  }
}
