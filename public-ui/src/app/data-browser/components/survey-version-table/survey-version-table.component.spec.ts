import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyVersionTableComponent } from './survey-version-table.component';

describe('SurveyVersionTableComponent', () => {
  let component: SurveyVersionTableComponent;
  let fixture: ComponentFixture<SurveyVersionTableComponent>;

  beforeEach(async(() => {
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
