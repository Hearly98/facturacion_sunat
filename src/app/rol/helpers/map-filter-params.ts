import { FilterForm } from '../core/types/filter-form';

export function mapFilterParams(form: Partial<FilterForm>): Partial<FilterForm> {
  return {
    name: form.name?.trim() ?? null,
    order: form.order ?? 'desc',
  };
}
