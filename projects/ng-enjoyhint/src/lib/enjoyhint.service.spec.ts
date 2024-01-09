import { TestBed } from '@angular/core/testing';

import { EnjoyHintService } from './enjoyhint.service';

describe('NgEnjoyhintLibService', () => {
  let service: EnjoyHintService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnjoyHintService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
