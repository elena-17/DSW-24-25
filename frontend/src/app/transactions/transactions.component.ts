import { Component, OnInit } from "@angular/core";
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { Router } from "@angular/router";
import { MainService } from "../main.service";

@Component({
  selector: "app-transactions",
  imports: [ToolbarComponent],
  templateUrl: "./transactions.component.html",
  styleUrl: "./transactions.component.scss",
})
export class TransactionsComponent implements OnInit {
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
