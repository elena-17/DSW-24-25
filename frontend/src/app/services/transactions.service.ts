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
  
  private baseApiUrl = "http://localhost:8000/transactions";

  private urlSender = `${this.baseApiUrl}/sender/`;
  private urlReceiver = `${this.baseApiUrl}/receiver/`;
  private urlSendMoney = `${this.baseApiUrl}/send-money/`;
  private urlRequestMoney = `${this.baseApiUrl}/request-money/`;

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
            console.log("Receiver-:", receiver);
            console.log("Sender-:", sender);

            this.receiver.next([...receiver]);
            this.sender.next([...sender]);
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

  sendMoney(receivers: string[], amount: number, title: string, description?: string): Observable<any> {
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

  requestMoney(senders: string[], amount: number, title: string, description?: string): Observable<any> {
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
}
