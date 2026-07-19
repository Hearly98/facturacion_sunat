import { CategoryForm } from '../core/types';
import { FormControl, Validators } from '@angular/forms';

export const buildCategoryForm = (): {
  [K in keyof CategoryForm]: FormControl<CategoryForm[K]>;
} => {
  return {
    id: new FormControl(null),
    code: new FormControl(null, Validators.required),
    name: new FormControl(null, Validators.required),
  };
};
