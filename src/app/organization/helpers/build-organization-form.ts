import { FormControl, Validators } from '@angular/forms';
import { OrganizationForm } from '../core/types/organization.form';

export const buildOrganizationForm = (): {
  [K in keyof OrganizationForm]: FormControl<OrganizationForm[K]>;
} => ({
  id: new FormControl(null),
  name: new FormControl(null, Validators.required),
  ruc: new FormControl(null, Validators.required),
  email: new FormControl(null),
  address: new FormControl(null, Validators.required),
  phone: new FormControl(null),
  website: new FormControl(null),
  logo: new FormControl(null),
  status: new FormControl(true),
});