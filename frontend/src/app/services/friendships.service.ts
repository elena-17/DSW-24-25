import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class FriendshipsService {
  private baseApiUrlFavs = environment.apiUrl + "/favorites";
  private baseApiUrlBlocks = environment.apiUrl + "/blocks";

  private urlGetNotFavs = `${this.baseApiUrlFavs}/non-favorites/`;
  private urlGetFavs = `${this.baseApiUrlFavs}/`;
  private urlAddFav = `${this.baseApiUrlFavs}/add/`;
  private urlRemoveFav = `${this.baseApiUrlFavs}/remove/`;
  private urlGetAllRelations = `${this.baseApiUrlFavs}/admin/all/`;
  private urlAddRelation = `${this.baseApiUrlFavs}/admin/add/`;
  private urlRemoveRelation = `${this.baseApiUrlFavs}/admin/remove/`;

  private urlGetNotBlocks = `${this.baseApiUrlBlocks}/non-blocked/`;
  private urlGetBlocks = `${this.baseApiUrlBlocks}/`;
  private urlAddBlock = `${this.baseApiUrlBlocks}/block/`;
  private urlRemoveBlock = `${this.baseApiUrlBlocks}/unblock/`;
  private urlGetAllBlocks = `${this.baseApiUrlBlocks}/admin/all/`;
  private urlAddBlockRelation = `${this.baseApiUrlBlocks}/admin/add/`;
  private urlRemoveBlockRelation = `${this.baseApiUrlBlocks}/admin/remove/`;

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
    return this.http.post<any>(
      this.urlAddFav,
      { email },
      { withCredentials: true },
    );
  }

  removeFavorite(email: string): Observable<any> {
    return this.http.request<any>("delete", this.urlRemoveFav, {
      body: { email },
      withCredentials: true,
    });
  }

  getAllRelations(
    pageIndex: number,
    pageSize: number,
  ): Observable<{ data: any[]; total: number }> {
    const params = {
      offset: (pageIndex * pageSize).toString(),
      limit: pageSize.toString(),
    };
    return this.http.get<{ data: any[]; total: number }>(
      this.urlGetAllRelations,
      {
        params,
        withCredentials: true,
      },
    );
  }

  addRelation(data: { user: string; favorite_user: string }): Observable<any> {
    return this.http.post<any>(this.urlAddRelation, data, {
      withCredentials: true,
    });
  }

  removeRelation(data: {
    user: string;
    favorite_user: string;
  }): Observable<any> {
    return this.http.request<any>("delete", this.urlRemoveRelation, {
      body: data,
      withCredentials: true,
    });
  }

  getBlockedUsers(): Observable<any> {
    return this.http.get<any>(this.urlGetBlocks, {
      withCredentials: true,
    });
  }

  getUnblockedUsers(): Observable<any> {
    return this.http.get<any>(this.urlGetNotBlocks, {
      withCredentials: true,
    });
  }

  blockUser(email: string): Observable<any> {
    return this.http.post<any>(
      this.urlAddBlock,
      { email },
      { withCredentials: true },
    );
  }

  unblockUser(email: string): Observable<any> {
    return this.http.request<any>("delete", this.urlRemoveBlock, {
      body: { email },
      withCredentials: true,
    });
  }

  getAllBlocks(
    pageIndex: number,
    pageSize: number,
  ): Observable<{ data: any[]; total: number }> {
    const params = {
      offset: (pageIndex * pageSize).toString(),
      limit: pageSize.toString(),
    };
    return this.http.get<{ data: any[]; total: number }>(this.urlGetAllBlocks, {
      params,
      withCredentials: true,
    });
  }

  addBlockRelation(data: {
    user: string;
    blocked_user: string;
  }): Observable<any> {
    return this.http.post<any>(this.urlAddBlockRelation, data, {
      withCredentials: true,
    });
  }

  removeAddRelation(data: {
    user: string;
    blocked_user: string;
  }): Observable<any> {
    return this.http.request<any>("delete", this.urlRemoveBlockRelation, {
      body: data,
      withCredentials: true,
    });
  }
}
