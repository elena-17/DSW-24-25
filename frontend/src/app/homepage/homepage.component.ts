import { Component } from "@angular/core";
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "app-homepage",
  imports: [ToolbarComponent],
  templateUrl: "./homepage.component.html",
  styleUrl: "./homepage.component.scss",
})
export class HomepageComponent {
  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}
}
