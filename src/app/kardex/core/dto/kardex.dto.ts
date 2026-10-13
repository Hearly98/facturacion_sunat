export interface KardexMovementDto {
  id: number;
  fecha: string;
  tipo_codigo: string | null;
  tipo_descripcion: string | null;
  afectacion_stock: -1 | 0 | 1;
  cantidad: number;
  costo_unitario: number | null;
  referencia: string;
  usuario_nombre: string | null;
  transferencia_id: number | null;
  saldo_acumulado: number;
}

export interface KardexDto {
  producto_id: number;
  almacen_id: number;
  saldo_inicial: number;
  stock_final: number;
  movimientos: KardexMovementDto[];
}
