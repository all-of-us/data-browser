import { inject, TestBed } from '@angular/core/testing';

import { TreeHighlightService } from './tree-highlight.service';

describe('TreeHighlightService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TreeHighlightService]
    });
  });

  it('should be created', inject([TreeHighlightService], (service: TreeHighlightService) => {
    expect(service).toBeTruthy();
  }));
});
