import { FilterForm } from '../core/types/filter-form';
import { FormControl } from '@angular/forms';

export const buildRolFilterForm = (): {
  [K in keyof FilterForm]: FormControl<FilterForm[K]>;
} => {
  return {
    name: new FormControl(null),
    order: new FormControl('desc'),
  };
};
