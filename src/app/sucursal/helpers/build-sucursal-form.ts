import { FormControl, Validators } from '@angular/forms';
import { SucursalForm } from '../core/types';

export const buildSucursalForm = (): {
  [K in keyof SucursalForm]: FormControl<SucursalForm[K]>;
} => {
  return {
    id: new FormControl(null),
    empresaId: new FormControl(null),
    codigo: new FormControl(null),
    nombre: new FormControl(
      null,
      Validators.compose([Validators.required, Validators.minLength(3)]),
    ),
    ubigeo: new FormControl(null),
    direccion: new FormControl(null),
    departamento: new FormControl(null),
    provincia: new FormControl(null),
    distrito: new FormControl(null),
  };
};
