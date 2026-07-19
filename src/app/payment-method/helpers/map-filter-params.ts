import { FilterForm } from '../core/types/filter-form';

export function mapParams(form: Partial<FilterForm>): Partial<FilterForm> {
  return {
    code: form.code?.trim() ?? null,
    name: form.name?.trim() ?? null,
    order: form.order ?? null,
  };
}
