import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {LocalStorageModule} from 'angular-2-local-storage';
import {NgxPaginationModule} from 'ngx-pagination';
import {AppRoutingModule} from '../app-routing.module';

//  components
import {BetaBarComponent} from '../components/beta-bar/beta-bar.component';
import {DbSpinnerComponent} from '../components/db-spinner/db-spinner.component';
import {HighlightSearchComponent} from '../highlight-search/highlight-search.component';
import {BreadcrumbComponent} from '../views/breadcrumb/breadcrumb.component';
import {DbHeaderComponent} from '../views/db-header/db-header.component';
import {EmergencyComponent} from '../views/emergency/emergency.component';
import {LoginComponent} from '../views/login/login.component';
import {PageTemplateSignedOutComponent} from '../views/page-template-signed-out/page-template-signed-out.component';

@NgModule({
  imports: [
    AppRoutingModule,
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    LocalStorageModule
  ],
  declarations: [
    HighlightSearchComponent,
    BreadcrumbComponent,
    EmergencyComponent,
    LoginComponent,
    PageTemplateSignedOutComponent,
    DbHeaderComponent,
    BetaBarComponent,
    DbSpinnerComponent
  ],
  exports: [
    AppRoutingModule,
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    HighlightSearchComponent,
    BreadcrumbComponent,
    EmergencyComponent,
    LoginComponent,
    PageTemplateSignedOutComponent,
    DbHeaderComponent,
    BetaBarComponent,
    DbSpinnerComponent,
    LocalStorageModule
  ]
})
export class SharedModule { }
