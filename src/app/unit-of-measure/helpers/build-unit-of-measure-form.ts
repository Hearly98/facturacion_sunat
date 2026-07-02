import { UnitOfMeasureForm } from "../core/types";
import { FormControl, Validators } from "@angular/forms";

export const buildUnitOfMeasureForm = (): {
    [K in keyof UnitOfMeasureForm]: FormControl<UnitOfMeasureForm[K]>
} =>
{
  return {
    id: new FormControl(null),
    codigo: new FormControl(null, Validators.compose([
      Validators.required
    ])),
    nombre: new FormControl(null, Validators.compose([
      Validators.required, Validators.minLength(3)
    ])),
    abreviatura: new FormControl(null, Validators.compose([
      Validators.required, Validators.minLength(2)
    ]))
  };
}

