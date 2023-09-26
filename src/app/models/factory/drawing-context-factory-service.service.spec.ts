import { TestBed } from '@angular/core/testing';

import { DrawingContextFactoryServiceService } from './drawing-context-factory.service';

describe('DrawingContextFactoryServiceService', () => {
  let service: DrawingContextFactoryServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DrawingContextFactoryServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
