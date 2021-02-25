import { CommonModule } from '@angular/common';
import {HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
//  components
import { BetaBarComponent } from '../components/beta-bar/beta-bar.component';
import { EmergencyComponent } from '../views/emergency/emergency.component';
import { PageTemplateSignedOutComponent } from '../views/page-template-signed-out/page-template-signed-out.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { HighlightSearchComponent } from './components/highlight-search/highlight-search.component';
import { PopUpComponent } from './components/pop-up/pop-up.component';
import { RhFooterReactComponent } from './components/rh-footer/rh-footer';
import { RhFooterComponent } from './components/rh-footer/rh-footer.component';
import { RhHeaderComponent } from './components/rh-header/rh-header.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { HeaderFooterService } from './services/header-footer.service';

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    HttpClientModule,

  ],
  declarations: [
    HighlightSearchComponent,
    BreadcrumbComponent,
    EmergencyComponent,
    PageTemplateSignedOutComponent,
    RhHeaderComponent,
    BetaBarComponent,
    SpinnerComponent,
    RhFooterComponent,
    RhFooterReactComponent,
    PopUpComponent
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    HighlightSearchComponent,
    BreadcrumbComponent,
    EmergencyComponent,
    PageTemplateSignedOutComponent,
    RhHeaderComponent,
    BetaBarComponent,
    SpinnerComponent,
    RhFooterComponent,
    RhFooterReactComponent,
    PopUpComponent
  ],
  providers: [
    HeaderFooterService
  ]
})
export class SharedModule { }
