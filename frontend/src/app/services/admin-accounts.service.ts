import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
@Injectable({
  providedIn: 'root'
})
export class AdminAccountsService {
  private baseApiUrl = "http://localhost:8000/account";
  private urlAccountsGetAll = `${this.baseApiUrl}/accounts/`;
  private urlUpdateUserBalance = `${this.baseApiUrl}/update/`;
  constructor(private http: HttpClient) { }

  getAllAccounts(): Observable<any> {
    return this.http.get<any>(this.urlAccountsGetAll, {
      withCredentials: true,
    });
  }

  updateUserBalance(email: string, amount: number): Observable<any> {
    return this.http.put<any>(this.urlUpdateUserBalance, {email, amount }, {
       withCredentials: true,
    });
  }
}
