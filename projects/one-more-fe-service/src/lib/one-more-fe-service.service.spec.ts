import { TestBed } from '@angular/core/testing';

import { OneMoreFeServiceService } from './one-more-fe-service.service';

describe('OneMoreFeServiceService', () => {
  let service: OneMoreFeServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OneMoreFeServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
