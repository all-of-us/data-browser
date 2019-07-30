import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResearchDirectoryComponent } from './research-directory.component';

describe('ResearchDirectoryComponent', () => {
  let component: ResearchDirectoryComponent;
  let fixture: ComponentFixture<ResearchDirectoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResearchDirectoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResearchDirectoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
