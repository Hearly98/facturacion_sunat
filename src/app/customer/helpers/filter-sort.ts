import { CustomerFilterForm } from "../core/types/filter-form";

export function customerFilterSort(formValue: Partial<CustomerFilterForm>) {
    return [
        {
            property: "nombre",
            direction: formValue.order,
        },
    ];
}
