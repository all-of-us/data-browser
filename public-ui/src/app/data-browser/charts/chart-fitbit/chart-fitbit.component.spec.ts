import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChartFitbitComponent } from './chart-fitbit.component';

describe('ChartFitbitComponent', () => {
  let component: ChartFitbitComponent;
  let fixture: ComponentFixture<ChartFitbitComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartFitbitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartFitbitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
