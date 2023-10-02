import { TestBed } from '@angular/core/testing';

import { TransformationMatrixFactoryService } from './transformation-matrix-factory.service';

describe('TransformationMatrixFactoryService', () => {
  let service: TransformationMatrixFactoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransformationMatrixFactoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
