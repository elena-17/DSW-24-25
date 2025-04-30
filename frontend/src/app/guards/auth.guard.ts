import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from "@angular/router";
import { AuthService } from "../services/auth.service";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean {
    const role = sessionStorage.getItem("userRole");
    if (this.authService.isAuthenticated()) {
      const allowedRoles = route.data["roles"] as string[] | undefined;
      if (allowedRoles && (!role || !allowedRoles.includes(role))) {
        this.router.navigate(["error-page"]);
        return false;
      }

      return true;
    } else {
      this.router.navigate(["error-page"]);
      return false;
    }
  }
}
