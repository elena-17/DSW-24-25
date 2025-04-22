import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
@Injectable({
  providedIn: "root",
})
export class FriendshipsService {
  private baseApiUrl = "http://localhost:8000/favorites";
  
  private urlGetNotFavs = `${this.baseApiUrl}/non-favorites/`;
  private urlGetFavs = `${this.baseApiUrl}/`;
  private urlAddFav = `${this.baseApiUrl}/add/`;
  private urlRemoveFav = `${this.baseApiUrl}/remove/`;
  private urlGetAllRelations = `${this.baseApiUrl}/admin/all/`;
  private urlAddRelation = `${this.baseApiUrl}/admin/add/`;
  private urlRemoveRelation = `${this.baseApiUrl}/admin/remove/`;
  
  constructor(private http: HttpClient) {}

  getAllFriendships(): Observable<any> {
    return this.http.get<any>(this.urlGetFavs, {
      withCredentials: true,
    });
  }

  getNonFriendships(): Observable<any> {
    return this.http.get<any>(this.urlGetNotFavs, {
      withCredentials: true,
    });
  }

  addFavorite(email: string): Observable<any> {
    return this.http.post<any>(this.urlAddFav, { email },
       { withCredentials: true });
  }
  
  removeFavorite(email: string): Observable<any> {
    return this.http.request<any>('delete', this.urlRemoveFav, {
      body: { email },
      withCredentials: true,
    });
  }

  getAllRelations(): Observable<any> {
    return this.http.get<any>(this.urlGetAllRelations, {
      withCredentials: true,
    });
  }

  addRelation(data: { user: string; favorite_user: string }): Observable<any> {
    return this.http.post<any>(this.urlAddRelation, data, {
      withCredentials: true,
    });
  }

  removeRelation(data: { user: string; favorite_user: string }): Observable<any> {
    return this.http.request<any>('delete', this.urlRemoveRelation, {
      body: data,
      withCredentials: true,
    });
  }

  
}

 
