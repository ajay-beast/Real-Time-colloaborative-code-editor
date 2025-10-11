import { TestBed } from '@angular/core/testing';

import { UserroomService } from './userroom.service';

describe('UserroomService', () => {
  let service: UserroomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserroomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
