import { FormControl } from '@angular/forms';
import { UnitOfMeasureFilterForm } from '../core/types';

export const buildUnitOfMeasureFilterForm = (): {
  [K in keyof UnitOfMeasureFilterForm]: FormControl<UnitOfMeasureFilterForm[K]>;
} => {
  return {
    name: new FormControl(null),
  };
};
