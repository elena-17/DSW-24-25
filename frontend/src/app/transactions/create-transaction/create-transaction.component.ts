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
import { FriendshipsService } from "../../services/friendships.service";
import { map, Observable, of, startWith } from "rxjs";

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
  favorites: any[] = [];
  filteredFavorites!: Observable<any[]>;
  selectedContacts: string[] = [];
  admin: boolean = false;
  isDivide: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<CreateTransactionComponent>,
    private formBuilder: FormBuilder,
    private friendsService: FriendshipsService,
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
      this.contactForm = this.formBuilder.group(
        {
          contact: [""],
        },
        {
          validators: this.validateAtLeastOneContact,
        },
      );
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

  validateAtLeastOneContact = () => {
    return this.selectedContacts.length < 1
      ? { noContactSelected: true }
      : null;
  };

  ngOnInit() {
    if (!this.admin) {
      this.friendsService.getAllFriendships().subscribe((res) => {
        this.favorites = res;
      });

      // Filtrar los favoritos mientras escribimos
      this.contactForm
        .get("contact")
        ?.valueChanges.pipe(
          startWith(""),
          map((value) => this._filterFavorites(value)),
        )
        .subscribe((filtered) => {
          this.filteredFavorites = of(filtered);
        });
    }
  }

  private _filterFavorites(value: string): any[] {
    const filterValue = value;
    return this.favorites.filter(
      (user) =>
        user.email.includes(filterValue) ||
        user.name.includes(filterValue) ||
        user.phone.includes(filterValue),
    );
  }

  // Agregar más usuarios
  addMoreContacts(selectedEmail: string) {
    if (
      selectedEmail &&
      Validators.email(new FormControl(selectedEmail)) === null &&
      !this.selectedContacts.includes(selectedEmail)
    ) {
      this.selectedContacts.push(selectedEmail);
      this.contactForm.reset();
    }
  }

  // Cuando seleccionas un contacto del autocompletado o presionas Enter
  onAutocompleteSelect(event: any) {
    this.addMoreContacts(event.option.value);
    this.filteredFavorites = (
      this.contactForm.get("contact")?.valueChanges || of("")
    ).pipe(
      startWith(""),
      map((value) => this._filterFavorites(value || "")),
    );
  }

  onEnterPressed(event: KeyboardEvent) {
    event.preventDefault();
    const inputValue = this.contactForm.get("contact")?.value;
    if (inputValue) {
      this.addMoreContacts(inputValue);
    }
  }

  onBlurInput() {
    const inputValue = this.contactForm.get("contact")?.value;
    if (inputValue) {
      this.addMoreContacts(inputValue);
    }
  }

  // Eliminar un contacto de la lista seleccionada
  removeContact(email: any) {
    this.selectedContacts = this.selectedContacts.filter((e) => e !== email);
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
          : { user: this.selectedContacts }),
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
    return this.isDivide ? this.selectedContacts.length + 1 : 1;
  }

  get amountPerPerson() {
    return this.splitCount > 0
      ? (this.totalAmount / this.splitCount).toFixed(2)
      : "0.00";
  }
}
