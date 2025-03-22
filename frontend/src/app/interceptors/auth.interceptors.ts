import { Injectable } from "@angular/core";
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import { AuthService } from "../services/auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    if (req.url.includes("login") || req.url.includes("register")) {
      return next.handle(req);
    }

    if (token) {
      const clonedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      return next.handle(req).pipe(
        catchError((error: any) => {
          if (this.isTokenExpiredError(error)) {
            return this.handleTokenExpiredError(req, next);
          } else {
            return throwError(() => error);
          }
        }),
      );
    }

    return next.handle(req);
  }

  private isTokenExpiredError(error: any): boolean {
    return (
      error instanceof HttpErrorResponse &&
      error.status === 401 &&
      error.error &&
      error.error.includes("JWT expired")
    );
  }

  private handleTokenExpiredError(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    return this.authService.refreshToken().pipe(
      switchMap((response: any) => {
        const token = response.access;
        this.authService.saveToken(token);
        const clonedRequest = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
        return next.handle(clonedRequest);
      }),
      catchError((error: any) => {
        this.authService.removeToken();
        return throwError(() => error);
      }),
    );
  }
}
