import { FilterForm } from '../core/types/filter-form';

export interface EmissionFilterParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export function mapFilterParams(form: Partial<FilterForm>): EmissionFilterParams {
  const params: EmissionFilterParams = {
    page: form.page,
    limit: form.limit,
  };

  if (form.status) {
    params.status = form.status;
  }

  if (form.searchTerm) {
    params.search = form.searchTerm;
  }

  return params;
}
