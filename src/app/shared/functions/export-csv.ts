/**
 * Exporta un array de objetos a un archivo CSV, con BOM UTF-8 (para que Excel reconozca
 * acentos correctamente) y escapado de comas/comillas/saltos de línea.
 */
export function exportCsv<T extends Record<string, unknown>>(
  rows: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
): void {
  const cols = columns ?? (rows[0] ? Object.keys(rows[0]).map((key) => ({ key: key as keyof T, label: key })) : []);

  const header = cols.map((c) => escapeCsvValue(c.label)).join(',');
  const body = rows.map((row) => cols.map((c) => escapeCsvValue(row[c.key])).join(',')).join('\n');
  const csv = `${header}\n${body}`;

  const BOM = '﻿';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
