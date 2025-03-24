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
  // Validate if passwords match
  static passwordMatchValidator(
    group: AbstractControl,
  ): ValidationErrors | null {
    const password = group.get("pwd1")?.value;
    const confirmPassword = group.get("pwd2")?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }
}
