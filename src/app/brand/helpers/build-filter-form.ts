import { FormControl } from '@angular/forms';
import { BrandFilterForm } from '../core/types';

export const builBrandFilterForm = (): {
  [K in keyof BrandFilterForm]: FormControl<BrandFilterForm[K]>;
} => {
  return {
    name: new FormControl<string | null>(null),
    code: new FormControl<string | null>(null),
  };
};
