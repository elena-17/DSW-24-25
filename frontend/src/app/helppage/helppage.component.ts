import { Component } from "@angular/core";
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { AuthorComponent } from "./author/author.component";

@Component({
  selector: "app-helppage",
  imports: [ToolbarComponent, AuthorComponent],
  templateUrl: "./helppage.component.html",
  styleUrl: "./helppage.component.scss",
})
export class HelppageComponent {
  constructor() {}
}
