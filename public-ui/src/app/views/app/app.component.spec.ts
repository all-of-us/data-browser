import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';

import {ClarityModule} from '@clr/angular';
import {DataBrowserModule} from 'app/data-browser/data-browser.module';
import {DataBrowserService} from 'publicGenerated';
import {AppComponent} from './app.component';


describe('AppComponent', () => {

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        FormsModule,
        ClarityModule.forRoot(),
        DataBrowserModule
      ],
      declarations: [
        AppComponent,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: DataBrowserService, useValue: {}}
      ] }).compileComponents();
  }));


  it('should create the app', waitForAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

});
