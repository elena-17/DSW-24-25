import { Injectable, NgZone } from "@angular/core";
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable, throwError, EMPTY } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import { AuthService } from "../services/auth.service";
import { Router } from "@angular/router";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone,
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    // No añadir auth a login, register o refresh
    if (
      req.url.includes("login") ||
      req.url.includes("register") ||
      req.url.includes("token/refresh") ||
      req.url.includes("api.github.com")
    ) {
      return next.handle(req);
    }

    const token = this.authService.getToken();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let authReq = req;

    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          "X-Timezone": timezone,
        },
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: any) => {
        if (this.isTokenExpiredError(error)) {
          return this.handleTokenExpiredError(req, next);
        }
        return throwError(() => error);
      }),
    );
  }

  private isTokenExpiredError(error: any): boolean {
    return (
      error instanceof HttpErrorResponse &&
      error.status === 401 &&
      !error.url?.includes("login") &&
      !error.url?.includes("register") &&
      !error.url?.includes("token/refresh")
    );
  }

  private handleTokenExpiredError(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    return this.authService.refreshToken().pipe(
      switchMap((response: any) => {
        this.authService.saveToken(response.access);
        const retryReq = req.clone({
          setHeaders: { Authorization: `Bearer ${response.access}` },
        });
        return next.handle(retryReq);
      }),
      catchError((err: any) => {
        this.authService.removeToken();
        this.ngZone.run(() => {
          this.router.navigate(["/"], {
            queryParams: { sessionExpired: true },
          });
        });
        return EMPTY;
      }),
    );
  }
}
