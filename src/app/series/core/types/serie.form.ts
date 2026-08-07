import { FormControl } from '@angular/forms';

export type SerieForm = {
  code: FormControl<string | null>;
  number: FormControl<string | null>;
  counter: FormControl<number | null>;
};
