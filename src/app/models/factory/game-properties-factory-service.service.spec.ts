import { TestBed } from '@angular/core/testing';

import { GamePropertiesFactoryService } from './game-properties-factory.service';

describe('GamePropertiesFactoryServiceService', () => {
  let service: GamePropertiesFactoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GamePropertiesFactoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
