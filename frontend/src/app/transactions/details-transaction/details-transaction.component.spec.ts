import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DetailsTransactionComponent } from "./details-transaction.component";

describe("DetailsTransactionComponent", () => {
  let component: DetailsTransactionComponent;
  let fixture: ComponentFixture<DetailsTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsTransactionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
