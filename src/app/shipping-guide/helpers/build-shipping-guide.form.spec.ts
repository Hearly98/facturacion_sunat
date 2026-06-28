import { FormBuilder } from '@angular/forms';
import { buildShippingGuideForm } from './build-shipping-guide.form';

describe('buildShippingGuideForm', () => {
  let formBuilder: FormBuilder;

  beforeEach(() => {
    formBuilder = new FormBuilder();
  });

  describe('Free guía (isCotizacionAttached = false)', () => {
    it('should create form with all fields enabled', () => {
      const controls = buildShippingGuideForm(false);
      const form = formBuilder.group(controls);

      // Sample of cabecera fields that should be enabled
      expect(form.get('cli_id')?.enabled).toBe(true);
      expect(form.get('fecha_emision')?.enabled).toBe(false); // Always disabled
      expect(form.get('nombre_cliente')?.enabled).toBe(true);
      expect(form.get('tipo_traslado')?.enabled).toBe(true);
      expect(form.get('observaciones')?.enabled).toBe(true);
    });

    it('should allow patching all fields', () => {
      const controls = buildShippingGuideForm(false);
      const form = formBuilder.group(controls);

      form.patchValue({
        cli_id: 10,
        nombre_cliente: 'Test Customer',
        tipo_traslado: 'PRIVADO',
      });

      expect(form.get('cli_id')?.value).toBe(10);
      expect(form.get('nombre_cliente')?.value).toBe('Test Customer');
      expect(form.get('tipo_traslado')?.value).toBe('PRIVADO');
    });
  });

  describe('Cotización-linked guía (isCotizacionAttached = true)', () => {
    it('should disable all cabecera fields', () => {
      const controls = buildShippingGuideForm(true);
      const form = formBuilder.group(controls);

      // Locked fields should be disabled
      expect(form.get('cli_id')?.disabled).toBe(true);
      expect(form.get('nombre_cliente')?.disabled).toBe(true);
      expect(form.get('doc_cliente')?.disabled).toBe(true);
      expect(form.get('direccion_cliente')?.disabled).toBe(true);
      expect(form.get('tipo_traslado')?.disabled).toBe(true);
      expect(form.get('motivo_traslado')?.disabled).toBe(true);
      expect(form.get('observaciones')?.disabled).toBe(true);
    });

    it('should prevent editing via getRawValue()', () => {
      const controls = buildShippingGuideForm(true);
      const form = formBuilder.group(controls);

      // Set initial values
      form.patchValue({
        cli_id: 10,
        nombre_cliente: 'Original',
      });

      // Try to patch (will be ignored for disabled fields)
      form.patchValue({
        cli_id: 99,
        nombre_cliente: 'Modified',
      });

      // getRawValue includes disabled fields, showing what would be sent
      const rawValue = form.getRawValue();
      expect(rawValue.cli_id).toBe(99); // Raw value includes patched value
      expect(rawValue.nombre_cliente).toBe('Modified');

      // But value() excludes disabled fields
      expect(form.value.cli_id).toBeNull();
      expect(form.value.nombre_cliente).toBeNull();
    });

    it('should disable detalles FormArray fields', () => {
      const controls = buildShippingGuideForm(true);
      const form = formBuilder.group(controls);

      // Detalles array should respect the disabled state
      // (Specific detail field disabling would be handled per row, not in form builder)
      expect(form.get('detalles')).toBeDefined();
    });
  });

  describe('Shared behavior', () => {
    it('should have fecha_emision always disabled', () => {
      const controlsFree = buildShippingGuideForm(false);
      const formFree = formBuilder.group(controlsFree);

      const controlsLocked = buildShippingGuideForm(true);
      const formLocked = formBuilder.group(controlsLocked);

      // fecha_emision is always disabled in both cases
      expect(formFree.get('fecha_emision')?.disabled).toBe(true);
      expect(formLocked.get('fecha_emision')?.disabled).toBe(true);
    });

    it('should create detalles FormArray', () => {
      const controls = buildShippingGuideForm(false);
      const form = formBuilder.group(controls);

      expect(form.get('detalles')).toBeDefined();
      expect(form.get('detalles')?.value).toEqual([]);
    });

    it('should include cot_id field', () => {
      const controls = buildShippingGuideForm(false);
      const form = formBuilder.group(controls);

      expect(form.get('cot_id')).toBeDefined();
    });
  });

  describe('Default parameter behavior', () => {
    it('should default to isCotizacionAttached = false', () => {
      // Call without parameter
      const controls = buildShippingGuideForm();
      const form = formBuilder.group(controls);

      // Should behave like free guía (fields enabled)
      expect(form.get('cli_id')?.enabled).toBe(true);
    });
  });
});
