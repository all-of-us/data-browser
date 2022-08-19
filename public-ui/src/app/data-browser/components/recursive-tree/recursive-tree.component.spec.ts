import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RecursiveTreeComponent } from './recursive-tree.component';

describe('RecursiveTreeComponent', () => {
  let component: RecursiveTreeComponent;
  let fixture: ComponentFixture<RecursiveTreeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RecursiveTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecursiveTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
