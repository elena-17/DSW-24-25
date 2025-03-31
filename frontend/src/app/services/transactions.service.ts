import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, forkJoin } from "rxjs";
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
  private loadingSender = new BehaviorSubject<boolean>(false);
  private loadingReceiver = new BehaviorSubject<boolean>(false);
  private baseApiUrl = "http://localhost:8000/transacciones";
  //check if this is the correct url
  private urlSender = `${this.baseApiUrl}/transactions/sender`;
  private urlReceiver = `${this.baseApiUrl}/transactions/receiver`;

  constructor(private http: HttpClient) {}

  fetch(): Observable<any> {
    if (!this.receiver.value || !this.sender.value) {
      this.loading.next(true); // Iniciar loading

      return forkJoin({
        receiver: this.http.get<Transaction[]>(this.urlReceiver),
        sender: this.http.get<Transaction[]>(this.urlSender),
      }).pipe(
        tap({
          next: ({ receiver, sender }) => {
            this.receiver.next(receiver);
            this.sender.next(sender);
            this.loading.next(false);
          },
        }),
      );
    }
    return forkJoin({
      sender: this.sender.asObservable(),
      receiver: this.receiver.asObservable(),
    });
  }

  fetchReceiver(): Observable<any> {
    if (!this.receiver.value) {
      this.loadingReceiver.next(true);

      return this.http.get<any>(this.urlReceiver).pipe(
        tap((transactions) => {
          this.receiver.next(transactions);
          this.loadingReceiver.next(false);
        }),
      );
    } else {
      return this.receiver.asObservable();
    }
  }

  getSender(): Observable<any> {
    return this.sender.asObservable();
  }

  getLoading(): Observable<boolean> {
    return this.loading.asObservable();
  }
}
