import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChartTopResultsComponent } from './chart-top-results.component';

describe('ChartTopResultsComponent', () => {
  let component: ChartTopResultsComponent;
  let fixture: ComponentFixture<ChartTopResultsComponent>;

  beforeEach(waitForAsync(() => {
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
