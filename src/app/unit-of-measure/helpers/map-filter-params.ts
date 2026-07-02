import { FilterForm } from '../core/types/filter-form';

export function mapParams(form: Partial<FilterForm>): Partial<FilterForm> {
  return {
    nombre: form.nombre?.trim() ?? null,
    order: form.order ?? null,
  };
}
