import { FilterForm } from '../core/types/filter-form';
import { FormControl } from '@angular/forms';

export const buildFilterForm = (): {
  [K in keyof FilterForm]: FormControl<FilterForm[K]>;
} => {
  return {
    nombre: new FormControl<string | null>(null),
    codigo: new FormControl<string | null>(null),
    order: new FormControl<string>('desc'),
  };
};
