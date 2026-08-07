import { FormControl } from '@angular/forms';
import { FilterForm } from '../core/types';

export const buildFilterForm = (): {
  [k in keyof FilterForm]: FormControl<FilterForm[k]>;
} => {
  return {
    roleId: new FormControl(null),
    firstName: new FormControl(null),
  };
};
