import { FilterForm } from '../core/types/filter-form';

export function mapParams(form: Partial<FilterForm>): Partial<FilterForm> {
  return {
    name: form.name?.trim() ?? null,
    categoryId: form.categoryId ?? null,
    active: form.active ?? null,
    order: form.order ?? 'desc',
  };
}
