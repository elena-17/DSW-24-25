import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class AdminUsersService {
  private baseApiUrl = environment.apiUrl + "/user";
  private urlGetUsers = `${this.baseApiUrl}/users/`;

  private urlDeleteUser = `${this.baseApiUrl}/users/delete/`;
  private urlUpdateUser = `${this.baseApiUrl}/users/update/`;
  private urlDeleteSeveralUsers = `${this.baseApiUrl}/users/bulk-delete/`;
  private urlRegister = `${this.baseApiUrl}/users/add-user/`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<any> {
    return this.http.get<any>(this.urlGetUsers, {
      withCredentials: true,
    });
  }

  deleteUser(email: string): Observable<any> {
    return this.http.delete<any>(`${this.urlDeleteUser}${email}/`, {
      withCredentials: true,
    });
  }

  deleteBulkUsers(emails: string[]): Observable<any> {
    return this.http.request<any>("delete", this.urlDeleteSeveralUsers, {
      body: { emails: emails },
      withCredentials: true,
    });
  }

  updateUser(email: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.urlUpdateUser}${email}/`, data, {
      withCredentials: true,
    });
  }

  adminRegister(
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
}
