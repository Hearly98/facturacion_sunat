import { CustomerFilterForm } from "../core/types/filter-form";

export function customerMapFilterParams(
    form: Partial<CustomerFilterForm>
): Record<string, any> {
    const params: Record<string, any> = {};

    if (form.firstName?.trim()) {
        params['nombre'] = form.firstName;  // Map to backend property
    }

    if (form.order) {
        params['order'] = form.order;
    }

    return params;
}