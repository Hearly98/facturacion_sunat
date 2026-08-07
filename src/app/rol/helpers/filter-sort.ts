import { FilterForm } from '../core/types/filter-form';

export function rolFilterSort(formValue: Partial<FilterForm>) {
  return [
    {
      property: 'createdAt',
      direction: formValue.order,
    },
  ];
}
