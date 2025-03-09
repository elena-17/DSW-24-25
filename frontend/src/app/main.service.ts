import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class UserService {
  private baseApiUrl = "http://localhost:8000";

  // TODO: change the urls to match the backend
  private urlRegister = `${this.baseApiUrl}/register`;
  private urlLogin = `${this.baseApiUrl}/login`;

  constructor(private http: HttpClient) {}

  register(email: string, pwd1: string, pwd2: string) {
    let info = {
      email: email,
      pwd1: pwd1,
      pwd2: pwd2,
    };
    return this.http.post<any>(this.urlRegister, info);
  }

  login(email_id: string, password: string) {
    let info = {
      email_or_id_number: email_id,
      password: password,
    };
    return this.http.put<any>(this.urlLogin, info, {
      responseType: "text" as "json",
      withCredentials: true,
    });
  }
}
