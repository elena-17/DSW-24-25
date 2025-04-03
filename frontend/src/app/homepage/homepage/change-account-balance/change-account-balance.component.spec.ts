import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ChangeAccountBalanceComponent } from "./change-account-balance.component";

describe("ChangeAccountBalanceComponent", () => {
  let component: ChangeAccountBalanceComponent;
  let fixture: ComponentFixture<ChangeAccountBalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeAccountBalanceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangeAccountBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
