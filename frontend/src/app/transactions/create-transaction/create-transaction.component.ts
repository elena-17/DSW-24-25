import { Component, Inject } from "@angular/core";
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

import { MaterialModule } from "../../material.module";
import { MatSelectModule } from "@angular/material/select";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatChipsModule } from "@angular/material/chips";
import { MatStepperModule } from "@angular/material/stepper";
import { STEPPER_GLOBAL_OPTIONS } from "@angular/cdk/stepper";
import { MatRadioModule } from "@angular/material/radio";

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
    MatRadioModule,
  ],
  templateUrl: "./create-transaction.component.html",
  styleUrl: "./create-transaction.component.scss",
})
export class CreateTransactionComponent {
  form: FormGroup;
  contactForm: FormGroup;
  amountForm: FormGroup;
  dialogTitle: string;
  emailCtrl = new FormControl("", [Validators.email]);
  emails: string[] = [];
  admin: boolean = false;
  isDivide: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<CreateTransactionComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA)
    public data: { title: string; admin: boolean; divide: boolean },
  ) {
    this.dialogTitle = data.title;
    this.admin = data.admin;
    this.isDivide = data.divide;

    if (this.admin) {
      this.contactForm = this.formBuilder.group({
        sender: ["", [Validators.required, Validators.email]],
        receiver: ["", [Validators.required, Validators.email]],
      });
    } else {
      this.contactForm = this.formBuilder.group({
        contact: ["", [Validators.required, Validators.email]],
      });
    }
    this.amountForm = this.formBuilder.group({
      amount: [
        "",
        [
          Validators.required,
          Validators.min(0.01),
          Validators.max(500),
          Validators.pattern(/^\d+(\.\d{1,2})?$/),
        ],
      ],
    });

    if (this.admin) {
      this.amountForm.addControl(
        "type",
        new FormControl("send", [Validators.required]),
      );
    }

    this.form = this.formBuilder.group({
      title: ["", [Validators.required, Validators.maxLength(100)]],
      description: [""],
    });
  }

  onCancel() {
    this.form.reset();
    this.contactForm.reset();
    this.amountForm.reset();
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.contactForm.valid && this.form.valid) {
      const formData = {
        amount: this.isDivide
          ? this.amountPerPerson
          : this.amountForm.value.amount,
        type: this.admin ? this.amountForm.value.type : "send",
        ...this.form.value,
        ...(this.admin
          ? {
              sender: this.contactForm.value.sender,
              receiver: this.contactForm.value.receiver,
            }
          : { user: [this.contactForm.value.contact] }),
      };
      this.dialogRef.close(formData);
    }
  }

  private createEmailControl(): FormControl {
    return new FormControl("", [Validators.required, Validators.email]);
  }

  get totalAmount() {
    return this.amountForm.get("amount")?.value || 0;
  }

  get splitCount() {
    if (!this.isDivide) {
      return 1;
    }
    if (this.contactForm.get("contact")?.value) {
      return 1 + 1;
    }
    return 0;
  }

  get amountPerPerson() {
    return this.splitCount > 0
      ? (this.totalAmount / this.splitCount).toFixed(2)
      : "0.00";
  }
}
