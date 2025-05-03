import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from "@angular/router";
import { AuthService } from "../services/auth.service";

@Injectable({ providedIn: "root" })
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean {
    const isAuth = this.authService.isAuthenticated();
    const allowedRoles = route.data["roles"] as string[] | undefined;
    const userRole = sessionStorage.getItem("userRole");

    if (!isAuth) {
      this.router.navigate(["/login"], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    }

    if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {
      this.router.navigate(["/error-page"]);
      return false;
    }

    return true;
  }
}
