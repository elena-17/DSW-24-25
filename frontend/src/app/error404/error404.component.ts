import { Component, OnInit } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatIcon } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
@Component({
  selector: "app-error404",
  standalone: true,
  templateUrl: "./error404.component.html",
  styleUrls: ["./error404.component.scss"],
  imports: [MatCardModule, MatIcon, MatButtonModule],
})
export class Error404Component implements OnInit {
  constructor() {}

  ngOnInit() {}
}
