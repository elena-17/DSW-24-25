import { Component, OnInit } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatIcon } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { Router } from "@angular/router";
@Component({
  selector: "app-error404",
  standalone: true,
  templateUrl: "./error404.component.html",
  styleUrls: ["./error404.component.scss"],
  imports: [MatCardModule, MatIcon, MatButtonModule],
})
export class Error404Component implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {}

  goHome() {
    this.router.navigate(["/"]);
  }
}
