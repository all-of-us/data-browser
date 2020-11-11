import { Component, Input, OnInit } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { AchillesResult, DataBrowserService } from '../../../../publicGenerated';
import { DbConfigService } from '../../../utils/db-config.service';
import { GraphType } from '../../../utils/enum-defs';
import { TooltipService } from '../../../utils/tooltip.service';

@Component({
  selector: 'app-survey-chart',
  templateUrl: './survey-chart.component.html',
  styleUrls: ['./survey-chart.component.css', '../../../styles/template.css', '../../../styles/page.css']
})
export class SurveyChartComponent implements OnInit {
  @Input() graphButtons: string[];
  @Input() question: any;
  @Input() answer: any;
  @Input() selectedAnalysis: any;
  @Input() selectedResult: any;
  @Input() surveyName: string;
  @Input() searchTerm: string;
  @Input() surveyCountAnalysis: any;
  @Input() isCopeSurvey: boolean;
  displayGraphErrorMessage = false;
  graphDataToShow = 'Count';
  graphToShow: string;
  private subscriptions: ISubscription[] = [];
  genderPercentageAnalysis: any;
  selectedChartAnalysis: any;

  constructor(private tooltipText: TooltipService,
    public dbc: DbConfigService,
    private api: DataBrowserService) {

  }

  ngOnInit() {
    if (this.isCopeSurvey) {
      this.graphToShow = GraphType.SurveyVersion;
    } else {
      this.graphToShow = GraphType.BiologicalSex;
    }
    this.selectGraphType(this.graphToShow, this.question, this.answer);
  }

  public resetSelectedGraphs() {
    this.graphToShow = GraphType.None;
    this.graphDataToShow = null;
  }

  public selectGraphType(g, q: any, answer: any) {

    this.graphToShow = g;
    if (this.answer.stratum4.toLowerCase().indexOf('more than one race') > -1) {
      this.dbc.triggerEvent('conceptClick', 'More than one race /ethncitiy graph view',
        'Expand to see graphs', this.surveyName + ' - Q'
        + q.actualQuestionNumber + ' - ' + q.conceptName + ' - ' + answer.stratum4 +
        ' - ' + this.graphToShow, this.searchTerm, null);
    }
    this.dbc.triggerEvent('conceptClick', 'View Graphs',
      'Expand to see graphs', this.surveyName + ' - Q'
      + q.actualQuestionNumber + ' - ' + q.conceptName + ' - ' + answer.stratum4 +
      ' - ' + this.graphToShow, this.searchTerm, null);
    q.graphToShow = this.graphToShow;
    if (q.graphDataToShow === null) {
      q.graphDataToShow = 'Count';
    }
    switch (this.graphToShow) {
      case GraphType.AgeWhenSurveyWasTaken:
        q.selectedAnalysis = q.ageAnalysis;
        break;
      case GraphType.SurveyVersion:
        q.selectedAnalysis = q.versionAnalysis;
        break;
      default:
        q.selectedAnalysis = q.genderAnalysis;
        break;
    }
    this.selectedChartAnalysis = q.selectedAnalysis;
    // this.displayGraphErrorMessage = q.selectedAnalysis === undefined;
    // sends information to google analyitics
    this.dbc.triggerEvent('graphTabClick', 'Survey Graph',
      'Click', this.surveyName + ' - ' + q.graphToShow + ' - Q'
      + q.actualQuestionNumber + ' - ' + q.conceptName + ' - ' + answer.stratum4 +
      ' - ' + this.graphToShow, this.searchTerm, null);
    // this.selectGraph(q.graphDataToShow, q, answer);
  }

  /// ----<<<< this code seem to be redundent >>>>>>--------
  // public selectGraph(sg: any, q: any, answer: any) {
  //   q.graphDataToShow = sg;

  //   switch (q.graphToShow) {
  //     case GraphType.BiologicalSex:
  //       q.selectedAnalysis = q.genderAnalysis;
  //       break;
  //     case GraphType.AgeWhenSurveyWasTaken:
  //       q.selectedAnalysis = q.ageAnalysis;
  //       break;
  //   }
  //   this.displayGraphErrorMessage = q.selectedAnalysis === undefined;
  // }

  public showToolTip(g: string) {
    if (g === 'Sex Assigned at Birth') {
      return this.tooltipText.biologicalSexChartHelpText + '\n' +
        this.tooltipText.surveyBSCountChartHelpText + '\n';
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
    if (g === 'Survey Versions') {
      return this.tooltipText.versionChartHelpText;
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
      this.surveyName + ' - Q' + q.actualQuestionNumber
      + ' - ' + q.conceptName + ' - ' + a.stratum4 +
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
