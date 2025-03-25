import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideRouter, Routes } from "@angular/router";

import { routes } from "./app.routes";

import {
  provideHttpClient,
  HTTP_INTERCEPTORS,
  withInterceptorsFromDi,
} from "@angular/common/http";

import { AuthInterceptor } from "./interceptors/auth.interceptors";
import { AuthGuard } from "./guards/auth.guard";

function addGlobalGuard(routes: Routes): Routes {
  const publicRoutes = ["", "register"];

  // do not modify public routes
  return routes.map((route) => {
    if (publicRoutes.includes(route.path || "")) {
      return route;
    }

    //apply guard
    const guardedRoute = {
      ...route,
      canActivate: [AuthGuard],
    };
    if (route.children) {
      guardedRoute.children = addGlobalGuard(route.children);
    }

    return guardedRoute;
  });
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(addGlobalGuard(routes)),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
};
