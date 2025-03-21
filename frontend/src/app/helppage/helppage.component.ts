import { Component, OnInit } from "@angular/core";
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { Router } from "@angular/router";
import { MainService } from "../main.service";

@Component({
  selector: "app-helppage",
  imports: [ToolbarComponent],
  templateUrl: "./helppage.component.html",
  styleUrl: "./helppage.component.scss",
})
export class HelppageComponent implements OnInit {
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
