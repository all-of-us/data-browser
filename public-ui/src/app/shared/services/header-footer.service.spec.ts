import { TestBed, inject } from '@angular/core/testing';

import { HeaderFooterService } from './header-footer.service';

describe('HeaderFooterService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HeaderFooterService]
    });
  });

  it('should be created', inject([HeaderFooterService], (service: HeaderFooterService) => {
    expect(service).toBeTruthy();
  }));
});
