import { FormControl } from '@angular/forms';
import { BancoFilterForm } from '../core/types';

export const buildBancoFilterForm = (): {
  [K in keyof BancoFilterForm]: FormControl<BancoFilterForm[K]>;
} => {
  return {
    name: new FormControl<string | null>(null),
    accountNumber: new FormControl<string | null>(null),
  };
};
