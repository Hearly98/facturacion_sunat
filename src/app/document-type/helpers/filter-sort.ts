import { DocumentTypeFilterForm } from "../core/types/filter-form";

export function documentTypeFilterSort(formValue: Partial<DocumentTypeFilterForm>) {
    return [
        {
            property: "nombre",
            direction: formValue.order,
        },
    ];
}
