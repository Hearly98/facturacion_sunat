import { CategoryFilterForm } from '../core/types';
import { FormControl } from '@angular/forms';

export const buildCategoryFilterForm = (): {
  [K in keyof CategoryFilterForm]: FormControl<CategoryFilterForm[K]>;
} => {
  return {
    code: new FormControl(null),
    name: new FormControl(null),
  };
};
