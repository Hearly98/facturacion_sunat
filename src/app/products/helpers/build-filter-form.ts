import { FilterForm } from '../core/types/filter-form';
import { FormControl } from '@angular/forms';

export const buildFilterForm = (): {
  [K in keyof FilterForm]: FormControl<FilterForm[K]>;
} => {
  return {
    name: new FormControl(null),
    categoryId: new FormControl(null),
    active: new FormControl(true),
    order: new FormControl('desc'),
  };
};

