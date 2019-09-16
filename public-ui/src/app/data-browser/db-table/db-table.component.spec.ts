import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbTableComponent } from './db-table.component';

describe('DbTableComponent', () => {
  let component: DbTableComponent;
  let fixture: ComponentFixture<DbTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DbTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
