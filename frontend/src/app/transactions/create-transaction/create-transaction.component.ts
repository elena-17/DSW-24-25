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
  templateUrl: "./create-transaction.component.html",
  styleUrl: "./create-transaction.component.scss",
})
export class CreateTransactionComponent {
  form: FormGroup;
  contactForm: FormGroup;
  dialogTitle: string;
  emailCtrl = new FormControl("", [Validators.email]);
  emails: string[] = [];

  constructor(
    private dialogRef: MatDialogRef<CreateTransactionComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { title: string },
  ) {
    this.dialogTitle = data.title;

    this.contactForm = this.formBuilder.group({
      contact: ["", [Validators.required, Validators.email]],
    });

    this.form = this.formBuilder.group({
      amount: [
        "",
        [
          Validators.required,
          Validators.min(0.01),
          Validators.max(1000000),
          Validators.pattern(/^\d+(\.\d{1,2})?$/),
        ],
      ],
      title: ["", [Validators.required]],
      description: [""],
    });
  }

  onCancel() {
    this.form.reset();
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.contactForm.valid && this.form.valid) {
      const formData = {
        user: [this.contactForm.value.contact],
        ...this.form.value,
      };
      console.log("Datos del envío:", formData);
      // Aquí puedes procesar los datos, llamar a un servicio, etc.
      this.dialogRef.close(formData);
    }
  }

  //CHECK this
  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (control?.hasError("required")) {
      return "You must enter a value";
    } else if (control?.hasError("email")) {
      return "Not a valid email";
    } else if (control?.hasError("min")) {
      return "Amount must be greater than 0";
    }
    return "";
  }
}
