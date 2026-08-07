import { FormBuilder, FormGroup } from '@angular/forms';
import { FilterForm } from '../core/types/filter-form';

export function buildFilterForm(formBuilder: FormBuilder): FormGroup<any> {
  return formBuilder.group<FilterForm>({
    status: null,
    searchTerm: null,
    page: 1,
    limit: 10,
  });
}
