import { PurchaseFilterForm } from '../core/types';

export function filterSort(formValue: Partial<PurchaseFilterForm>) {
  return [
    {
      property: 'fecha_emision',
      direction: formValue.order,
    },
  ];
}
