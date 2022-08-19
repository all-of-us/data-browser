import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FitbitViewComponent } from './fitbit-view.component';

describe('FitbitViewComponent', () => {
  let component: FitbitViewComponent;
  let fixture: ComponentFixture<FitbitViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FitbitViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FitbitViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
