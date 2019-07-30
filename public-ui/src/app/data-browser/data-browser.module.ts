import { environment } from 'environments/environment';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ClarityModule } from '@clr/angular';
/* Components */
import { ChartModule } from 'angular2-highcharts';
import { HighchartsStatic } from 'angular2-highcharts/dist/HighchartsService';
import * as highcharts from 'highcharts';
import 'highcharts/highcharts-more';
import { DbNoResultsComponent } from '../components/db-no-results/db-no-results.component';
import { RecursiveTreeComponent } from '../components/recursive-tree/recursive-tree.component';
import { SourceTreeComponent } from '../components/source-tree/source-tree.component';
import { SharedModule } from '../shared/shared.module';
import { EhrViewComponent } from '../views/ehr-view/ehr-view.component';
import { IntroVidsComponent } from '../views/intro-vids/intro-vids.component';
import { PhysicalMeasurementsComponent } from '../views/pm/pm.component';
import { QuickSearchComponent } from '../views/quick-search/quick-search.component';
import { SurveyChartComponent } from '../views/survey-chart/survey-chart.component';
import { SurveyViewComponent } from '../views/survey-view/survey-view.component';
import { ChartComponent } from './chart/chart.component';
import { ConceptChartsComponent } from './concept-charts/concept-charts.component';

@NgModule({
  imports: [
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
    SurveyViewComponent
  ],
  exports: [
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
    ClarityModule
  ],
  providers: [
    {
      provide: HighchartsStatic,
      useValue: highcharts,
    },
  ]
})

export class DataBrowserModule {
  constructor() { }
}
