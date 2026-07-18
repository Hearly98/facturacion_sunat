import { RolForm } from '../core/types/rol-form';
import { FormControl, Validators } from '@angular/forms';

export const buildRolForm = (): {
  [K in keyof RolForm]: FormControl<RolForm[K]>;
} => {
  return {
    id: new FormControl(null),
    name: new FormControl(
      null,
      Validators.compose([Validators.required, Validators.minLength(3)]),
    ),
    active: new FormControl(true),
  };
};
