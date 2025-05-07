import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { BehaviorSubject, Observable, combineLatest, forkJoin } from "rxjs";
import { tap } from "rxjs/operators";

interface Transaction {
  id: number;
  user: string; //name or email
  date: string;
  amount: number;
  title: string;
  status: string;
}

@Injectable({
  providedIn: "root",
})
export class TransactionsService {
  private loading = new BehaviorSubject<boolean>(false);

  private baseApiUrl = "http://localhost:8000/transactions";

  private urlSendMoney = `${this.baseApiUrl}/send-money/`;
  private urlRequestMoney = `${this.baseApiUrl}/request-money/`;
  private urlAdminTransactions = `${this.baseApiUrl}/admin/`;
  private urlPendingTransactions = `${this.baseApiUrl}/pending/`;
  private urlAdminCreateTransaction = `${this.baseApiUrl}/admin/create/`;
  private urlReceiveCode = `${this.baseApiUrl}/send-confirmation-code/`;
  private urlConfirmCode = `${this.baseApiUrl}/confirm-code/`;

  constructor(private http: HttpClient) {}

  getTransactions(params: {
    status?: string;
    type?: string;
    min_amount?: number;
    max_amount?: number;
    title?: string;
    user?: string;
    date_start?: string;
    date_end?: string;
    limit?: number;
    offset?: number;
    pending_type?: any;
  }): Observable<any> {
    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        httpParams = httpParams.set(key, value);
      }
    });
    return this.http.get<any>(`${this.baseApiUrl}/`, {
      params: httpParams,
      withCredentials: true,
    });
  }

  getLoading(): Observable<boolean> {
    return this.loading.asObservable();
  }

  sendMoney(
    receivers: string[],
    amount: number,
    title: string,
    description?: string,
  ): Observable<any> {
    const payload = {
      receivers: Array.isArray(receivers) ? receivers : [receivers],
      amount,
      title,
      description,
    };

    return this.http
      .post<any>(this.urlSendMoney, payload)
      .pipe(tap((response) => {}));
  }

  requestMoney(
    senders: string[],
    amount: number,
    title: string,
    description?: string,
  ): Observable<any> {
    const payload = {
      senders: Array.isArray(senders) ? senders : [senders],
      amount,
      title,
      description,
    };

    return this.http.post<any>(this.urlRequestMoney, payload);
  }

  updateTransaction(transactionId: number, status: string): Observable<any> {
    const payload = { status };
    return this.http
      .put<any>(`${this.baseApiUrl}/${transactionId}/update-status/`, payload)
      .pipe(tap((response) => {}));
  }

  getAdminTransactions(params: {
    seller?: boolean;
    status?: string;
    type?: string;
    min_amount?: number;
    max_amount?: number;
    title?: string;
    user?: string;
    date_start?: string;
    date_end?: string;
    limit?: number;
    offset?: number;
  }): Observable<any> {
    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        httpParams = httpParams.set(key, value);
      }
    });

    return this.http.get<any>(this.urlAdminTransactions, {
      params: httpParams,
      withCredentials: true,
    });
  }

  updateAdminTransaction(
    transactionId: number,
    status: string,
  ): Observable<any> {
    const payload = { status };
    return this.http.patch<any>(
      `${this.urlAdminTransactions}${transactionId}/`,
      payload,
      { withCredentials: true },
    );
  }

  getPendingTransactions(): Observable<any> {
    return this.http.get<any>(this.urlPendingTransactions, {
      withCredentials: true,
    });
  }

  createAdminTransaction(
    sender: string,
    receiver: string,
    amount: number,
    title: string,
    type?: string,
    description?: string,
  ): Observable<any> {
    const transaction = {
      sender,
      receiver,
      amount,
      title,
      description,
      type,
    };
    return this.http.post<any>(this.urlAdminCreateTransaction, transaction, {
      withCredentials: true,
    });
  }

  sendConfirmationCode(email: string, confirmationToken: string) {
    return this.http.post<any>(this.urlReceiveCode, {
      email,
      confirmationToken,
    });
  }

  confirmTransactionCode(data: {
    receiver: string;
    sender: string;
    code: string;
  }) {
    return this.http.post(this.urlConfirmCode, data);
  }
}
