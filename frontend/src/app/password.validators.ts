import { AbstractControl, ValidationErrors } from "@angular/forms";

export class PasswordValidators {
  // Validate password strength (uppercase, lowercase, numeric)
  static passwordStrengthValidator(
    control: AbstractControl,
  ): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]+/.test(value);
    const hasLowerCase = /[a-z]+/.test(value);
    const hasNumeric = /[0-9]+/.test(value);

    return !(hasUpperCase && hasLowerCase && hasNumeric)
      ? { passwordStrength: true }
      : null;
  }
}
