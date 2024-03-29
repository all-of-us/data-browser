import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HighlightSearchComponent } from './highlight-search.component';

describe('HighlightSearchComponent', () => {
  let component: HighlightSearchComponent;
  let fixture: ComponentFixture<HighlightSearchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HighlightSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HighlightSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
