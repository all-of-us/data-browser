import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartAgeComponent } from './chart-age.component';

describe('ChartAgeComponent', () => {
  let component: ChartAgeComponent;
  let fixture: ComponentFixture<ChartAgeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartAgeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartAgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
