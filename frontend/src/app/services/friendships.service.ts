import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
@Injectable({
  providedIn: "root",
})
export class FriendshipsService {
  private baseApiUrl = "http://localhost:8000/favorites";
  private urlFriendsGetAllSorted = `${this.baseApiUrl}/users/`;
  private urlGetFavs = `${this.baseApiUrl}/`;
  private urlAddFav = `${this.baseApiUrl}/add`;
  private urlRemoveFav = `${this.baseApiUrl}/remove`;
  constructor(private http: HttpClient) {}

  getAllFriendships(): Observable<any> {
    return this.http.get<any>(this.urlFriendsGetAllSorted, {
      withCredentials: true,
    });
  }
}
