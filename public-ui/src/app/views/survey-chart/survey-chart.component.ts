import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {GraphType} from '../../utils/enum-defs';
import {TooltipService} from '../../utils/tooltip.service';

@Component({
  selector: 'app-survey-chart',
  templateUrl: './survey-chart.component.html',
  styleUrls: ['./survey-chart.component.css','../../styles/template.css']
})
export class SurveyChartComponent implements OnInit {

  @Input() graphButtons: string[];
  @Input() question: any;
  @Input() selectedAnalysis: any;
  @Input() selectedResult: any;
  graphToShow = GraphType.None;

  constructor(private tooltipText: TooltipService) { }

  ngOnInit() {
  }

  public resetSelectedGraphs() {
    this.graphToShow = GraphType.None;
  }

  public selectGraph(g, q: any) {
    this.resetSelectedGraphs();
    this.graphToShow = g;
    q.graphToShow = this.graphToShow;
    switch (g) {
      case GraphType.GenderIdentity:
        q.selectedAnalysis = q.genderIdentityAnalysis;
        break;
      case GraphType.AgeWhenSurveyWasTaken:
        q.selectedAnalysis = q.ageAnalysis;
        break;
      case GraphType.RaceEthnicity:
        q.selectedAnalysis = q.raceEthnicityAnalysis;
        break;
      default:
        q.selectedAnalysis = q.genderAnalysis;
        break;
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
}
