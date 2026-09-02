import { mapSaleCreateDto } from './map-sale-create-dto';
import { SaleForm } from '../core/types';

describe('mapSaleCreateDto', () => {
  describe('Price inheritance from guía', () => {
    it('should read precio_unitario first (from guía pre-fill)', () => {
      const formValue: Partial<SaleForm> = {
        suc_id: 1,
        almacen_id: 1,
        doc_id: 1,
        cli_id: 10,
        mp_cod: 'CASH',
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

      expect(dto.detalles[0].precioVenta).toBe(50.0);
    });

    it('should fallback to precio_venta if precio_unitario is null', () => {
      const formValue: Partial<SaleForm> = {
        suc_id: 1,
        almacen_id: 1,
        doc_id: 1,
        cli_id: 10,
        mp_cod: 'CASH',
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

      expect(dto.detalles[0].precioVenta).toBe(75.5);
    });

    it('should handle multiple detalles with mixed sources', () => {
      const formValue: Partial<SaleForm> = {
        suc_id: 1,
        almacen_id: 1,
        doc_id: 1,
        cli_id: 10,
        mp_cod: 'CASH',
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

      expect(dto.detalles[0].precioVenta).toBe(100.0);
      expect(dto.detalles[1].precioVenta).toBe(50.0);
    });

    it('should pass through other DTO fields unchanged', () => {
      const formValue: Partial<SaleForm> = {
        suc_id: 2,
        almacen_id: 3,
        doc_id: 4,
        cli_id: 10,
        mp_cod: 'CRDT',
        mon_id: 7,
        serie_id: 9,
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

      expect(dto.idSucursal).toBe(2);
      expect(dto.idAlmacen).toBe(3);
      expect(dto.idDocumento).toBe(4);
      expect(dto.idCliente).toBe(10);
      expect(dto.idMetodoPago).toBe('CRDT');
      expect(dto.idMoneda).toBe(7);
      expect(dto.idSerie).toBe(9);
      expect(dto.idUsuario).toBe(8);
      expect(dto.fechaEmision).toBe('2026-06-21');
      expect(dto.comentarios).toBe('Test comment');
      expect(dto.afectaStock).toBe(false);
      expect(dto.idGuia).toBe(5);
      expect(dto.idCotizacion).toBeNull();
      expect(dto.detalles[0].descuento).toBe(5);
    });

    it('should handle zero precio_unitario', () => {
      const formValue: Partial<SaleForm> = {
        suc_id: 1,
        almacen_id: 1,
        doc_id: 1,
        cli_id: 10,
        mp_cod: 'CASH',
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
      expect(dto.detalles[0].precioVenta).toBe(0);
    });
  });
});
