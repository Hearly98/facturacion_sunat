import { test, expect, Page } from '@playwright/test';
import { clickAndWaitForApi } from './helpers/master-crud.helpers';

// Venta no usa el patrón de modal compartido: es una página completa con tabs (Nueva Venta /
// Historial), como Cotización y Compra. El form group (buildSaleForm) no tiene Validators.required
// en ningún control -- el botón "Guardar Venta" solo se deshabilita si detailsArray está vacío --
// así que la validación real de campos obligatorios vive 100% en el backend (StoreVentaRequest).

async function selectViaSearchSelect(page: Page, placeholder: string, searchTerm: string) {
  const input = page.locator(`input[placeholder="${placeholder}"]`);
  await input.click();
  await input.fill(searchTerm);
  const option = page.locator('li[cdropdownitem]', { hasText: searchTerm }).first();
  await expect(option).toBeVisible({ timeout: 10_000 });
  await option.click();
}

async function fillVentaBase(page: Page) {
  await page.goto('/ventas');

  await page.locator('#emp_id').selectOption({ index: 1 });
  await page.locator('#doc_id').selectOption({ index: 1 });
  await page.locator('#suc_id').selectOption({ index: 1 });
  await page.locator('#almacen_id').selectOption({ index: 1 });
  await page.locator('#mon_id').selectOption({ index: 1 });
  await page.locator('#vendedor_id').fill('1');

  await selectViaSearchSelect(page, 'Buscar cliente...', 'Hearly');
}

async function addProducto(page: Page, searchTerm: string) {
  await selectViaSearchSelect(page, 'Buscar producto...', searchTerm);
  await page.getByRole('button', { name: 'Agregar', exact: true }).click();
  await expect(page.locator('input[formcontrolname="cantidad"]').first()).toBeVisible();
  // Si el producto trae precio_venta_base seedeado, el campo llega ya deshabilitado con ese
  // valor. Si no, hay que tipearlo a mano (mismo patrón que purchase.spec.ts con costo_unitario).
  const precioInput = page.locator('input[formcontrolname="precio_unitario"]').first();
  if (await precioInput.isEnabled()) {
    await precioInput.fill('50');
  }
}

test('Venta: crear standalone con afecta stock, listar y ver en Historial', async ({ page }) => {
  await fillVentaBase(page);
  // Contado/Efectivo autocompletan la venta al emitirla (mismo patrón que Compra) -- se elige
  // explícitamente para poder afirmar el estado resultante, en vez de depender del default.
  await page.locator('#mp_cod').selectOption({ label: 'CONTADO' });
  // afecta_stock ya nace tildado (buildSaleForm default true) -- se deja así a propósito: es
  // justo el camino que hoy registra el movimiento Kardex de SALIDA (feature de esta sesión).
  await expect(page.locator('#afecta_stock')).toBeChecked();

  await addProducto(page, 'Arroz');

  const createBody = (await clickAndWaitForApi(page, ['POST'], () =>
    page.getByRole('button', { name: 'Guardar Venta' }).click(),
  )) as { isValid: boolean; data: { venta_id: number; numero_completo: string; estado_id: number } };
  expect(createBody.isValid, JSON.stringify(createBody)).toBe(true);
  expect(createBody.data.estado_id, 'contado debe autocompletar la venta').toBe(2);

  const numeroCompleto = createBody.data.numero_completo;
  expect(numeroCompleto, 'numero_completo debería haberse generado').toBeTruthy();

  // save() cambia a Historial y vuelve a buscar -- se espera esa transición en vez del click.
  await expect(page.locator('a.nav-link', { hasText: 'Historial' })).toHaveClass(/active/, {
    timeout: 10_000,
  });

  const row = page.locator('table tbody tr', { hasText: numeroCompleto });
  await expect(row).toBeVisible({ timeout: 10_000 });
});

test('Venta a crédito nace Pendiente (no autocompleta)', async ({ page }) => {
  await fillVentaBase(page);
  await page.locator('#mp_cod').selectOption({ label: 'CREDITO' });

  await addProducto(page, 'Arroz');

  const createBody = (await clickAndWaitForApi(page, ['POST'], () =>
    page.getByRole('button', { name: 'Guardar Venta' }).click(),
  )) as { isValid: boolean; data: { estado_id: number } };
  expect(createBody.isValid, JSON.stringify(createBody)).toBe(true);
  expect(createBody.data.estado_id, 'crédito debe nacer Pendiente').toBe(1);
});

test('Venta vinculada a una Cotización existente la pasa a Facturado', async ({ page }) => {
  // ---- Fixture: crear la cotización primero (mismo flujo que quotation.spec.ts) ----
  await page.goto('/cotizaciones');

  function fieldByLabel(label: string) {
    return page
      .locator(`label:text-is("${label}")`)
      .locator('xpath=following-sibling::*[self::input or self::select or self::textarea][1]')
      .first();
  }

  await fieldByLabel('Sucursal').selectOption({ index: 1 });
  await fieldByLabel('Moneda').selectOption({ index: 1 });
  await fieldByLabel('Tipo de Pago').selectOption({ index: 1 });
  // Cotización usa placeholders distintos a Venta ('Cliente'/'Producto', no 'Buscar cliente...').
  await selectViaSearchSelect(page, 'Cliente', 'Hearly');
  await selectViaSearchSelect(page, 'Producto', 'Arroz');
  await page.getByRole('button', { name: 'Agregar Producto', exact: true }).click();
  await expect(page.locator('input[formcontrolname="cantidad"]').first()).toBeVisible();

  const cotizacionBody = (await clickAndWaitForApi(page, ['POST'], () =>
    page.getByRole('button', { name: 'Guardar Cotización' }).click(),
  )) as { isValid: boolean; data: { id: number; numero_completo: string } };
  expect(cotizacionBody.isValid, JSON.stringify(cotizacionBody)).toBe(true);
  const cotizacionNumero = cotizacionBody.data.numero_completo;

  // ---- Venta vinculada a esa cotización ----
  // El modal de búsqueda no es una tabla: son tarjetas .document-item con filtrado en vivo
  // (input) -> filteredItems(), sin botón "Buscar" propio.
  await page.goto('/ventas');
  await page.getByRole('button', { name: 'Buscar cotización' }).click();
  await page.locator('input[placeholder="Buscar por número o cliente..."]').fill(cotizacionNumero);
  const cotOption = page.locator('.document-item', { hasText: cotizacionNumero }).first();
  await expect(cotOption).toBeVisible({ timeout: 10_000 });
  await cotOption.click();

  // Vincular auto-completa cliente (readonly) -- solo faltan los campos que no vienen del documento.
  await expect(page.locator('span.fw-semibold', { hasText: cotizacionNumero })).toBeVisible();
  await page.locator('#emp_id').selectOption({ index: 1 });
  await page.locator('#doc_id').selectOption({ index: 1 });
  await page.locator('#suc_id').selectOption({ index: 1 });
  await page.locator('#almacen_id').selectOption({ index: 1 });
  await page.locator('#mon_id').selectOption({ index: 1 });
  await page.locator('#mp_cod').selectOption({ label: 'CONTADO' });
  await page.locator('#vendedor_id').fill('1');

  await addProducto(page, 'Arroz');

  const ventaBody = (await clickAndWaitForApi(page, ['POST'], () =>
    page.getByRole('button', { name: 'Guardar Venta' }).click(),
  )) as { isValid: boolean; data: { venta_id: number } };
  expect(ventaBody.isValid, JSON.stringify(ventaBody)).toBe(true);

  // ---- Confirmar que la Cotización pasó a Facturado ----
  // Navegación fresca aterriza en "Nueva Cotización" (tab por defecto), no en Historial.
  await page.goto('/cotizaciones');
  await page.locator('a.nav-link', { hasText: 'Historial' }).click();
  // Busca por numero_completo (no 'Hearly') -- el backend matchea nombre contra
  // numero_completo OR cliente.nombre, y con muchas corridas acumuladas en esta DB
  // persistente, 'Hearly' devuelve más filas de las que la primera página muestra.
  // numero_completo es único por corrida, así que garantiza una sola fila.
  await page.locator('[formcontrolname="nombre"]').fill(cotizacionNumero);
  // El filtro por defecto solo trae Pendiente (01) -- hay que tildar Facturado (02) para verla,
  // mismo patrón que quotation.spec.ts usa con Anulado (03).
  await page.locator('#state_02').check();
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  const cotRow = page.locator('table tbody tr', { hasText: cotizacionNumero });
  await expect(cotRow).toBeVisible({ timeout: 10_000 });
  await expect(cotRow).toContainText('Facturado');
});
