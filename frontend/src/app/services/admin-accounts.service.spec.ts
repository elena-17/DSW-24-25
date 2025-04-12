import { TestBed } from '@angular/core/testing';

import { AdminAccountsService } from './admin-accounts.service';

describe('AdminAccountsService', () => {
  let service: AdminAccountsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminAccountsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
