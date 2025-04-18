import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class UserService {
  private baseApiUrl = "http://localhost:8000/user";
  private creditApiUrl = "http://localhost:8000/creditcards";
  private accountApiUrl = "http://localhost:8000/account";

  // URL for validation in bank
  private urlValidateCard = "http://localhost:8080/api/validate/";

  // URL for user profile
  private urlUserProfile = `${this.baseApiUrl}/profile/`;
  private urlUpdateUserProfile = `${this.baseApiUrl}/profile/update/`;
  private urlDeleteUserAccount = `${this.baseApiUrl}/profile/delete/`;
  private urlChangePassword = `${this.baseApiUrl}/profile/password/`;

  // URL for credit cards
  private urlAddCreditCard = `${this.creditApiUrl}/create/`;
  private urlUpdateCreditCard = `${this.creditApiUrl}/update/`;
  private urlDeleteCreditCard = `${this.creditApiUrl}/delete/`;
  private urlGetCreditCards = `${this.creditApiUrl}/`;

  // URL for account balance
  private urlGetAccountBalance = `${this.accountApiUrl}/`;
  private urlDepositFunds = `${this.accountApiUrl}/recharge/`;
  private urlWithdrawFunds = `${this.accountApiUrl}/withdraw/`;

  // URL for payment request
  private apiUrlPaymentRequest = `${this.accountApiUrl}/payment-request/`;
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
      withCredentials: true,
    });
  }

  getCreditCards(): Observable<any> {
    return this.http.get<any>(this.urlGetCreditCards, {
      withCredentials: true,
    });
  }

  addCreditCard(cardData: any): Observable<any> {
    return this.http.post<any>(this.urlAddCreditCard, cardData, {
      withCredentials: true,
    });
  }

  updateCreditCard(cardData: any): Observable<any> {
    return this.http.put<any>(this.urlUpdateCreditCard, cardData, {
      withCredentials: true,
    });
  }

  deleteCreditCard(card: any): Observable<any> {
    const body = { number: card };
    return this.http.delete<any>(this.urlDeleteCreditCard, {
      body: body,
      withCredentials: true,
    });
  }

  getAccountBalance(): Observable<any> {
    return this.http.get<any>(this.urlGetAccountBalance, {
      withCredentials: true,
    });
  }

  validateCard(requestData: any): Observable<any> {
    return this.http.post(this.urlValidateCard, requestData);
  }

  addMoney(amount: number): Observable<any> {
    return this.http.put(
      this.urlDepositFunds,
      { amount },
      { withCredentials: true },
    );
  }

  withdrawMoney(amount: number): Observable<any> {
    return this.http.put(
      this.urlWithdrawFunds,
      { amount },
      { withCredentials: true },
    );
  }

  paymentRequestStripe(amount: number): Observable<any> {
    return this.http.put<string>(
      this.apiUrlPaymentRequest,
      { amount },
      { withCredentials: true },
    );
  }
}
