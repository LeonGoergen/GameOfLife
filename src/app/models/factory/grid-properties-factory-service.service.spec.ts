import { TestBed } from '@angular/core/testing';

import { GridPropertiesFactoryService } from './grid-properties-factory.service';

describe('GridPropertiesFactoryServiceService', () => {
  let service: GridPropertiesFactoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GridPropertiesFactoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
