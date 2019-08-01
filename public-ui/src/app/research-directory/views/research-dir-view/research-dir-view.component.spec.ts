import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResearchDirViewComponent } from './research-dir-view.component';

describe('ResearchDirViewComponent', () => {
  let component: ResearchDirViewComponent;
  let fixture: ComponentFixture<ResearchDirViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResearchDirViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResearchDirViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
