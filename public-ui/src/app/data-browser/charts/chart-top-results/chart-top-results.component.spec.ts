import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartTopResultsComponent } from './chart-top-results.component';

describe('ChartTopResultsComponent', () => {
  let component: ChartTopResultsComponent;
  let fixture: ComponentFixture<ChartTopResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartTopResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartTopResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
