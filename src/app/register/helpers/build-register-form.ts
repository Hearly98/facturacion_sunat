import { AbstractControl, FormControl, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { RegisterForm } from "../core/types/register-form";

export const passwordsMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmation = control.get('password_confirmation')?.value;

    if (!password || !confirmation || password === confirmation) return null;

    return { passwordsMismatch: true };
}

export const buildRegisterForm = (): {
    [K in keyof RegisterForm]: FormControl<RegisterForm[K]>;
} => {
    return {
        nombre: new FormControl(null, Validators.compose([Validators.required])),
        apellido: new FormControl(null, Validators.compose([Validators.required])),
        email: new FormControl(null, Validators.compose([Validators.required, Validators.email])),
        password: new FormControl(null, Validators.compose([Validators.required, Validators.minLength(8)])),
        password_confirmation: new FormControl(null, Validators.compose([Validators.required])),
        nombre_empresa: new FormControl(null, Validators.compose([Validators.required])),
        ruc: new FormControl(null, Validators.compose([Validators.required, Validators.maxLength(11)])),
    }
}
