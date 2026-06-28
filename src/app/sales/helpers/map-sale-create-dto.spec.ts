import { mapSaleCreateDto } from './map-sale-create-dto';
import { SaleForm } from '../core/types';

describe('mapSaleCreateDto', () => {
  describe('Price inheritance from guía', () => {
    it('should read precio_unitario first (from guía pre-fill)', () => {
      const formValue: Partial<SaleForm> = {
        suc_id: 1,
        almacen_id: 1,
        doc_id: 1,
        emp_id: 1,
        cli_id: 10,
        mp_id: 1,
        mon_id: 1,
        vendedor_id: 1,
        fecha_emision: '2026-06-21',
        venta_coment: '',
        afecta_stock: true,
        guia_id: 5,
        cot_id: null,
        detalles: [
          {
            prod_id: 100,
            cantidad: 5,
            precio_unitario: 50.0, // From guía (cotización-linked)
            precio_venta: null, // Not provided by form
            dscto: 0,
          } as any,
        ] as any,
      };

      const dto = mapSaleCreateDto(formValue as SaleForm);

      expect(dto.detalles[0].prod_pventa).toBe(50.0);
    });

    it('should fallback to precio_venta if precio_unitario is null', () => {
      const formValue: Partial<SaleForm> = {
        suc_id: 1,
        almacen_id: 1,
        doc_id: 1,
        emp_id: 1,
        cli_id: 10,
        mp_id: 1,
        mon_id: 1,
        vendedor_id: 1,
        fecha_emision: '2026-06-21',
        venta_coment: '',
        afecta_stock: true,
        guia_id: null,
        cot_id: null,
        detalles: [
          {
            prod_id: 100,
            cantidad: 1,
            precio_unitario: null, // Not inherited
            precio_venta: 75.5, // User-entered
            dscto: 0,
          } as any,
        ] as any,
      };

      const dto = mapSaleCreateDto(formValue as SaleForm);

      expect(dto.detalles[0].prod_pventa).toBe(75.5);
    });

    it('should handle multiple detalles with mixed sources', () => {
      const formValue: Partial<SaleForm> = {
        suc_id: 1,
        almacen_id: 1,
        doc_id: 1,
        emp_id: 1,
        cli_id: 10,
        mp_id: 1,
        mon_id: 1,
        vendedor_id: 1,
        fecha_emision: '2026-06-21',
        venta_coment: '',
        afecta_stock: true,
        guia_id: 5,
        cot_id: null,
        detalles: [
          {
            prod_id: 100,
            cantidad: 5,
            precio_unitario: 100.0, // From guía
            precio_venta: null,
            dscto: 0,
          } as any,
          {
            prod_id: 101,
            cantidad: 2,
            precio_unitario: 50.0, // From guía (promotional)
            precio_venta: null,
            dscto: 0,
          } as any,
        ] as any,
      };

      const dto = mapSaleCreateDto(formValue as SaleForm);

      expect(dto.detalles[0].prod_pventa).toBe(100.0);
      expect(dto.detalles[1].prod_pventa).toBe(50.0);
    });

    it('should pass through other DTO fields unchanged', () => {
      const formValue: Partial<SaleForm> = {
        suc_id: 2,
        almacen_id: 3,
        doc_id: 4,
        emp_id: 5,
        cli_id: 10,
        mp_id: 6,
        mon_id: 7,
        vendedor_id: 8,
        fecha_emision: '2026-06-21',
        venta_coment: 'Test comment',
        afecta_stock: false,
        guia_id: 5,
        cot_id: null,
        detalles: [
          {
            prod_id: 100,
            cantidad: 1,
            precio_unitario: 50.0,
            precio_venta: null,
            dscto: 5,
          } as any,
        ] as any,
      };

      const dto = mapSaleCreateDto(formValue as SaleForm);

      expect(dto.suc_id).toBe(2);
      expect(dto.almacen_id).toBe(3);
      expect(dto.doc_id).toBe(4);
      expect(dto.emp_id).toBe(5);
      expect(dto.cli_id).toBe(10);
      expect(dto.mp_id).toBe(6);
      expect(dto.mon_id).toBe(7);
      expect(dto.vendedor_id).toBe(8);
      expect(dto.fecha_emision).toBe('2026-06-21');
      expect(dto.venta_coment).toBe('Test comment');
      expect(dto.afecta_stock).toBe(false);
      expect(dto.guia_id).toBe(5);
      expect(dto.cot_id).toBeNull();
      expect(dto.detalles[0].detv_descuento).toBe(5);
    });

    it('should handle zero precio_unitario', () => {
      const formValue: Partial<SaleForm> = {
        suc_id: 1,
        almacen_id: 1,
        doc_id: 1,
        emp_id: 1,
        cli_id: 10,
        mp_id: 1,
        mon_id: 1,
        vendedor_id: 1,
        fecha_emision: '2026-06-21',
        venta_coment: '',
        afecta_stock: true,
        guia_id: 5,
        cot_id: null,
        detalles: [
          {
            prod_id: 100,
            cantidad: 1,
            precio_unitario: 0, // Zero is a valid price
            precio_venta: 100,
            dscto: 0,
          } as any,
        ] as any,
      };

      const dto = mapSaleCreateDto(formValue as SaleForm);

      // 0 is falsy but should be used (0 ?? 100 = 100, but we want 0)
      // This test verifies the ?? operator behavior
      expect(dto.detalles[0].prod_pventa).toBe(0);
    });
  });
});
