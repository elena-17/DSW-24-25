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

  private urlUserProfile = `${this.baseApiUrl}/profile/`;
  private urlUpdateUserProfile = `${this.baseApiUrl}/profile/update/`;
  private urlDeleteUserAccount = `${this.baseApiUrl}/profile/delete/`;
  private urlChangePassword = `${this.baseApiUrl}/profile/password/`;

  // URL for credit cards
  private urlAddCreditCard = `${this.creditApiUrl}/create/`;
  private urlUpdateCreditCard = `${this.creditApiUrl}/update/`;
  private urlDeleteCreditCard = `${this.creditApiUrl}/delete/`;
  private urlGetCreditCards = `${this.creditApiUrl}/`;

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
    const body = { number: card }; // Asegúrate de enviar el cuerpo con el número de tarjeta
    return this.http.delete<any>(this.urlDeleteCreditCard, {
      body: body, // Aquí se pasa el cuerpo de la solicitud
      withCredentials: true,
    });
  }
}
