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
  static passwordMismatchValidator(
    passwordField: string,
    confirmPasswordField: string,
  ) {
    return (group: AbstractControl): ValidationErrors | null => {
      const password = group.get(passwordField)?.value;
      const confirmPassword = group.get(confirmPasswordField)?.value;

      if (password && confirmPassword && password !== confirmPassword) {
        group.get(confirmPasswordField)?.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      } else {
        group.get(confirmPasswordField)?.setErrors(null);
        return null;
      }
    };
  }
}
