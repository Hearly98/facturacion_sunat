import { environment } from 'src/environments/environment';

const EXENTOS = ['20', '30'];

/**
 * La cotización (y la guía, que copia su precio) guarda el precio SIN IGV; la venta espera
 * precioVenta CON IGV (el backend separa base e IGV dividiendo entre 1.18). Al importar hay
 * que convertir, o la factura cobra ~15% menos que lo cotizado. Exonerados/inafectos no
 * llevan IGV.
 */
export function precioConIgv(precioSinIgv: number, afectacionIgv: string | null | undefined): number {
  if (EXENTOS.includes(afectacionIgv ?? '')) return round2(precioSinIgv);
  // environment.igv es el factor (1.18), no la tasa.
  return round2(precioSinIgv * (environment.igv ?? 1.18));
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
