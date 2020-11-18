import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartSurveyAnswersComponent } from './chart-survey-answers.component';

describe('ChartSurveyAnswersComponent', () => {
  let component: ChartSurveyAnswersComponent;
  let fixture: ComponentFixture<ChartSurveyAnswersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartSurveyAnswersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartSurveyAnswersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
