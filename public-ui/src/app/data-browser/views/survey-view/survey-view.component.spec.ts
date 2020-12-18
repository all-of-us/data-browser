import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SurveyViewComponent } from './survey-view.component';

describe('SurveyViewComponent', () => {
  let component: SurveyViewComponent;
  let fixture: ComponentFixture<SurveyViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveyViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
