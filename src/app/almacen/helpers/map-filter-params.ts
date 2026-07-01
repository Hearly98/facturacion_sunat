import { FilterForm } from '../core/types';

export function mapParams(formValue: Partial<FilterForm>) {
    const params: any = {};
    if (formValue.nombre) params.nombre = formValue.nombre;
    if (formValue.sucursalId) params.sucursalId = formValue.sucursalId;
    return params;
}
