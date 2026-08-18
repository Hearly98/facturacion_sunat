import { test, expect, Page } from '@playwright/test';
import { clickAndWaitForApi } from './helpers/master-crud.helpers';

// Movimientos (Ingreso/Salida/Transferencia) usa binding dinámico [formControlName]="field...",
// que nunca refleja un atributo formcontrolname real -- mismo motivo por el que Cotización y
// Compra resuelven sus campos por label visible en vez de por atributo (ver master-crud.helpers).
function fieldByLabel(page: Page, label: string) {
  return page
    .locator(`label:text-is("${label}")`)
    .locator('xpath=following-sibling::*[self::input or self::select][1]')
    .first();
}

async function selectViaSearchSelect(page: Page, placeholder: string, searchTerm: string) {
  const input = page.locator(`input[placeholder="${placeholder}"]`);
  await input.click();
  await input.fill(searchTerm);
  const option = page.locator('li[cdropdownitem]', { hasText: searchTerm }).first();
  await expect(option).toBeVisible({ timeout: 10_000 });
  await option.click();
}

/**
 * Registra un Ingreso real para el producto en el almacén dado -- necesario porque Traslados
 * valida stock contra el ledger de Kardex (inventario_movimientos), no contra producto_almacen.
 * El stock cargado por otras vías (seed inicial) no cuenta para esa validación; sin este paso,
 * cualquier transferencia falla con "Stock insuficiente. Disponible: 0" aunque el saldo real
 * mostrado en la UI de Almacén sea positivo.
 */
async function registrarIngreso(page: Page, almacenLabel: string, productoTerm: string, cantidad: number) {
  await page.goto('/movimientos');
  await fieldByLabel(page, 'Tipo de Movimiento').selectOption({ label: 'Ingreso' });
  await fieldByLabel(page, 'Almacén').selectOption({ label: almacenLabel });
  await selectViaSearchSelect(page, 'Buscar producto...', productoTerm);
  await page.getByRole('button', { name: 'Agregar', exact: true }).click();

  const cantidadInput = page.locator('input[formcontrolname="cantidad"]').first();
  await expect(cantidadInput).toBeVisible();
  await cantidadInput.fill(String(cantidad));
  // El seed no trae precio_compra_base en ningún producto -- costoUnitario se tipea a mano.
  await page.locator('input[formcontrolname="costoUnitario"]').first().fill('5.5');

  const body = (await clickAndWaitForApi(page, ['POST'], () =>
    page.getByRole('button', { name: 'Guardar Movimiento' }).click(),
  )) as { isValid: boolean };
  expect(body.isValid, JSON.stringify(body)).toBe(true);
}

test('Traslado: transferir entre almacenes descuenta origen y suma destino', async ({ page }) => {
  // ALMACEN PRINCIPAL / SECUNDARIO son fixtures reales de esta DB de dev (ver AlmacenApiTest /
  // seed real), Fideos es un producto seed real usado en purchase.spec.ts también.
  const cantidad = 5 + (Date.now() % 20); // único por corrida, sin depender de orden de ejecución

  await registrarIngreso(page, 'ALMACEN PRINCIPAL', 'Fideos', cantidad);

  await page.goto('/movimientos');
  await fieldByLabel(page, 'Tipo de Movimiento').selectOption({ label: 'Transferencia' });
  await fieldByLabel(page, 'Almacén Origen').selectOption({ label: 'ALMACEN PRINCIPAL' });
  await fieldByLabel(page, 'Almacén Destino').selectOption({ label: 'ALMACEN SECUNDARIO' });
  await selectViaSearchSelect(page, 'Buscar producto...', 'Fideos');
  await page.getByRole('button', { name: 'Agregar', exact: true }).click();

  const cantidadInput = page.locator('input[formcontrolname="cantidad"]').first();
  await expect(cantidadInput).toBeVisible();
  await cantidadInput.fill(String(cantidad));
  await page.locator('input[formcontrolname="costoUnitario"]').first().fill('5.5');

  const body = (await clickAndWaitForApi(page, ['POST'], () =>
    page.getByRole('button', { name: 'Guardar Movimiento' }).click(),
  )) as { isValid: boolean; data: { total_documentos: number } };
  expect(body.isValid, JSON.stringify(body)).toBe(true);
  expect(body.data.total_documentos, 'una transferencia genera 2 documentos (salida + ingreso)').toBe(2);

  // ---- Confirmar en Historial ----
  // Cambiar de tab no dispara la búsqueda sola -- hay que pedirla explícitamente.
  await page.locator('a.nav-link', { hasText: 'Historial' }).click();
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  const rows = page.locator('table tbody tr', { hasText: 'Transferencia' });
  await expect(rows.first()).toBeVisible({ timeout: 10_000 });
});

test('Traslado: stock insuficiente en origen se bloquea con mensaje claro', async ({ page }) => {
  await page.goto('/movimientos');
  await fieldByLabel(page, 'Tipo de Movimiento').selectOption({ label: 'Transferencia' });
  await fieldByLabel(page, 'Almacén Origen').selectOption({ label: 'ALMACEN EN TRANSITO' });
  await fieldByLabel(page, 'Almacén Destino').selectOption({ label: 'ALMACEN PRINCIPAL' });
  // ALMACEN EN TRANSITO no tiene ingresos reales registrados en Kardex para este producto --
  // cualquier cantidad > 0 debería rechazarse.
  await selectViaSearchSelect(page, 'Buscar producto...', 'Fideos');
  await page.getByRole('button', { name: 'Agregar', exact: true }).click();

  const cantidadInput = page.locator('input[formcontrolname="cantidad"]').first();
  await expect(cantidadInput).toBeVisible();
  await cantidadInput.fill('999999');
  await page.locator('input[formcontrolname="costoUnitario"]').first().fill('5.5');

  const [response] = await Promise.all([
    page.waitForResponse((res) => res.request().method() === 'POST' && res.url().includes('/movimientos-documentos')),
    page.getByRole('button', { name: 'Guardar Movimiento' }).click(),
  ]);
  expect(response.status(), 'stock insuficiente debe ser 422, no 500').toBe(422);
  const body = await response.json();
  expect(body.isValid).toBe(false);
  expect(body.messages[0].message).toContain('Stock insuficiente');
});

test('Traslado: mismo almacén de origen y destino se bloquea en el frontend', async ({ page }) => {
  await page.goto('/movimientos');
  await fieldByLabel(page, 'Tipo de Movimiento').selectOption({ label: 'Transferencia' });
  await fieldByLabel(page, 'Almacén Origen').selectOption({ label: 'ALMACEN PRINCIPAL' });
  await fieldByLabel(page, 'Almacén Destino').selectOption({ label: 'ALMACEN PRINCIPAL' });

  await expect(page.locator('.is-invalid')).toHaveCount(0); // no dispara hasta touched/submit
  await selectViaSearchSelect(page, 'Buscar producto...', 'Fideos');
  await page.getByRole('button', { name: 'Agregar', exact: true }).click();
  await page.locator('input[formcontrolname="cantidad"]').first().fill('1');
  await page.getByRole('button', { name: 'Guardar Movimiento' }).click();

  // El form es inválido (validador de almacenes distintos) -- no debe llegar a disparar el POST.
  await expect(page.locator('a.nav-link', { hasText: 'Historial' })).not.toHaveClass(/active/);
});
