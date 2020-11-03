import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartBiosexComponent } from './chart-biosex.component';

describe('ChartBiosexComponent', () => {
  let component: ChartBiosexComponent;
  let fixture: ComponentFixture<ChartBiosexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartBiosexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartBiosexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
