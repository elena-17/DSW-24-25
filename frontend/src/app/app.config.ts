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



export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    provideRouter(routes),
  ],
};
