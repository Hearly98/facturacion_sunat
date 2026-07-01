import { FormControl, Validators } from '@angular/forms';
import { DocumentTypeForm } from '../core/types/document-type-form';

export const buildDocumentTypeForm = (): {
  [K in keyof DocumentTypeForm]: FormControl<DocumentTypeForm[K]>;
} => {
  return {
    id: new FormControl(null),
    codigo: new FormControl(null, Validators.compose([Validators.required])),
    descripcion: new FormControl(null),
    nombre: new FormControl(
      null,
      Validators.compose([Validators.compose([Validators.required, Validators.minLength(3)])]),
    ),
  };
};
