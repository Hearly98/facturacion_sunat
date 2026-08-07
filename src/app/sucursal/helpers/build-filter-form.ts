import { FormControl } from '@angular/forms';
import { FilterForm } from '../core/types';

export const buildFilterForm = (): {
  [K in keyof FilterForm]: FormControl<FilterForm[K]>;
} => {
  return {
    name: new FormControl(null),
  };
};
