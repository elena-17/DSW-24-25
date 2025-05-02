import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LoginPaymentComponent } from "./login-payment.component";

describe("LoginPaymentComponent", () => {
  let component: LoginPaymentComponent;
  let fixture: ComponentFixture<LoginPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPaymentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
