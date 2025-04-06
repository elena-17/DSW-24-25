import { Component, OnInit } from "@angular/core";
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "app-helppage",
  imports: [ToolbarComponent],
  templateUrl: "./helppage.component.html",
  styleUrl: "./helppage.component.scss",
})
export class HelppageComponent {
  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}
}
