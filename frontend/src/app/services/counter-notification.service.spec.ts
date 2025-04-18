import { TestBed } from "@angular/core/testing";

import { CounterNotificationService } from "./counter-notification.service";

describe("CounterNotificationService", () => {
  let service: CounterNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CounterNotificationService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
