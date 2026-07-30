export interface RegisterPaymentDto {
  monto: number;
  metodo: string;
  observacion?: string | null;
  fecha_pago?: string | null;
  banco_id?: number | null;
  referencia_externa?: string | null;
}
