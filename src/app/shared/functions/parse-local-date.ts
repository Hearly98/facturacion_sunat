/**
 * Parsea un string 'YYYY-MM-DD' como medianoche en hora LOCAL, no UTC.
 *
 * `new Date('2026-08-01')` lo interpreta el motor JS como medianoche UTC -- en Perú
 * (GMT-5) eso se muestra como el día anterior (2026-07-31). Mismo patrón que ya usa
 * `date-range-picker.utils.ts::fromInputDateFormat`, centralizado acá para el resto
 * de la app (ver bug real en purchase-edit.page.ts, corregido junto con este util).
 */
export const parseLocalDate = (value: string | null | undefined): Date | null => {
  if (!value) return null;

  const datePart = value.split('T')[0];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return null;

  const date = new Date(`${datePart}T00:00:00`);
  return isNaN(date.getTime()) ? null : date;
};
