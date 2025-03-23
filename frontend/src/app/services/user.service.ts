import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class UserService {
  private baseApiUrl = "http://localhost:8000/user";

  private urlUserProfile = `${this.baseApiUrl}/profile/`;
  private urlUpdateUserProfile = `${this.baseApiUrl}/profile/update/`;
  private urlDeleteUserAccount = `${this.baseApiUrl}/profile/delete/`;
  private urlChangePassword = `${this.baseApiUrl}/profile/password/`;

  constructor(private http: HttpClient) {}

  isAuthenticated(): boolean {
    const token = sessionStorage.getItem("accessToken");
    return token != null;
  }

  getUserProfile(): Observable<any> {
    return this.http.get<any>(this.urlUserProfile, {
      withCredentials: true,
    });
  }

  updateUserProfile(userData: any): Observable<any> {
    return this.http.put<any>(this.urlUpdateUserProfile, userData, {
      withCredentials: true, // Si necesitas enviar cookies
    });
  }

  changeUserPassword(data: {
    currentPassword: string;
    password: string;
  }): Observable<any> {
    return this.http.post<any>(this.urlChangePassword, data, {
      withCredentials: true,
    });
  }

  deleteUserAccount(): Observable<any> {
    return this.http.delete<any>(this.urlDeleteUserAccount, {
      withCredentials: true, // Si necesitas enviar cookies
    });
  }
}
