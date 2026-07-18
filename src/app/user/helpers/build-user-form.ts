import { FormControl, Validators } from '@angular/forms';
import { UserForm } from '../core/types';

export const buildUserForm = (): {
  [k in keyof UserForm]: FormControl<UserForm[k]>;
} => {
  return {
    id: new FormControl(null),
    firstName: new FormControl(null, [Validators.required, Validators.minLength(3)]),
    lastName: new FormControl(null, [Validators.required, Validators.minLength(3)]),
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, Validators.required),
    dni: new FormControl(null, [Validators.required]),
    phone: new FormControl(null, [Validators.required]),
    roleId: new FormControl(null),
    image: new FormControl(null),
    active: new FormControl(true),
  };
};
