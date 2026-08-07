import { FilterForm } from "../core/types";

export function mapParams(
    form: Partial<FilterForm>
): Partial<FilterForm> {
    return {
        firstName: form.firstName?.trim() ?? null,
        roleId: form.roleId ?? null,
    };
}