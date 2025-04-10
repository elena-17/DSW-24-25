import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
@Injectable({
  providedIn: 'root'
})
export class AdminAccountsService {
  private baseApiUrl = "http://localhost:8000/admin";
  private urlAccountsGetAll = `${this.baseApiUrl}/accounts`;
  constructor(private http: HttpClient) { }

  getAllAccounts(): Observable<any> {
    return this.http.get<any>(this.urlAccountsGetAll, {
      withCredentials: true,
    });
  }
}
