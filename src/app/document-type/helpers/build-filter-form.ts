import { DocumentTypeFilterForm } from '../core/types/filter-form';
import { FormControl } from '@angular/forms';

export const buildDocumentTypeFilterForm = (): {
  [K in keyof DocumentTypeFilterForm]: FormControl<DocumentTypeFilterForm[K]>;
} => {
  return {
    name: new FormControl(null),
    order: new FormControl('desc'),
  };
};
