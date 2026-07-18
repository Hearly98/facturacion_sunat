import { FilterForm } from "../core/types";

export function filterSort(formValue: Partial<FilterForm>) {
    return [
        {
            property: "firstName",
            direction: "asc",
        },
    ];
}
