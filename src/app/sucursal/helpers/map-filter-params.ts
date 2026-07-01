import { FilterForm } from '../core/types';

export function mapParams(form: Partial<FilterForm>): Partial<FilterForm> {
  return {
    nombre: form.nombre?.trim() ?? null,
  };
}
