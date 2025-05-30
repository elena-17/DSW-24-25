import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-badge",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./badge.component.html",
  styleUrls: ["./badge.component.scss"],
})
export class BadgeComponent {
  @Input() text: string = "";
  @Input() icon: string = "";
  @Input() class: string = "";

  getBadgeClass(): string {
    return `badge-${this.class}`;
  }
}
