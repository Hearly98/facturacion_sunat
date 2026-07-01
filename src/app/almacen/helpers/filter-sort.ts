import { FilterForm } from '../core/types';

export function filterSort(formValue: Partial<FilterForm>) {
    return [
        {
            property: "createdAt",
            direction: formValue.order || 'desc',
        },
    ];
}
