import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ClarityModule } from '@clr/angular';
/* Components */
import { DbNoResultsComponent } from 'app/components/db-no-results/db-no-results.component';
import { NoResultSearchWrapperComponent } from 'app/components/db-no-results/no-results-search.component';
import { ValueChartWrapperComponent } from 'app/data-browser/charts/chart-measurement-values/chart-value-react.component';
import { SourcesWrapperComponent } from 'app/data-browser/charts/chart-sources/chart-sources-react.component';
import { TopResultsChartWrapperComponent } from 'app/data-browser/charts/chart-top-results/chart-top-results-react.component';
import { ConceptChartWrapperComponent } from 'app/data-browser/views/concept-chart/concept-chart-react.component';
import { PhysicalMeasurementsWrapperComponent } from 'app/data-browser/views/pm/pm-react.component';
import { SurveyChartWrapperComponent } from 'app/data-browser/views/survey-chart/survey-chart-react.component';
import { SurveyDescWrapperComponent } from 'app/data-browser/views/survey-view/survey-desc.component';
import { SurveyViewWrapperComponent } from 'app/data-browser/views/survey-view/survey-react-view.component';
import { HighlightWrapperComponent } from 'app/shared/components/highlight-search/HighlightReactComponent';
import { PopUpWrapperComponent } from 'app/shared/components/pop-up/PopUpReactComponent';
import { SharedModule } from 'app/shared/shared.module';
import { HighchartsChartModule } from 'highcharts-angular';
import 'highcharts/highcharts-more';
import { CdrVersionWrapperComponent } from './cdr-version/cdr-version-info';
import { ChartComponent } from './chart/chart.component';
import { AgeWrapperComponent } from './charts/chart-age/chart-age-react.component';
import { ChartAgeComponent } from './charts/chart-age/chart-age.component';
import { ChartBaseComponent } from './charts/chart-base/chart-base.component';
import { BioSexWrapperComponent } from './charts/chart-biosex/chart-biosex-react.component';
import { ChartBiosexComponent } from './charts/chart-biosex/chart-biosex.component';
import { ChartFitbitComponent } from './charts/chart-fitbit/chart-fitbit.component';
import { ChartSurveyAnswersComponent } from './charts/chart-survey-answers/chart-survey-answers.component';
import { ChartTopResultsComponent } from './charts/chart-top-results/chart-top-results.component';
import { VersionChartWrapperComponent } from './charts/chart-version/chart-version-react.component';
import { ChartService } from './charts/chart.service';
import { RecursiveTreeComponent } from './components/recursive-tree/recursive-tree.component';
import { SourceTreeComponent } from './components/source-tree/source-tree.component';
import { SurveyVersionWrapperComponent } from './components/survey-version-table/survey-version-table-react.component';
import { SurveyVersionTableComponent } from './components/survey-version-table/survey-version-table.component';
import { TooltipWrapperComponent } from './components/tooltip/tooltip-react.component';
import { TooltipComponent } from './components/tooltip/tooltip.component';
import { ConceptChartsComponent } from './concept-charts/concept-charts.component';
import { DataBrowserRoutingModule } from './databrowser-routing.module';
import { TooltipService } from './services/tooltip.service';
import { TreeHighlightService } from './services/tree-highlight.service';
import { VideoService } from './services/video.service';
import { SourcesComponent } from './sources/sources.component';
import { EhrViewComponent } from './views/ehr-view/ehr-view.component';
import { ErrorMessageWrapperComponent } from './views/error-message/error-message-react.component';
import { ErrorMessageComponent } from './views/error-message/error-message.component';
import { FitbitViewComponent } from './views/fitbit-view/fitbit-view.component';
import { IntroVidsComponent } from './views/intro-vids/intro-vids.component';
import { PhysicalMeasurementsComponent } from './views/pm/pm.component';
import { DbHomeWrapperComponent } from './views/quick-search/home-view-react.component';
import { QuickSearchComponent } from './views/quick-search/quick-search.component';
import { SurveyChartComponent } from './views/survey-chart/survey-chart.component';
import { SurveyAnswerWrapperComponent } from './views/survey-view/components/survey-answer-react.component';
import { SurveyQuestionWrapperComponent } from './views/survey-view/components/survey-question-react.component';
import { SurveyViewComponent } from './views/survey-view/survey-view.component';
@NgModule({
  imports: [
    DataBrowserRoutingModule,
    CommonModule,
    HighchartsChartModule,
    ClarityModule,
    SharedModule
  ],
  declarations: [
    DbNoResultsComponent,
    RecursiveTreeComponent,
    SourceTreeComponent,
    EhrViewComponent,
    PhysicalMeasurementsComponent,
    QuickSearchComponent,
    SurveyChartComponent,
    ChartComponent,
    ConceptChartsComponent,
    SurveyViewComponent,
    ChartTopResultsComponent,
    ChartBaseComponent,
    SourcesComponent,
    TooltipComponent,
    ErrorMessageComponent,
    SurveyVersionTableComponent,
    FitbitViewComponent,
    ChartFitbitComponent,
    ChartBiosexComponent,
    ChartAgeComponent,
    ChartSurveyAnswersComponent,
    IntroVidsComponent,
    DbHomeWrapperComponent,
    PopUpWrapperComponent,
    SourcesWrapperComponent,
    TopResultsChartWrapperComponent,
    SurveyViewWrapperComponent,
    TooltipWrapperComponent,
    AgeWrapperComponent,
    BioSexWrapperComponent,
    SurveyChartWrapperComponent,
    ConceptChartWrapperComponent,
    NoResultSearchWrapperComponent,
    ValueChartWrapperComponent,
    SurveyVersionWrapperComponent,
    HighlightWrapperComponent,
    CdrVersionWrapperComponent,
    SurveyAnswerWrapperComponent,
    SurveyQuestionWrapperComponent,
    VersionChartWrapperComponent,
    ErrorMessageWrapperComponent,
    SurveyDescWrapperComponent,
    PhysicalMeasurementsWrapperComponent
  ],
  exports: [
    DataBrowserRoutingModule,
    ChartComponent,
    CommonModule,
    ConceptChartsComponent,
    DbNoResultsComponent,
    RecursiveTreeComponent,
    SourceTreeComponent,
    EhrViewComponent,
    PhysicalMeasurementsComponent,
    QuickSearchComponent,
    SurveyChartComponent,
    ClarityModule,
    ChartTopResultsComponent,
    ChartBaseComponent,
    HighchartsChartModule,
    IntroVidsComponent,
    DbHomeWrapperComponent,
    PopUpWrapperComponent,
    SourcesWrapperComponent,
    TopResultsChartWrapperComponent,
    SurveyViewWrapperComponent,
    AgeWrapperComponent,
    BioSexWrapperComponent,
    TooltipWrapperComponent,
    SurveyChartWrapperComponent,
    ConceptChartWrapperComponent,
    NoResultSearchWrapperComponent,
    ValueChartWrapperComponent,
    SurveyVersionWrapperComponent,
    HighlightWrapperComponent,
    CdrVersionWrapperComponent,
    SurveyAnswerWrapperComponent,
    SurveyQuestionWrapperComponent,
    VersionChartWrapperComponent,
    ErrorMessageWrapperComponent,
    SurveyDescWrapperComponent,
    PhysicalMeasurementsWrapperComponent
  ],
  providers: [
    ChartService,
    TreeHighlightService,
    VideoService,
    TooltipService
  ]
})

export class DataBrowserModule {
  constructor() { }
}
