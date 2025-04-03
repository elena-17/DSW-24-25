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
import { MatSnackBar } from "@angular/material/snack-bar";

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
  form: FormGroup;
  creditForm: FormGroup;
  amountForm: FormGroup;
  dialogTitle: string;
  isCardValidated: boolean = false; // Variable para controlar si el primer botón fue presionado
  emailCtrl = new FormControl("", [Validators.email]);
  creditCards: any[] = []; // Arreglo para guardar las tarjetas de crédito

  constructor(
    private dialogRef: MatDialogRef<ChangeAccountBalanceComponent>,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { title: string },
  ) {
    this.dialogTitle = data.title;

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
    });

    this.form = this.formBuilder.group({
      title: ["", [Validators.required]],
      description: [""],
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
        this.snackBar.open("Failed to load credit cards.", "Close", {
          duration: 2000,
          horizontalPosition: "center",
          verticalPosition: "top",
        });
      },
    });
  }

  validateCard(): void {
    const formData = this.creditForm.value;
    const amount = this.amountForm.value.amount;

    const requestData = {
      card: formData.card,
      cvv: formData.cvv,
      amount: amount,
    };

    this.userService.validateCard(requestData).subscribe({
      next: (response) => {
        if (response.valid) {
          this.isCardValidated = true;
          this.snackBar.open("Card validated successfully!", "Close", {
            duration: 2000,
            horizontalPosition: "center",
            verticalPosition: "top",
          });
        } else {
          this.closeDialog();
          this.snackBar.open(
            response.message || "Card validation failed.",
            "Close",
            {
              duration: 2000,
              horizontalPosition: "center",
              verticalPosition: "top",
            },
          );
        }
      },
      error: (err) => {
        this.closeDialog();
        this.snackBar.open(
          "Card validation failed. Please check your inputs.",
          "Close",
          {
            duration: 2000,
            horizontalPosition: "center",
            verticalPosition: "top",
          },
        );
      },
    });
  }

  onCancel() {
    this.form.reset();
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.creditForm.valid && this.amountForm.valid) {
      const amount = this.amountForm.value.amount;
      this.userService.addMoney(amount).subscribe({
        next: (response) => {
          this.dialogRef.close(response);
        },
        error: (error) => {
          this.dialogRef.close(error);
        },
      });
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
