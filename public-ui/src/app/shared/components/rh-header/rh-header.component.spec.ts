import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RhHeaderComponent } from './rh-header.component';

describe('RhHeaderComponent', () => {
  let component: RhHeaderComponent;
  let fixture: ComponentFixture<RhHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RhHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RhHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
