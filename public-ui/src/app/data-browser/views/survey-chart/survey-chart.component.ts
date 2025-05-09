import { environment } from "environments/environment";
import { Component, Input, OnInit } from "@angular/core";
import { DbConfigService } from "app/utils/db-config.service";
import { GraphType } from "app/utils/enum-defs";

@Component({
  selector: "app-survey-chart",
  templateUrl: "./survey-chart.component.html",
  styleUrls: [
    "./survey-chart.component.css",
    "../../../styles/template.css",
    "../../../styles/page.css",
  ],
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
  @Input() versionAnalysis: any[];

  displayGraphErrorMessage = false;
  graphDataToShow = "Count";
  graphToShow: string;
  genderPercentageAnalysis: any;
  selectedChartAnalysis: any;
  testReact: boolean;
  constructor(public dbc: DbConfigService) {}

  ngOnInit() {
    this.testReact = environment.testReact;
    if (this.isCopeSurvey) {
      this.graphToShow = GraphType.SurveyVersion;
    } else {
      this.graphToShow = GraphType.BiologicalSex;
    }
    this.selectGraphType(this.graphToShow, this.question, this.answer);
  }

  public selectGraphType(g, q: any, answer: any) {
    this.graphToShow = g;
    if (this.answer.stratum4.toLowerCase().indexOf("more than one race") > -1) {
      this.dbc.triggerEvent(
        "conceptClick",
        "More than one race /ethncitiy graph view",
        "Expand to see graphs",
        this.surveyName +
          " - Q" +
          q.actualQuestionNumber +
          " - " +
          q.conceptName +
          " - " +
          answer.stratum4 +
          " - " +
          this.graphToShow,
        this.searchTerm,
        null
      );
    }
    this.dbc.triggerEvent(
      "conceptClick",
      "View Graphs",
      "Expand to see graphs",
      this.surveyName +
        " - Q" +
        q.actualQuestionNumber +
        " - " +
        q.conceptName +
        " - " +
        answer.stratum4 +
        " - " +
        this.graphToShow,
      this.searchTerm,
      null
    );
    q.graphToShow = this.graphToShow;
    if (q.graphDataToShow === null) {
      q.graphDataToShow = "Count";
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
    this.displayGraphErrorMessage =
      q.selectedAnalysis === undefined ||
      (q.selectedAnalysis &&
        q.selectedAnalysis.results.filter((a) => a.stratum3 === answer.stratum3)
          .length === 0);
    // sends information to google analyitics
    this.dbc.triggerEvent(
      "graphTabClick",
      "Survey Graph",
      "Click",
      this.surveyName +
        " - " +
        q.graphToShow +
        " - Q" +
        q.actualQuestionNumber +
        " - " +
        q.conceptName +
        " - " +
        answer.stratum4 +
        " - " +
        this.graphToShow,
      this.searchTerm,
      null
    );
  }

  public getTooltipKey(g: string) {
    if (g === "Sex") {
      return "surveyBSChart";
    } else if (g === "Survey Versions") {
      return "versionChartHelpText";
    } else if (g === "Age When Survey Was Taken") {
      return "surveyAgeChartHelpText";
    } else {
      return g;
    }
  }

  public isBioSexChart() {
    return this.selectedChartAnalysis.analysisId === 3111;
  }

  public isVersionChart() {
    return this.selectedChartAnalysis.analysisId === 3113;
  }

  public isAgeChart() {
    return this.selectedChartAnalysis.analysisId === 3112;
  }
}
