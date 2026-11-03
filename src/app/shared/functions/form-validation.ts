import { AbstractControl, FormArray } from '@angular/forms';

export interface DetailRowLabels {
  /** Nombre del FormArray dentro del form (p. ej. 'detalles'). */
  arrayName: string;
  /** Cómo nombrar la fila para el usuario: "Producto 2", o el nombre del producto. */
  rowLabel: (index: number, row: AbstractControl) => string;
  /** Etiqueta legible de cada control de la fila que puede quedar inválido. */
  labels: Record<string, string>;
}

/**
 * Lista, en lenguaje del usuario, qué falta para poder guardar. Ignora los controles
 * deshabilitados: un campo bloqueado no es algo que el usuario pueda corregir.
 */
export function findMissingFields(
  form: AbstractControl,
  labels: Record<string, string>,
  detail?: DetailRowLabels,
): string[] {
  const missing = Object.entries(labels)
    .filter(([path]) => {
      const control = form.get(path);
      return !!control && control.enabled && control.invalid;
    })
    .map(([, label]) => label);

  if (detail) {
    const rows = form.get(detail.arrayName) as FormArray | null;
    rows?.controls.forEach((row, index) => {
      const problems = Object.entries(detail.labels)
        .filter(([name]) => {
          const control = row.get(name);
          return !!control && control.enabled && control.invalid;
        })
        .map(([, label]) => label);
      if (problems.length > 0) {
        missing.push(`${detail.rowLabel(index, row)}: ${problems.join(', ')}`);
      }
    });
  }

  return missing;
}

/**
 * Lleva al usuario al primer campo inválido: scroll hasta él y focus. Llamar después de
 * markAllAsTouched() y de que Angular haya aplicado las clases ng-invalid (setTimeout 0).
 */
export function focusFirstInvalid(root: HTMLElement): HTMLElement | null {
  const target = root.querySelector<HTMLElement>(
    'input.ng-invalid:not([disabled]), select.ng-invalid:not([disabled]), textarea.ng-invalid:not([disabled]), app-ubigeo-picker.ng-invalid button',
  );
  if (!target) return null;

  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  target.focus({ preventScroll: true });
  return target;
}
