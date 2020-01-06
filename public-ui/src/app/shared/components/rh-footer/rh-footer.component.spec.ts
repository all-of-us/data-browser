import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RhFooterComponent } from './rh-footer.component';

describe('RhFooterComponent', () => {
  let component: RhFooterComponent;
  let fixture: ComponentFixture<RhFooterComponent>;

  beforeEach(async(() => {
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
