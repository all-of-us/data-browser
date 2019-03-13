import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Concept} from "../../../publicGenerated/model/concept";
import {GraphType} from "../../utils/enum-defs";
import {TooltipService} from "../../utils/tooltip.service";

@Component({
  selector: 'app-survey-chart',
  templateUrl: './survey-chart.component.html',
  styleUrls: ['./survey-chart.component.css']
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
    switch (g) {
      case GraphType.GenderIdentity:
        q.selectedAnalysis = q.genderIdentityAnalysis;
        break;
      case GraphType.Age:
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
    if (g === 'Biological Sex' || g === 'Gender Identity') {
      return 'Gender chart';
    } else if (g === 'Age') {
      return this.tooltipText.ageChartHelpText;
    } else if (g === 'Sources') {
      return this.tooltipText.sourcesChartHelpText;
    } else if (g === 'Race / Ethnicity') {
      return 'Race / Ethnicity chart';
    }
  }
}
