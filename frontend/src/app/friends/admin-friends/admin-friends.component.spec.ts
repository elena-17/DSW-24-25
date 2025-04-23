import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AdminFriendsComponent } from "./admin-friends.component";

describe("AdminFriendsComponent", () => {
  let component: AdminFriendsComponent;
  let fixture: ComponentFixture<AdminFriendsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminFriendsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminFriendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
