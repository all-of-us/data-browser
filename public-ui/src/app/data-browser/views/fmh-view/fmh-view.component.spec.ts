import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FmhViewComponent } from './fmh-view.component';

describe('FmhViewComponent', () => {
  let component: FmhViewComponent;
  let fixture: ComponentFixture<FmhViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FmhViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FmhViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
