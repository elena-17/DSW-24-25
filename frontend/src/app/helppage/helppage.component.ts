import {
  ChangeDetectionStrategy,
  Component,
  signal,
  NgModule,
} from "@angular/core";
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { AuthorComponent } from "./author/author.component";
import { MatCardModule } from "@angular/material/card";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-helppage",
  imports: [
    ToolbarComponent,
    AuthorComponent,
    MatCardModule,
    MatExpansionModule,
    MatIconModule,
    CommonModule,
  ],
  templateUrl: "./helppage.component.html",
  styleUrl: "./helppage.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelppageComponent {
  readonly panelOpenState = signal(false);

  constructor() {}

  faqs = [
    {
      question: "How do I reset my password?",
      answer:
        'Go to the login page and click on "Forgot Password". Enter your email, you will receive a message and follow the instructions.',
      panelOpenState: signal(false),
    },
    {
      question: "Why is my transaction pending?",
      answer: "A transaction is pending if it needs approval",
      panelOpenState: signal(false),
    },
    {
      question: "How can I filter transactions?",
      answer:
        "Use the button at bottom right side that opens a filter panel to search by date, amount, status, or user.",
      panelOpenState: signal(false),
    },
    {
      question: "Can I cancel a transaction?",
      answer:
        'You can cancel a transaction if it has not yet been approved. Go to "pending" and click on the "Cancel" button next to the transaction. Be aware that this action is irreversible.',
      panelOpenState: signal(false),
    },
    {
      question: 'What does "pending my approval" mean?',
      answer:
        "It means the transaction requires your action to be approved or rejected.",
      panelOpenState: signal(false),
    },
    {
      question: "How do I block a user?",
      answer:
        'When you cancel a transaction, you will be prompted to block the user. You can also go to "Friends" section and select the user you want to block.',
      panelOpenState: signal(false),
    },
  ];
}
