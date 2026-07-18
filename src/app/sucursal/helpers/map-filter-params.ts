import { FilterForm } from '../core/types';

export function mapParams(form: Partial<FilterForm>): Partial<FilterForm> {
  return {
    name: form.name?.trim() ?? null,
  };
}
