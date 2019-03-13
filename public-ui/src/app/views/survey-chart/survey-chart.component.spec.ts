import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyChartComponent } from './survey-chart.component';

describe('SurveyChartComponent', () => {
  let component: SurveyChartComponent;
  let fixture: ComponentFixture<SurveyChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveyChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
