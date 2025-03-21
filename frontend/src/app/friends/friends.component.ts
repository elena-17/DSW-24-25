import { Component, OnInit } from "@angular/core";
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { Router } from "@angular/router";
import { MainService } from "../main.service";

@Component({
  selector: "app-friends",
  imports: [ToolbarComponent],
  templateUrl: "./friends.component.html",
  styleUrl: "./friends.component.scss",
})
export class FriendsComponent implements OnInit {
  constructor(
    private router: Router,
    private mainService: MainService,
  ) {}

  ngOnInit() {
    if (!this.mainService.isAuthenticated()) {
      this.router.navigate(["error-page"]);
      return;
    }
  }
}
