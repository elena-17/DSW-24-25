import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class AdminGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean {
    const role = sessionStorage.getItem("userRole");
    if (route.data["role"] && route.data["role"] !== role) {
      this.router.navigate(["error-page"]);
      return false;
    }
    return true;
  }
}
