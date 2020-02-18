import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ClarityModule } from '@clr/angular';
/* Components */
import { ChartModule } from 'angular2-highcharts';
import { HighchartsStatic } from 'angular2-highcharts/dist/HighchartsService';
import * as highcharts from 'highcharts';
import 'highcharts/highcharts-more';
import { DbNoResultsComponent } from '../components/db-no-results/db-no-results.component';
import { SharedModule } from '../shared/shared.module';
import { ChartComponent } from './chart/chart.component';
import { ChartBaseComponent } from './charts/chart-base/chart-base.component';
import { ChartTopResultsComponent } from './charts/chart-top-results/chart-top-results.component';
import { ChartService } from './charts/chart.service';
import { RecursiveTreeComponent } from './components/recursive-tree/recursive-tree.component';
import { SourceTreeComponent } from './components/source-tree/source-tree.component';
import { TooltipComponent } from './components/tooltip/tooltip.component';
import { ConceptChartsComponent } from './concept-charts/concept-charts.component';
import { DataBrowserRoutingModule } from './databrowser-routing.module';
import { DbTableComponent } from './db-table/db-table.component';
import { TreeHighlightService } from './services/tree-highlight.service';
import { SourcesComponent } from './sources/sources.component';
import { EhrViewComponent } from './views/ehr-view/ehr-view.component';
import { ErrorMessageComponent } from './views/error-message/error-message.component';
import { IntroVidsComponent } from './views/intro-vids/intro-vids.component';
import { PhysicalMeasurementsComponent } from './views/pm/pm.component';
import { QuickSearchComponent } from './views/quick-search/quick-search.component';
import { SurveyChartComponent } from './views/survey-chart/survey-chart.component';
import { SurveyViewComponent } from './views/survey-view/survey-view.component';
@NgModule({
  imports: [
    DataBrowserRoutingModule,
    CommonModule,
    ChartModule,
    ClarityModule,
    SharedModule
  ],
  declarations: [
    DbNoResultsComponent,
    RecursiveTreeComponent,
    SourceTreeComponent,
    EhrViewComponent,
    IntroVidsComponent,
    PhysicalMeasurementsComponent,
    QuickSearchComponent,
    SurveyChartComponent,
    ChartComponent,
    ConceptChartsComponent,
    SurveyViewComponent,
    ChartTopResultsComponent,
    ChartBaseComponent,
    DbTableComponent,
    SourcesComponent,
    TooltipComponent,
    ErrorMessageComponent,
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
    IntroVidsComponent,
    PhysicalMeasurementsComponent,
    QuickSearchComponent,
    SurveyChartComponent,
    ClarityModule,
    ChartTopResultsComponent,
    ChartBaseComponent
  ],
  providers: [
    {
      provide: HighchartsStatic,
      useValue: highcharts,
    },
    ChartService,
    TreeHighlightService
  ]
})

export class DataBrowserModule {
  constructor() { }
}
