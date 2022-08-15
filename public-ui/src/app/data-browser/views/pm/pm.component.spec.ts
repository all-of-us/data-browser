import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PhysicalMeasurementsComponent } from './pm.component';

describe('PhysicalMeasurementsComponent', () => {
  let component: PhysicalMeasurementsComponent;
  let fixture: ComponentFixture<PhysicalMeasurementsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PhysicalMeasurementsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhysicalMeasurementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
