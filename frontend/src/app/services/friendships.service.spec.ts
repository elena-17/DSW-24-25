import { TestBed } from '@angular/core/testing';

import { FriendshipsService } from './friendships.service';

describe('FriendshipsService', () => {
  let service: FriendshipsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FriendshipsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
