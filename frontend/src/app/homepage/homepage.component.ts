import { Component, OnInit } from "@angular/core";
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { Router } from "@angular/router";
import { MainService } from "../main.service";

@Component({
  selector: "app-homepage",
  imports: [ToolbarComponent],
  templateUrl: "./homepage.component.html",
  styleUrl: "./homepage.component.scss",
})
export class HomepageComponent {
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
