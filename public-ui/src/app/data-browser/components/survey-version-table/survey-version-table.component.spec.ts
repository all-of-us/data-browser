import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SurveyVersionTableComponent } from './survey-version-table.component';

describe('SurveyVersionTableComponent', () => {
  let component: SurveyVersionTableComponent;
  let fixture: ComponentFixture<SurveyVersionTableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveyVersionTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyVersionTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
