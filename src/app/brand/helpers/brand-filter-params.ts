import { BrandFilterForm } from '../core/types/brand-form';

export function brandMapFilterParams(formValue: BrandFilterForm): Record<string, any> {
  const params: Record<string, any> = {};

  if (formValue.name?.trim()) {
    params['nombre'] = formValue.name;
  }

  if (formValue.code?.trim()) {
    params['codigo'] = formValue.code;
  }

  return params;
}

export function brandFilterSort(): Record<string, any> {
  const sort: Record<string, any> = {};
  return sort;
}
