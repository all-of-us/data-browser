import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ClarityModule } from '@clr/angular';
/* Components */
import { HighchartsChartModule } from 'highcharts-angular';
import 'highcharts/highcharts-more';
import { DbNoResultsComponent } from '../components/db-no-results/db-no-results.component';
import { HighlightWrapperComponent } from '../shared/components/highlight-search/HighlightReactComponent';
import { PopUpWrapperComponent } from '../shared/components/pop-up/PopUpReactComponent';
import { SharedModule } from '../shared/shared.module';
import { ChartComponent } from './chart/chart.component';
import { ChartAgeComponent } from './charts/chart-age/chart-age.component';
import { ChartBaseComponent } from './charts/chart-base/chart-base.component';
import { ChartBiosexComponent } from './charts/chart-biosex/chart-biosex.component';
import { ChartFitbitComponent } from './charts/chart-fitbit/chart-fitbit.component';
import { ChartSurveyAnswersComponent } from './charts/chart-survey-answers/chart-survey-answers.component';
import { ChartTopResultsComponent } from './charts/chart-top-results/chart-top-results.component';
import { ChartService } from './charts/chart.service';
import { RecursiveTreeComponent } from './components/recursive-tree/recursive-tree.component';
import { SourceTreeComponent } from './components/source-tree/source-tree.component';
import { SurveyVersionTableComponent } from './components/survey-version-table/survey-version-table.component';
import { TooltipComponent } from './components/tooltip/tooltip.component';
import { ConceptChartsComponent } from './concept-charts/concept-charts.component';
import { DataBrowserRoutingModule } from './databrowser-routing.module';
import { TreeHighlightService } from './services/tree-highlight.service';
import { VideoService } from './services/video.service';
import { SourcesComponent } from './sources/sources.component';
import { EhrViewComponent } from './views/ehr-view/ehr-view.component';
import { ErrorMessageComponent } from './views/error-message/error-message.component';
import { FitbitViewComponent } from './views/fitbit-view/fitbit-view.component';
import { FmhViewComponent } from './views/fmh-view/fmh-view.component';
import { IntroVidsWrapperComponent } from './views/intro-vids/intro-vids-react.component';
import { IntroVidsComponent } from './views/intro-vids/intro-vids.component';
import { PhysicalMeasurementsComponent } from './views/pm/pm.component';
import { QuickSearchComponent } from './views/quick-search/quick-search.component';
import { SurveyChartComponent } from './views/survey-chart/survey-chart.component';
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
    FmhViewComponent,
    TooltipComponent,
    ErrorMessageComponent,
    SurveyVersionTableComponent,
    FitbitViewComponent,
    ChartFitbitComponent,
    ChartBiosexComponent,
    ChartAgeComponent,
    ChartSurveyAnswersComponent,
    IntroVidsComponent,
    IntroVidsWrapperComponent,
    PopUpWrapperComponent,
    HighlightWrapperComponent
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
    IntroVidsWrapperComponent,
    PopUpWrapperComponent,
    HighlightWrapperComponent
  ],
  providers: [
    ChartService,
    TreeHighlightService,
    VideoService
  ]
})

export class DataBrowserModule {
  constructor() { }
}
