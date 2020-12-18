import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChartSurveyAnswersComponent } from './chart-survey-answers.component';

describe('ChartSurveyAnswersComponent', () => {
  let component: ChartSurveyAnswersComponent;
  let fixture: ComponentFixture<ChartSurveyAnswersComponent>;

  beforeEach(waitForAsync(() => {
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
