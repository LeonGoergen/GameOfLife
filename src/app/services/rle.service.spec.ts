import { TestBed } from '@angular/core/testing';

import { RleService } from './rle.service';

describe('RleService', () => {
  let service: RleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
