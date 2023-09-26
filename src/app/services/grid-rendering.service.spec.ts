import { TestBed } from '@angular/core/testing';

import { GridRenderingService } from './grid-rendering.service';

describe('GridRenderingService', () => {
  let service: GridRenderingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GridRenderingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
