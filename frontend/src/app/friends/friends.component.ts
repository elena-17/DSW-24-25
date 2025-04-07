import { Component, OnInit } from "@angular/core";
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "app-friends",
  imports: [ToolbarComponent],
  templateUrl: "./friends.component.html",
  styleUrl: "./friends.component.scss",
})
export class FriendsComponent {
  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}
}
