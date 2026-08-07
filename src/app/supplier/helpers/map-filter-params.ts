import { FilterForm } from "../core/types/filter-form";

export function mapParams(
    form: Partial<FilterForm>
): Record<string, any> {
    return {
        nombre: form.name?.trim() ?? null,
        order: form.order ?? null,
    };
}