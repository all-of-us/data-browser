import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IntroVidsComponent } from './intro-vids.component';

describe('IntroVidsComponent', () => {
  let component: IntroVidsComponent;
  let fixture: ComponentFixture<IntroVidsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntroVidsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntroVidsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
