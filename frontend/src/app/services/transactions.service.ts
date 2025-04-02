import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
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
  private sender = new BehaviorSubject<any>(null);
  private receiver = new BehaviorSubject<any>(null);
  private loading = new BehaviorSubject<boolean>(false);

  private baseApiUrl = "http://localhost:8000/transactions";

  private urlSender = `${this.baseApiUrl}/sender/`;
  private urlReceiver = `${this.baseApiUrl}/receiver/`;
  private urlSendMoney = `${this.baseApiUrl}/send-money/`;
  private urlRequestMoney = `${this.baseApiUrl}/request-money/`;

  constructor(private http: HttpClient) {}

  fetch(refresh: boolean = true): Observable<any> {
    this.loading.next(true);

    return forkJoin({
      receiver: this.http.get<Transaction[]>(this.urlReceiver),
      sender: this.http.get<Transaction[]>(this.urlSender),
    }).pipe(
      tap({
        next: ({ receiver, sender }) => {
          this.receiver.next([...receiver]);
          this.sender.next([...sender]);
          this.loading.next(false);
        },
        complete: () => {
          this.loading.next(false);
        },
      }),
    );
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

    return this.http.post<any>(this.urlSendMoney, payload).pipe(
      tap((response) => {
        console.log("Money sent successfully:", response);
      }),
    );
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

    return this.http.post<any>(this.urlRequestMoney, payload).pipe(
      tap((response) => {
        console.log("Money requested successfully:", response);
      }),
    );
  }

  updateTransaction(transactionId: number, status: string): Observable<any> {
    const payload = { status };
    return this.http
      .put<any>(`${this.baseApiUrl}/${transactionId}/`, payload)
      .pipe(
        tap((response) => {
          console.log("Transaction updated successfully:", response);
        }),
      );
  }
}
