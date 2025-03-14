import { Component } from "@angular/core";
import { ToolbarComponent } from "../toolbar/toolbar.component";

@Component({
  selector: "app-transactions",
  imports: [ToolbarComponent],
  templateUrl: "./transactions.component.html",
  styleUrl: "./transactions.component.scss",
})
export class TransactionsComponent {}
