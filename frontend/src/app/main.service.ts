import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class MainService {
  private baseApiUrl = "http://localhost:8000/user";

  // TODO: change the urls to match the backend
  private urlRegister = `${this.baseApiUrl}/register/`;
  private urlLogin = `${this.baseApiUrl}/login/`;
  private urlUserProfile = `${this.baseApiUrl}/user/profile/`;
  private urlUpdateUserProfile = `${this.baseApiUrl}/user/profile/update/`;
  private urlDeleteUserAccount = `${this.baseApiUrl}/user/delete/`;
  private urlTokenRefresh = `${this.baseApiUrl}/token/refresh/`;
  constructor(private http: HttpClient) {}

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
      //responseType: "text" as "json",
      withCredentials: true,
    });
  }

  getUserProfile(): Observable<any> {
    const token = sessionStorage.getItem("accessToken");
    const headers = new HttpHeaders().set("Authorization", `Bearer ${token}`);

    return this.http.get<any>(this.urlUserProfile, {
      headers,
      withCredentials: true,
    });
  }

  updateUserProfile(userData: any): Observable<any> {
    const headers = new HttpHeaders().set(
      "Authorization",
      `Bearer ${sessionStorage.getItem("accessToken")}`, // Aquí agregamos el token
    );
    return this.http.put<any>(this.urlUpdateUserProfile, userData, {
      headers, // Añadimos los headers con el token
      withCredentials: true, // Si necesitas enviar cookies
    });
  }

  changeUserPassword(data: { currentPassword: string; password: string }): Observable<any> {
    const headers = new HttpHeaders().set(
      "Authorization",
      `Bearer ${sessionStorage.getItem("accessToken")}`
    );

    return this.http.post<any>(this.urlUpdateUserProfile, data, {
      headers,
      withCredentials: true,
    });
  }

  deleteUserAccount(): Observable<any> {
    const headers = new HttpHeaders().set(
      "Authorization",
      `Bearer ${sessionStorage.getItem("accessToken")}`, // Aquí agregamos el token
    );
    return this.http.delete<any>(this.urlDeleteUserAccount, {
      headers, // Añadimos los headers con el token
      withCredentials: true, // Si necesitas enviar cookies
    });
  }
}
