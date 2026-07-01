import { FormControl, Validators } from '@angular/forms';
import { CustomerForm } from '../core/types/customer-form';

export const buildCustomerForm = (): {
  [K in keyof CustomerForm]: FormControl<CustomerForm[K]>;
} => {
  return {
    id: new FormControl(null),
    nombre: new FormControl(
      null,
      Validators.compose([Validators.required, Validators.minLength(3)]),
    ),
    tipoDocumentoId: new FormControl(null, Validators.required),
    documento: new FormControl(null, Validators.required),
    telefono: new FormControl(null, Validators.required),
    direccion: new FormControl(null),
    email: new FormControl(null, Validators.compose([Validators.required, Validators.email])),
    empresaId: new FormControl(null),
    apellido: new FormControl(null),
    razonSocial: new FormControl(null),
    departamento: new FormControl(null),
    provincia: new FormControl(null),
    distrito: new FormControl(null),
    codigoUbigeo: new FormControl(null),
  };
};
