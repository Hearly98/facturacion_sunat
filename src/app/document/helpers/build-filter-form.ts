import { FormControl } from '@angular/forms';
import { FilterForm } from '../core/types/filter-form';

export const buildFilterForm = (): {
  [K in keyof FilterForm]: FormControl<FilterForm[K]>;
} => ({
  nombre: new FormControl(null),
  order: new FormControl('desc'),
});