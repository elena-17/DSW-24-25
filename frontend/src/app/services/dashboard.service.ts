import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class DashboardService {
  private baseApiUrl = "http://localhost:8000/dashboard";
  private urlGetAdmin = `${this.baseApiUrl}/admin/`;
  private urlGetUser = `${this.baseApiUrl}/user/`;
  constructor(private http: HttpClient) {}

  getAdminDashboard(): Observable<any> {
    return this.http.get<any>(this.urlGetAdmin, {
      withCredentials: true,
    });
  }

  getUserDashboard(): Observable<any> {
    return this.http.get<any>(this.urlGetUser, {
      withCredentials: true,
    });
  }
}
