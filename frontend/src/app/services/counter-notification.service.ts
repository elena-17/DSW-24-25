import { Injectable, NgZone } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { NotificationService } from "./notification.service";

@Injectable({
  providedIn: "root",
})
export class CounterNotificationService {
  private _pendingCount = new BehaviorSubject<number>(0);
  public pendingCount$ = this._pendingCount.asObservable();

  private eventSource?: EventSource;

  constructor(
    private notificationService: NotificationService,
    private ngZone: NgZone,
  ) {}

  startListening() {
    const userEmail = sessionStorage.getItem("userEmail");
    if (!userEmail) return;

    this.eventSource = new EventSource(
      `http://localhost:3000/.well-known/mercure?topic=user/${userEmail}`,
    );

    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.ngZone.run(() => {
        this.increment();
        this.notificationService.showSuccessMessage(
          "New transaction request received. Check transactions menu.",
        );
        console.log("Notification received:", data);
      });
    };

    this.eventSource.onerror = (error) => {
      console.error("Error en Mercure:", error);
    };
  }

  stopListening() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
    }
  }

  setPendingCount(count: number) {
    this._pendingCount.next(count);
  }

  increment() {
    this._pendingCount.next(this._pendingCount.value + 1);
  }

  decrement() {
    const newVal = Math.max(0, this._pendingCount.value - 1);
    this._pendingCount.next(newVal);
  }
}
