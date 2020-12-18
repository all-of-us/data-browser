import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RhFooterComponent } from './rh-footer.component';

describe('RhFooterComponent', () => {
  let component: RhFooterComponent;
  let fixture: ComponentFixture<RhFooterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RhFooterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RhFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
