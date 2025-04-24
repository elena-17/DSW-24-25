import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ManageCreditcardsComponent } from "./manage-creditcards.component";

describe("ManageCreditcardsComponent", () => {
  let component: ManageCreditcardsComponent;
  let fixture: ComponentFixture<ManageCreditcardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageCreditcardsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageCreditcardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
