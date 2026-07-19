import { FormControl, Validators } from '@angular/forms';
import { DocumentForm } from '../core/types/document.form';

export const buildDocumentForm = (): {
  [K in keyof DocumentForm]: FormControl<DocumentForm[K]>;
} => ({
  id: new FormControl(null),
  name: new FormControl(
    null,
    Validators.compose([Validators.required, Validators.minLength(3)]),
  ),
  code: new FormControl(
    null,
    Validators.compose([Validators.required, Validators.minLength(2)]),
  ),
});
