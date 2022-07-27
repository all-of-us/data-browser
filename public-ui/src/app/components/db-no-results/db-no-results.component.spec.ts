import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DbNoResultsComponent } from './db-no-results.component';

describe('DbNoResultsComponent', () => {
  let component: DbNoResultsComponent;
  let fixture: ComponentFixture<DbNoResultsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DbNoResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbNoResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
