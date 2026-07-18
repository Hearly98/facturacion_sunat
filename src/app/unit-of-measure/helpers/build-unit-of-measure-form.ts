import { UnitOfMeasureForm } from "../core/types";
import { FormControl, Validators } from "@angular/forms";

export const buildUnitOfMeasureForm = (): {
    [K in keyof UnitOfMeasureForm]: FormControl<UnitOfMeasureForm[K]>
} =>
{
  return {
    id: new FormControl(null),
    code: new FormControl(null, Validators.compose([
      Validators.required
    ])),
    name: new FormControl(null, Validators.compose([
      Validators.required, Validators.minLength(3)
    ])),
    abbreviation: new FormControl(null, Validators.compose([
      Validators.required, Validators.minLength(2)
    ]))
  };
}

