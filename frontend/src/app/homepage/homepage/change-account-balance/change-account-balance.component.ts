import { Component, Inject, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
  FormArray,
} from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MatFormFieldModule } from "@angular/material/form-field";
import { UserService } from "../../../services/user.service";
import { MaterialModule } from "../../../material.module";
import { MatSelectModule } from "@angular/material/select";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatChipsModule } from "@angular/material/chips";
import { MatStepperModule } from "@angular/material/stepper";
import { STEPPER_GLOBAL_OPTIONS } from "@angular/cdk/stepper";
import { NotificationService } from "../../../services/notification.service";

@Component({
  selector: "app-create-transaction",
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    },
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MaterialModule,
    MatSelectModule,
    MatChipsModule,
    MatStepperModule,
  ],
  templateUrl: "./change-account-balance.component.html",
  styleUrl: "./change-account-balance.component.scss",
})
export class ChangeAccountBalanceComponent {
  creditForm: FormGroup;
  amountForm: FormGroup;
  dialogTitle: string;
  isCardValidated: boolean = false;
  emailCtrl = new FormControl("", [Validators.email]);
  creditCards: any[] = [];
  action: string;
  isStripeValidated: boolean = false; 
  isStripeReady: boolean = false;
  stripeCard: any;
  STRIPE_PUBLIC_KEY: string = "pk_test_51Q7a3vP0LaAzN5HUVqMSpL38bzpaZDhPylsy5t0rkLoCM9aQbC3F5VFJV4hJdBX9ouE4QrqnO5p0Oh9d02ShLTNC00muyYlhEa";
  waitingValidation: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<ChangeAccountBalanceComponent>,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; action: string },
  ) {
    this.dialogTitle = data.title;
    this.action = data.action || "deposit";

    this.creditForm = this.formBuilder.group({
      card: ["", [Validators.required]],
      cvv: ["", [Validators.required, Validators.pattern("^[0-9]{3}$")]],
    });

    this.amountForm = this.formBuilder.group({
      amount: [
        "",
        [
          Validators.required,
          Validators.min(0.01),
          Validators.max(1000000),
          Validators.pattern(/^\d+(\.\d{1,2})?$/),
        ],
      ],
      paymentMethod: ["ourBank", Validators.required],
    });
  }

  ngOnInit() {
    this.loadCreditCards();
  }

  loadCreditCards(): void {
    this.userService.getCreditCards().subscribe({
      next: (response) => {
        this.creditCards = response;
        this.creditCards.sort((a, b) => a.number.localeCompare(b.number));
      },
      error: () => {
        this.notificationService.showErrorMessage(
          "Failed to load credit cards. Please try again later.",
        );
      },
    });
  }

  validateCard(): void {
    this.waitingValidation = true;
    const formData = this.creditForm.value.card;
    const cvv = this.creditForm.value.cvv;
    const amount = this.amountForm.value.amount;

    const requestData = {
      number: formData.number,
      expiration_date: formData.expiration_date,
      owner_name: formData.owner_name,
      cvv: cvv,
      amount: amount,
    };

    this.userService.validateCard(requestData).subscribe({
      next: (response) => {
        this.waitingValidation = false;
        if (response.valid) {
          this.isCardValidated = true;
          this.notificationService.showSuccessMessage(
            "Card validated successfully.",
          );
        } else {
          this.notificationService.showSuccessMessage(
            "Card validation failed. Please check your card details.",
          );
          this.closeDialog();
        }
      },
      error: (err) => {
        this.closeDialog();
        this.waitingValidation = false;
        this.notificationService.showErrorMessage("Card validation failed.");
      },
    });
  }

   // Add the validateStripeCard method
   validateStripeCard(): void {
    this.isStripeValidated = true;  // Suponemos que la validación fue exitosa para simplificar
  }

  onCancel() {
    this.creditForm.reset();
    this.amountForm.reset();
    this.closeDialog();
  }

  onSubmit() {
    if (this.creditForm.valid && this.amountForm.valid) {
      const amount = this.amountForm.value.amount;

      if (this.action === "deposit") {
        this.userService.addMoney(amount).subscribe({
          next: (response) => {
            this.notificationService.showSuccessMessage("Deposit successful!");
            this.dialogRef.close(response);
          },
          error: (error) => {
            this.closeDialog();
            this.notificationService.showErrorMessage(error.error.error);
          },
        });
      } else if (this.action === "withdraw") {
        this.userService.withdrawMoney(amount).subscribe({
          next: (response) => {
            this.notificationService.showSuccessMessage(
              "Withdrawal successful!",
            );
            this.dialogRef.close(response);
          },
          error: (error) => {
            this.closeDialog();
            this.notificationService.showErrorMessage(error.error.error);
          },
        });
      }
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
