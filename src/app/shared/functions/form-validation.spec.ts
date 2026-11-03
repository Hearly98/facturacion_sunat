import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { findMissingFields, focusFirstInvalid } from './form-validation';

describe('findMissingFields', () => {
  const build = () =>
    new FormGroup({
      nombre: new FormControl('', Validators.required),
      ruc: new FormControl('20100070970', Validators.required),
      bloqueado: new FormControl({ value: '', disabled: true }, Validators.required),
      detalles: new FormArray([
        new FormGroup({ cantidad: new FormControl(0, Validators.min(1)), und_id: new FormControl(null, Validators.required) }),
      ]),
    });

  it('devuelve la etiqueta de cada control inválido en el orden del mapa de etiquetas', () => {
    const missing = findMissingFields(build(), { ruc: 'RUC', nombre: 'Nombre' });

    expect(missing).toEqual(['Nombre']);
  });

  it('ignora los controles deshabilitados aunque sean inválidos', () => {
    expect(findMissingFields(build(), { bloqueado: 'Bloqueado' })).toEqual([]);
  });

  it('describe las líneas del detalle inválidas con su número de fila', () => {
    const missing = findMissingFields(build(), {}, {
      arrayName: 'detalles',
      rowLabel: (i: number) => `Producto ${i + 1}`,
      labels: { cantidad: 'cantidad mayor a 0', und_id: 'unidad de medida' },
    });

    expect(missing).toEqual(['Producto 1: cantidad mayor a 0, unidad de medida']);
  });
});

describe('focusFirstInvalid', () => {
  it('enfoca el primer input inválido y lo trae a la vista', () => {
    const host = document.createElement('div');
    host.innerHTML = `
      <input id="ok" class="form-control ng-valid" />
      <select id="malo" class="form-select ng-invalid"></select>
      <input id="malo2" class="form-control ng-invalid" />`;
    document.body.appendChild(host);
    const select = host.querySelector<HTMLSelectElement>('#malo')!;
    spyOn(select, 'scrollIntoView');

    const enfocado = focusFirstInvalid(host);

    expect(enfocado).toBe(select);
    expect(document.activeElement).toBe(select);
    expect(select.scrollIntoView).toHaveBeenCalled();
    host.remove();
  });

  it('devuelve null si no hay nada inválido', () => {
    const host = document.createElement('div');
    host.innerHTML = '<input class="form-control ng-valid" />';

    expect(focusFirstInvalid(host)).toBeNull();
  });
});
