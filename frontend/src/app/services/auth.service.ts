import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AuthService {
 
  private baseApiUrl = "http://localhost:8000/user";
  private urlTokenRefresh = `${this.baseApiUrl}/token/refresh/`;
  private urlRegister = `${this.baseApiUrl}/register/`;
  private urlLogin = `${this.baseApiUrl}/login/`;
  private urlConfirmRegister = `${this.baseApiUrl}/confirm/`;
  private urlSenResetPassword = `${this.baseApiUrl}/reset-password/`;
  private urlResetPassword = `${this.baseApiUrl}/reset-password-confirm/`;
  constructor(private http: HttpClient) {}

  public saveToken(token: string): void {
    sessionStorage.setItem("access_token", token);
  }

  public saveRefreshToken(refresh: string): void {
    sessionStorage.setItem("refresh_token", refresh);
  }

  public getToken(): string | null {
    return sessionStorage.getItem("access_token");
  }

  public getRefreshToken(): string | null {
    return sessionStorage.getItem("refresh_token");
  }

  public removeToken(): void {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
  }

  public isAuthenticated(): boolean {
    const token = sessionStorage.getItem("access_token");
    return token != null;
  }

  public decodeToken(token: string): any {
    const parts = token.split(".");
    if (parts.length === 3) {
      const decoded = atob(parts[1]);
      return JSON.parse(decoded);
    }
    return null;
  }

  public refreshToken(): Observable<any> {
    return this.http.post<any>(this.urlTokenRefresh, {
      refresh: this.getRefreshToken(),
    });
  }

  register(
    email: string,
    phone_number: string,
    name: string,
    id_number: string,
    pwd1: string,
    role: string,
  ) {
    let info = {
      email: email,
      phone: phone_number,
      name: name,
      id_number: id_number,
      role: role,
      password: pwd1,
    };
    return this.http.post<any>(this.urlRegister, info);
  }

  login(email_id: string, password: string) {
    let info = {
      email: email_id,
      password: password,
    };
    return this.http.post<any>(this.urlLogin, info, {
      withCredentials: true,
    });
  }

  confirmRegistration(email: string) {
    return this.http.put(this.urlConfirmRegister, { email });
  }

  sendResetEmail(email: string) {
    return this.http.get(this.urlSenResetPassword, { params: { email } });
  }

  resetPassword(formData: any) {
    return this.http.put(this.urlResetPassword, formData, {});
    };
}
