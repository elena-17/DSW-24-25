import { Component } from "@angular/core";
import { ToolbarComponent } from "../toolbar/toolbar.component";

@Component({
  selector: "app-settings",
  imports: [ToolbarComponent],
  templateUrl: "./settings.component.html",
  styleUrl: "./settings.component.scss",
})
export class SettingsComponent {}
