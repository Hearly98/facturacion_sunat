import { test, expect, Page } from '@playwright/test';
import { unique, clickAndWaitForApi } from './helpers/master-crud.helpers';

// Igual que quotation.spec.ts: Compra no es el patrón de modal compartido, es una página
// completa con tabs (Nueva Compra / Historial) más una vista de edición independiente.
function fieldByLabel(page: Page, label: string) {
  return page
    .locator(`label:text-is("${label}")`)
    .locator('xpath=following-sibling::*[self::input or self::select or self::textarea][1]')
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
 * Crea una compra a crédito con un costo único por corrida (para poder distinguir la fila propia
 * en esta DB de dev real/persistente — Compra no genera un numero_completo único como Cotización,
 * así que el total hace de identificador). Devuelve el id y el total tal como los ve el usuario.
 */
async function crearCompraCredito(page: Page) {
  await page.goto('/compras');

  await fieldByLabel(page, 'Tipo Documento').selectOption({ index: 1 });
  await fieldByLabel(page, 'Tipo de Pago').selectOption({ label: 'CREDITO' });
  await fieldByLabel(page, 'Moneda').selectOption({ index: 1 });
  await selectViaSearchSelect(page, 'Proveedor', 'Distribuidora ABC');

  await page.locator('select[formcontrolname="suc_id"]').selectOption({ index: 1 });
  await page.locator('select[formcontrolname="almacen_id"]').selectOption({ index: 1 });
  await selectViaSearchSelect(page, 'Producto', 'Arroz');

  await page.getByRole('button', { name: 'Agregar Producto', exact: true }).click();
  await expect(page.locator('input[formcontrolname="cantidad"]').first()).toBeVisible();
  const uniqueCost = 100 + (Date.now() % 500);
  await page.locator('input[formcontrolname="costo_unitario"]').first().fill(String(uniqueCost));

  const createBody = (await clickAndWaitForApi(page, ['POST'], () =>
    page.getByRole('button', { name: 'Guardar Compra', exact: true }).click(),
  )) as {
    isValid: boolean;
    data: { id: number; estado_id: number; total: string; monto_pendiente: string };
  };
  expect(createBody.isValid, JSON.stringify(createBody)).toBe(true);
  expect(createBody.data.estado_id, 'crédito debe nacer Pendiente (estado_id 1)').toBe(1);

  return {
    id: createBody.data.id,
    totalStr: Number(createBody.data.total).toFixed(2),
    montoPendiente: Number(createBody.data.monto_pendiente),
  };
}

test('Compra: crear a crédito, listar y editar mientras está Pendiente', async ({ page }) => {
  const { id: purchaseId, totalStr } = await crearCompraCredito(page);

  // ---- Listar / buscar ----
  await expect(page.locator('a.nav-link', { hasText: 'Historial' })).toHaveClass(/active/, {
    timeout: 10_000,
  });
  await page.locator('[formcontrolname="nombre"]').fill('Distribuidora ABC');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  const row = page.locator('table tbody tr').filter({ hasText: 'Distribuidora ABC' }).filter({ hasText: totalStr });
  await expect(row).toBeVisible({ timeout: 10_000 });
  await expect(row).toContainText('Pendiente');

  // ---- Editar (vista independiente) mientras está Pendiente sin pagos ----
  await row.locator('button').nth(1).click(); // print, edit, (delete solo si pendiente)
  await expect(page).toHaveURL(new RegExp(`/compras/${purchaseId}/editar`), { timeout: 10_000 });
  await expect(page.getByRole('button', { name: 'Guardar Cambios' })).toBeVisible();

  const comentario = unique('E2E compra editada ');
  await page.locator('textarea[formcontrolname="compr_coment"]').fill(comentario);
  const updateBody = (await clickAndWaitForApi(page, ['PUT'], () =>
    page.getByRole('button', { name: 'Guardar Cambios' }).click(),
  )) as { isValid: boolean };
  expect(updateBody.isValid, JSON.stringify(updateBody)).toBe(true);

  // save() navega de vuelta a /compras?tab=history, que aterriza directo en Historial (a
  // diferencia de Cotización, donde save() vive en la misma página).
  await expect(page).toHaveURL(/\/compras\?tab=history/, { timeout: 10_000 });
  await expect(page.locator('a.nav-link', { hasText: 'Historial' })).toHaveClass(/active/);
});

test('Compra: pago parcial bloquea edición, completar pago transiciona a Completado', async ({ page }) => {
  // Compra propia, nunca editada: PurchaseDetailTableComponent.recalculate() tiene un bug de
  // fórmula de IGV (documentado, fuera de alcance de esta sesión) que compone sobre sí mismo cada
  // vez que se reabre y reguarda el detalle — reabrir esta MISMA compra en el otro test para
  // editarla dejaría el total inservible para probar montos de pago. Se prueba en una compra
  // separada, tocada una sola vez (al crearla), para no pisar ese bug.
  const { id: purchaseId, montoPendiente } = await crearCompraCredito(page);

  await page.goto(`/compras/${purchaseId}/editar`);
  await expect(page.getByRole('button', { name: 'Guardar Cambios' })).toBeVisible();

  const montoParcial = Math.round((montoPendiente / 2) * 100) / 100;

  await page.locator('#monto').fill(String(montoParcial));
  await page.locator('#metodo').selectOption({ label: 'Efectivo' });
  const pagoParcialBody = (await clickAndWaitForApi(page, ['POST'], () =>
    page.getByRole('button', { name: 'Registrar Pago' }).click(),
  )) as { isValid: boolean };
  expect(pagoParcialBody.isValid, JSON.stringify(pagoParcialBody)).toBe(true);

  // El submit recarga la compra: ahora En Pago, formulario principal ya no editable — solo se
  // puede seguir pagando (regla de negocio de esta sesión).
  await expect(page.locator('.badge', { hasText: 'En Pago' })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole('button', { name: 'Guardar Cambios' })).toHaveCount(0);

  // ---- Completar el pago restante: debe pasar a Completado ----
  // No se reutiliza el montoRestante precalculado: registrar el pago parcial ya disparó un
  // reload de la compra, y el pendiente real que quedó vivo en pantalla es la única fuente de
  // verdad confiable (evita arrastrar imprecisión de punto flotante de los cálculos locales).
  const montoRestante = Number(await page.locator('[data-testid="monto-pendiente"]').innerText());
  await page.locator('#monto').fill(String(montoRestante));
  await page.locator('#metodo').selectOption({ label: 'Efectivo' });
  const pagoFinalBody = (await clickAndWaitForApi(page, ['POST'], () =>
    page.getByRole('button', { name: 'Registrar Pago' }).click(),
  )) as { isValid: boolean };
  expect(pagoFinalBody.isValid, JSON.stringify(pagoFinalBody)).toBe(true);

  await expect(page.locator('h4 .badge', { hasText: 'Completado' })).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('text=Esta compra no admite más pagos')).toBeVisible();

  // Historial de pagos muestra ambos, con snapshot del banco del proveedor en banco destino.
  await expect(page.locator('table').last().locator('tbody tr')).toHaveCount(2);
});

test('Compra: contado nace Completada y no admite edición ni pagos', async ({ page }) => {
  await page.goto('/compras');

  await fieldByLabel(page, 'Tipo Documento').selectOption({ index: 1 });
  await fieldByLabel(page, 'Tipo de Pago').selectOption({ label: 'CONTADO' });
  await fieldByLabel(page, 'Moneda').selectOption({ index: 1 });
  await selectViaSearchSelect(page, 'Proveedor', 'Distribuidora ABC');

  await page.locator('select[formcontrolname="suc_id"]').selectOption({ index: 1 });
  await page.locator('select[formcontrolname="almacen_id"]').selectOption({ index: 1 });
  await selectViaSearchSelect(page, 'Producto', 'Arroz');
  await page.getByRole('button', { name: 'Agregar Producto', exact: true }).click();
  await page.locator('input[formcontrolname="costo_unitario"]').first().fill('50');

  const createBody = (await clickAndWaitForApi(page, ['POST'], () =>
    page.getByRole('button', { name: 'Guardar Compra', exact: true }).click(),
  )) as { isValid: boolean; data: { id: number; estado_id: number } };
  expect(createBody.isValid, JSON.stringify(createBody)).toBe(true);
  expect(createBody.data.estado_id, 'contado debe autocompletarse (estado_id 2)').toBe(2);

  await page.goto(`/compras/${createBody.data.id}/editar`);
  await expect(page.locator('.alert-warning')).toContainText('no se puede editar');
  await expect(page.getByRole('button', { name: 'Guardar Cambios' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Registrar Pago' })).toHaveCount(0);
});

test('Compra: efectivo también autocompleta la compra al crearla', async ({ page }) => {
  await page.goto('/compras');

  await fieldByLabel(page, 'Tipo Documento').selectOption({ index: 1 });
  await fieldByLabel(page, 'Tipo de Pago').selectOption({ label: 'EFECTIVO' });
  await fieldByLabel(page, 'Moneda').selectOption({ index: 1 });
  await selectViaSearchSelect(page, 'Proveedor', 'Distribuidora ABC');

  await page.locator('select[formcontrolname="suc_id"]').selectOption({ index: 1 });
  await page.locator('select[formcontrolname="almacen_id"]').selectOption({ index: 1 });
  await selectViaSearchSelect(page, 'Producto', 'Arroz');
  await page.getByRole('button', { name: 'Agregar Producto', exact: true }).click();
  await page.locator('input[formcontrolname="costo_unitario"]').first().fill('75');

  const createBody = (await clickAndWaitForApi(page, ['POST'], () =>
    page.getByRole('button', { name: 'Guardar Compra', exact: true }).click(),
  )) as { isValid: boolean; data: { estado_id: number; monto_pendiente: string } };
  expect(createBody.isValid, JSON.stringify(createBody)).toBe(true);
  expect(createBody.data.estado_id, 'efectivo debe autocompletarse igual que contado (estado_id 2)').toBe(2);
  expect(Number(createBody.data.monto_pendiente)).toBe(0);
});
