import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-badge",
  templateUrl: "./badge.component.html",
  styleUrls: ["./badge.component.scss"],
  imports: [CommonModule],
})
export class BadgeComponent {
  @Input() role: string = ""; // El valor del rol (ej. "admin", "user", etc.)
  @Input() type: string = ""; // El tipo de badge (ej. "admin", "user", etc.)
  getBadgeClass(role: string): string {
    switch (role.toLowerCase()) {
      case "admin":
        return "admin-badge";
      case "user":
        return "user-badge";
      case "vendor":
        return "vendor-badge";
      default:
        return "default-badge";
    }
  }
}
