import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class MainService {
  private baseApiUrl = "http://localhost:8000";

  // TODO: change the urls to match the backend
  private urlRegister = `${this.baseApiUrl}/register/`;
  private urlLogin = `${this.baseApiUrl}/login/`;
  private urlUserProfile = `${this.baseApiUrl}/user/profile/`;
  private urlUpdateUserProfile = `${this.baseApiUrl}/user/profile/update/`;
  private urlDeleteUserAccount = `${this.baseApiUrl}/user/delete/`;

  constructor(private http: HttpClient) {}

  register(
    email: string,
    phone_number: string,
    name: string,
    id_number: string,
    pwd1: string,
  ) {
    let info = {
      email: email,
      phone_number: phone_number,
      name: name,
      id_number: id_number,
      password: pwd1,
      //pwd2: pwd2,
    };
    return this.http.post<any>(this.urlRegister, info);
  }

  login(email_id: string, password: string) {
    let info = {
      email_or_id_number: email_id,
      password: password,
    };
    return this.http.post<any>(this.urlLogin, info, {
      //responseType: "text" as "json",
      withCredentials: true,
    });
  }

  getUserProfile(): Observable<any> {
    return this.http.get<any>(this.urlUserProfile, { withCredentials: true });
  }

  updateUserProfile(userData: any): Observable<any> {
    return this.http.put<any>(this.urlUserProfile, userData, {
      withCredentials: true,
    });
  }

  deleteUserAccount(): Observable<any> {
    return this.http.delete<any>(this.urlDeleteUserAccount, {
      withCredentials: true,
    });
  }
}
