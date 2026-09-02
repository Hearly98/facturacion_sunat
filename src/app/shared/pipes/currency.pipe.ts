import { Pipe, PipeTransform } from '@angular/core';

const DEFAULT_SYMBOL = 'S/';

/**
 * Formatea un monto con el símbolo de moneda REAL (`Moneda.simbolo`, ej. 'S/' o '$'),
 * no un símbolo hardcodeado. `Moneda.codigo` no está poblado hoy (gap conocido en
 * MonedaSeeder), así que se formatea manualmente en vez de usar
 * Intl.NumberFormat({ currency: codigo }), que necesitaría un código ISO confiable.
 *
 * `symbol` es opcional: si el DTO que consume este pipe todavía no trae el símbolo de
 * moneda (ver ROADMAP.md — el modelo de Venta no lo trae end-to-end aún), cae a Soles.
 */
@Pipe({ name: 'appCurrency', standalone: true })
export class CurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined, symbol?: string | null): string {
    const amount = value ?? 0;
    const formatted = new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

    return `${symbol || DEFAULT_SYMBOL} ${formatted}`;
  }
}
