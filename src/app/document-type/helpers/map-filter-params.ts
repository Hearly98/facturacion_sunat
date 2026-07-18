import { DocumentTypeFilterForm } from '../core/types/filter-form';

export function documentTypeMapFilterParams(form: Partial<DocumentTypeFilterForm>): Record<string, any> {
  const params: Record<string, any> = {};

  if (form.name?.trim()) {
    params['nombre'] = form.name;
  }

  if (form.order) {
    params['order'] = form.order;
  }

  return params;
}
