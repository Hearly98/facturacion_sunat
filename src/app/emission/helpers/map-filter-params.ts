import { FilterForm } from '../core/types/filter-form';

export function mapFilterParams(form: Partial<FilterForm>): Record<string, any> {
  const params: Record<string, any> = {
    page: form.page,
    limit: form.limit,
  };

  return params;
}
