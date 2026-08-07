import { FormControl, Validators } from '@angular/forms';

export function buildSerieForm() {
  return {
    code: new FormControl<string | null>(null, [Validators.required]),
    number: new FormControl<string | null>(null, [Validators.required]),
    counter: new FormControl<number | null>(1, [Validators.required, Validators.min(1)]),
  };
}
