import { CustomerFilterForm } from '../core/types/filter-form';
import { FormControl } from '@angular/forms';

export const buildCustomerFilterForm = (): {
  [K in keyof CustomerFilterForm]: FormControl<CustomerFilterForm[K]>;
} => {
  return {
    firstName: new FormControl(null),
    order: new FormControl('desc')
  };
};
