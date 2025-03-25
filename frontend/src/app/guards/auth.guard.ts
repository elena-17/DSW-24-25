import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const publicRoutes = ['login', 'register'];

    const currentRoute = route.routeConfig?.path || '';

    if (publicRoutes.includes(currentRoute)) {
      return true;
    }

    if (this.authService.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate(["error-page"]);
      return false;
    }
  }
}
