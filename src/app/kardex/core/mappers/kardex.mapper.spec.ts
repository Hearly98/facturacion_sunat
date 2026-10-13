import { KardexDto } from '../dto/kardex.dto';
import { KardexMapper } from './kardex.mapper';

describe('KardexMapper', () => {
  const dto: KardexDto = {
    producto_id: 5,
    almacen_id: 2,
    saldo_inicial: 45,
    stock_final: 52,
    movimientos: [
      {
        id: 1,
        fecha: '2026-10-05 10:00:00',
        tipo_codigo: 'ENTRADA',
        tipo_descripcion: 'Entrada de inventario',
        afectacion_stock: 1,
        cantidad: 10,
        costo_unitario: null,
        referencia: 'Compra F001-1',
        usuario_nombre: 'Ana Pérez',
        transferencia_id: null,
        saldo_acumulado: 55,
      },
      {
        id: 2,
        fecha: '2026-10-06 10:00:00',
        tipo_codigo: 'SALIDA',
        tipo_descripcion: 'Salida de inventario',
        afectacion_stock: -1,
        cantidad: 3,
        costo_unitario: null,
        referencia: 'Venta B001-9',
        usuario_nombre: null,
        transferencia_id: null,
        saldo_acumulado: 52,
      },
    ],
  };

  it('maps balances and movements', () => {
    const kardex = KardexMapper.fromApi(dto);

    expect(kardex.openingBalance).toBe(45);
    expect(kardex.finalStock).toBe(52);
    expect(kardex.movements.map((m) => m.balance)).toEqual([55, 52]);
    expect(kardex.movements[0].typeDescription).toBe('Entrada de inventario');
    expect(kardex.movements[0].userName).toBe('Ana Pérez');
  });

  it('signs the quantity with the stock direction of the movement type', () => {
    const [entrada, salida] = KardexMapper.fromApi(dto).movements;

    expect(entrada.signedQuantity).toBe(10);
    expect(salida.signedQuantity).toBe(-3);
  });
});
