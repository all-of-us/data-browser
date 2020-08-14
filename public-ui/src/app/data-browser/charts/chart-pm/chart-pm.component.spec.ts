import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartPmComponent } from './chart-pm.component';

describe('ChartPmComponent', () => {
  let component: ChartPmComponent;
  let fixture: ComponentFixture<ChartPmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartPmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartPmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
