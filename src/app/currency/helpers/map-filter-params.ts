import { FilterForm } from '../core/types/filter-form';

export function mapParams(form: Partial<FilterForm>): Record<string, any> {
  const params: Record<string, any> = {};

  if (form.name?.trim()) {
    params['nombre'] = form.name.trim();
  }

  return params;
}
