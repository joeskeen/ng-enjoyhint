import { TestBed } from '@angular/core/testing';

import { EnjoyhintService } from './enjoyhint.service';

describe('NgEnjoyhintLibService', () => {
  let service: EnjoyhintService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnjoyhintService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
