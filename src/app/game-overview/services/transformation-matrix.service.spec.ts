import { TestBed } from '@angular/core/testing';

import { TransformationMatrixService } from './transformation-matrix.service';

describe('TransformationMatrixService', () => {
  let service: TransformationMatrixService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransformationMatrixService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
