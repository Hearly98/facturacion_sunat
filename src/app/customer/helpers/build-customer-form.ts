import { FormControl, Validators } from '@angular/forms';
import { CustomerForm } from '../core/types/customer-form';

export const buildCustomerForm = (): {
  [K in keyof CustomerForm]: FormControl<CustomerForm[K]>;
} => {
  return {
    id: new FormControl(null),
    companyId: new FormControl(null),
    firstName: new FormControl(null),
    lastName: new FormControl(null),
    businessName: new FormControl(null),
    documentTypeId: new FormControl(null, Validators.required),
    document: new FormControl(null, Validators.required),
    phone: new FormControl(null),
    address: new FormControl(null),
    email: new FormControl(null, Validators.email),
    ubigeoCode: new FormControl(null),
  };
};
