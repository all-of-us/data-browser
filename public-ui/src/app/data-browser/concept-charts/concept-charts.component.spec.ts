import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChartComponent} from 'app/data-browser/chart/chart.component';
import { ConceptChartsComponent } from './concept-charts.component';

describe('ConceptChartsComponent', () => {
  let component: ConceptChartsComponent;
  let fixture: ComponentFixture<ConceptChartsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ConceptChartsComponent, ChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConceptChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
