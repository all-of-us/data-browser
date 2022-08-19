import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChartBaseComponent } from './chart-base.component';

describe('ChartBaseComponent', () => {
  let component: ChartBaseComponent;
  let fixture: ComponentFixture<ChartBaseComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
