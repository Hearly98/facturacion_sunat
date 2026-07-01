import { FilterForm } from '../core/types';

export function filterSort(formValue: Partial<FilterForm>) {
    return [
        {
            property: "nombre",
            direction: formValue.order,
        },
    ];
}
