import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AdminUsersService {
  private baseApiUrl = "http://localhost:8000/user";
  private urlGetUsers = `${this.baseApiUrl}/users/`;

  private urlDeleteUser = `${this.baseApiUrl}/users/delete/`;
  private urlUpdateUser = `${this.baseApiUrl}/users/update/`;
  private urlDeleteSeveralUsers = `${this.baseApiUrl}/users/bulk-delete/`;

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
}
