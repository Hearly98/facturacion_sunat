import { CategoryFilterForm } from '../core/types';

export function categoryMapFilterParams(formValue: CategoryFilterForm): Record<string, any> {
  const params: Record<string, any> = {};

  if (formValue.code?.trim()) {
    params['codigo'] = formValue.code;
  }

  if (formValue.name?.trim()) {
    params['nombre'] = formValue.name;
  }

  return params;
}
