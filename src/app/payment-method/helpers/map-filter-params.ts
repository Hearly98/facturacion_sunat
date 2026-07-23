import { FilterForm } from '../core/types/filter-form';

export function mapParams(form: Partial<FilterForm>): Record<string, any> {
  const params: Record<string, any> = {};

  if (form.code?.trim()) {
    params['codigo'] = form.code.trim();
  }

  if (form.name?.trim()) {
    params['nombre'] = form.name.trim();
  }

  if (form.order) {
    params['order'] = form.order;
  }

  return params;
}
