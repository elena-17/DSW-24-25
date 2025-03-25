import { Component } from "@angular/core";
import { MaterialModule } from "../../material.module";
import { ToolbarComponent } from "../../toolbar/toolbar.component";

@Component({
  selector: "app-admin-homepage",
  imports: [MaterialModule, ToolbarComponent],
  templateUrl: "./admin-homepage.component.html",
  styleUrl: "./admin-homepage.component.scss",
})
export class AdminHomepageComponent {}
