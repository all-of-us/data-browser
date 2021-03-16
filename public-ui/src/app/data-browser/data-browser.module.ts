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
import { CdrVersionWrapperComponent } from './cdr-version/cdr-version-info';
import { BioSexWrapperComponent } from './charts/chart-biosex/chart-biosex-react.component';
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
import { ErrorMessageComponent } from './views/error-message/error-message.component';
import { FitbitViewComponent } from './views/fitbit-view/fitbit-view.component';
import { FmhViewComponent } from './views/fmh-view/fmh-view.component';
import { IntroVidsWrapperComponent } from './views/intro-vids/intro-vids-react.component';
import { IntroVidsComponent } from './views/intro-vids/intro-vids.component';
import { PhysicalMeasurementsComponent } from './views/pm/pm.component';
import { DbHomeWrapperComponent } from './views/quick-search/home-view-react.component';
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
    DbHomeWrapperComponent,
    PopUpWrapperComponent,
    TooltipWrapperComponent,
    BioSexWrapperComponent,
    SurveyVersionWrapperComponent,
    HighlightWrapperComponent,
    CdrVersionWrapperComponent
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
    DbHomeWrapperComponent,
    PopUpWrapperComponent,
    BioSexWrapperComponent,
    TooltipWrapperComponent,
    SurveyVersionWrapperComponent,
    HighlightWrapperComponent,
    CdrVersionWrapperComponent
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
