import { TestBed } from '@angular/core/testing';

import { ControlCommunicationService } from './control-communication.service';

describe('GameService', () => {
  let service: ControlCommunicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ControlCommunicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
