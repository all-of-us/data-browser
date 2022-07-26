import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EhrViewComponent } from './ehr-view.component';

describe('EhrViewComponent', () => {
  let component: EhrViewComponent;
  let fixture: ComponentFixture<EhrViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EhrViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EhrViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
