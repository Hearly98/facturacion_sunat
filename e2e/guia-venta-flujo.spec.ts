import { test, expect, Page, APIRequestContext } from '@playwright/test';

// Flujo comercial de punta a punta: Cotización -> Guía de remisión -> Venta, con la impresión
// de cada documento. Cubre lo reportado en QA: el aviso de "no puede editarse" que no bloqueaba
// nada, el "complete los campos" sin decir cuál, el ubigeo sin combos y la importación de guías
// en ventas (que no hacía nada porque el front leía guia_id/prod_id, claves que no existen).

const API = process.env['E2E_API_URL'] ?? 'http://127.0.0.1:8000/api/v1';

async function api(page: Page): Promise<{ request: APIRequestContext; headers: Record<string, string> }> {
  const token = await page.evaluate(() => localStorage.getItem('factu_token'));
  return {
    request: page.request,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' },
  };
}

async function crearCotizacionPendiente(page: Page): Promise<{ id: number; numero: string }> {
  const { request, headers } = await api(page);
  const get = async (url: string) => (await (await request.get(`${API}${url}`, { headers })).json()).data;

  const [sucursales, monedas, metodos, series, clientes, productos] = await Promise.all([
    get('/sucursales'),
    get('/monedas'),
    get('/metodos-pago'),
    get('/cotizaciones/series'),
    (await request.post(`${API}/clientes/search-quick`, { headers, data: { term: 'Hearly' } })).json(),
    (await request.post(`${API}/productos/search-quick`, { headers, data: { term: 'Arroz' } })).json(),
  ]);
  const user = await page.evaluate(() => JSON.parse(localStorage.getItem('factu_user') ?? '{}'));

  const res = await request.post(`${API}/cotizaciones`, {
    headers,
    data: {
      idSucursal: sucursales[0].id,
      idUsuario: user.id,
      idCliente: clientes.data[0].id,
      idMoneda: (monedas.items ?? monedas)[0].id,
      idTipoPago: (metodos.items ?? metodos)[0].id,
      idSerie: series[0].id,
      igvRequerido: true,
      detalles: [{ idProducto: productos.data[0].id, precioUnitario: 114, cantidad: 3, descuento: 0 }],
    },
  });
  const body = await res.json();
  expect(body.isValid, JSON.stringify(body)).toBe(true);
  return { id: body.data.id, numero: body.data.numero_completo };
}

async function expectPdf(page: Page, click: () => Promise<void>) {
  const [response] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/pdf')),
    click(),
  ]);
  expect(response.url(), 'no debe pedir /undefined/pdf').not.toContain('undefined');
  expect(response.status(), await response.text().catch(() => '')).toBe(200);
  expect(response.headers()['content-type']).toContain('application/pdf');
}

test('Cotización -> Guía -> Venta, con validaciones e impresión', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/dashboard');
  const cotizacion = await crearCotizacionPendiente(page);

  // ---------- Guía: guardar vacío dice QUÉ falta y lleva al primer campo ----------
  await page.goto('/guias-remision');
  await page.getByRole('button', { name: 'Guardar guía' }).click();
  const dialogo = page.locator('.modal.show', { hasText: 'Faltan datos obligatorios' });
  await expect(dialogo).toBeVisible();
  await expect(dialogo).toContainText('Cliente');
  await expect(dialogo).toContainText('Ubigeo de destino');
  await expect(dialogo).toContainText('Motivo de traslado');
  await expect(dialogo).toContainText('Bienes transportados');
  await dialogo.getByRole('button', { name: 'Entendido' }).click();
  await expect(page.locator('#nombre_cliente')).toBeFocused();
  await expect(page.locator('#nombre_cliente')).toHaveClass(/ng-invalid/);

  // ---------- Importar la cotización: cliente y bienes quedan bloqueados ----------
  await page.getByRole('button', { name: 'Buscar cotización' }).click();
  await page.locator('.document-item', { hasText: cotizacion.numero }).click();
  await expect(page.locator('c-alert', { hasText: cotizacion.numero })).toContainText('no se pueden cambiar');
  await expect(page.locator('#nombre_cliente')).toBeDisabled();
  await expect(page.locator('input[formcontrolname="cantidad"]').first()).toBeDisabled();
  await expect(page.locator('input[formcontrolname="cantidad"]').first()).toHaveValue('3');
  await expect(page.getByRole('button', { name: 'Agregar', exact: true })).toHaveCount(0);
  // La unidad viene de la cotización (antes llegaba vacía por el bug de unidades globales).
  await expect(page.locator('select[formcontrolname="und_id"]').first()).not.toHaveValue(/null|^$/);

  // ---------- Ubigeo de destino con los tres combos en cascada ----------
  await page.locator('#destino_ubigeo').click();
  const modalUbigeo = page.locator('.modal.show', { hasText: 'Ubigeo del punto de destino' });
  await modalUbigeo.locator('select').nth(0).selectOption({ label: 'Lima' });
  await modalUbigeo.locator('select').nth(1).selectOption({ label: 'Lima' });
  await modalUbigeo.locator('select').nth(2).selectOption({ label: 'Barranco' });
  await expect(modalUbigeo).toContainText('150104');
  await modalUbigeo.getByRole('button', { name: 'Usar este ubigeo' }).click();
  await expect(page.locator('#destino_ubigeo')).toHaveValue(/^150104 - Lima \/ Lima \/ Barranco$/);

  // Partida: si la sucursal no trae ubigeo, se elige igual.
  if (!(await page.locator('#partida_ubigeo').inputValue())) {
    await page.locator('#partida_ubigeo').click();
    const modalPartida = page.locator('.modal.show', { hasText: 'Ubigeo del punto de partida' });
    await modalPartida.locator('select').nth(0).selectOption({ label: 'Lima' });
    await modalPartida.locator('select').nth(1).selectOption({ label: 'Lima' });
    await modalPartida.locator('select').nth(2).selectOption({ label: 'Lima' });
    await modalPartida.getByRole('button', { name: 'Usar este ubigeo' }).click();
  }
  if (!(await page.locator('#partida_direccion').inputValue())) {
    await page.locator('#partida_direccion').fill('Av. Principal 123');
  }

  await page.locator('#motivo_traslado').selectOption({ label: 'Venta' });
  await page.locator('#tipo_traslado').selectOption('PRIVADO');
  await page.locator('#transportista_nro_doc').fill('44556677');
  await page.locator('#transportista_licencia').fill('Q44556677');
  await page.locator('#transportista_placa').fill('ABC-123');

  const [guardado] = await Promise.all([
    page.waitForResponse((r) => r.request().method() === 'POST' && /guias-remision\/?$/.test(r.url())),
    page.getByRole('button', { name: 'Guardar guía' }).click(),
  ]);
  const guia = await guardado.json();
  expect(guia.isValid, JSON.stringify(guia)).toBe(true);
  const numeroGuia: string = guia.data.numero_completo;

  // ---------- Historial: imprimir y editar (vinculada: solo logística editable) ----------
  const fila = page.locator('tr', { hasText: numeroGuia });
  await expect(fila).toContainText('Generado');
  await expectPdf(page, () => fila.getByTitle('Imprimir').click());

  await fila.getByTitle('Editar').click();
  await expect(page.getByText(`Editando guía ${numeroGuia}`)).toBeVisible();
  await expect(page.locator('#nombre_cliente')).toBeDisabled();
  await expect(page.locator('#transportista_placa')).toBeEnabled();
  await page.locator('#observaciones').fill('Entregar en horario de oficina');
  const [editado] = await Promise.all([
    page.waitForResponse((r) => r.request().method() === 'PUT'),
    page.getByRole('button', { name: 'Guardar cambios' }).click(),
  ]);
  expect((await editado.json()).isValid).toBe(true);

  // ---------- Venta desde la guía: trae líneas reales y la cotización ----------
  await page.goto('/ventas');
  await page.getByRole('button', { name: 'Buscar guía de remisión' }).click();
  await page.locator('.document-item', { hasText: numeroGuia }).click();
  await expect(page.getByText(`de ${cotizacion.numero}`).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Buscar cotización' })).toBeDisabled();
  const lineaVenta = page.locator('app-sale-detail-table tbody tr').first();
  await expect(lineaVenta.locator('input[formcontrolname="prod_nom"]')).toHaveValue(/Arroz/);
  await expect(lineaVenta.locator('input[formcontrolname="cantidad"]')).toHaveValue('3');
  await expect(lineaVenta.locator('input[formcontrolname="cantidad"]')).toBeDisabled();

  // Guardar sin lo obligatorio dice qué falta (antes el botón solo quedaba deshabilitado).
  await page.getByRole('button', { name: 'Guardar Venta' }).click();
  const faltanVenta = page.locator('.modal.show', { hasText: 'Faltan datos obligatorios' });
  await expect(faltanVenta).toContainText('Tipo de documento');
  await faltanVenta.getByRole('button', { name: 'Entendido' }).click();
  await expect(page.locator('#doc_id')).toBeFocused();

  await page.locator('#doc_id').selectOption({ index: 1 });
  await page.locator('#suc_id').selectOption({ index: 1 });
  await page.locator('#mp_cod').selectOption({ index: 1 });
  await page.locator('#mon_id').selectOption({ index: 1 });
  await page.locator('#afecta_stock').uncheck();
  if ((await page.locator('#vendedor_id').inputValue()).includes('null')) {
    await page.locator('#vendedor_id').selectOption({ index: 1 });
  }

  const [venta] = await Promise.all([
    page.waitForResponse((r) => r.request().method() === 'POST' && /ventas\/?$/.test(r.url())),
    page.getByRole('button', { name: 'Guardar Venta' }).click(),
  ]);
  const ventaBody = await venta.json();
  expect(ventaBody.isValid, JSON.stringify(ventaBody)).toBe(true);

  // ---------- Estados: guía y cotización facturadas; imprimir la venta ----------
  const { request, headers } = await api(page);
  const guiaFinal = (await (await request.get(`${API}/guias-remision/${guia.data.id}`, { headers })).json()).data;
  expect(guiaFinal.estado_guia_remision.codigo).toBe('02');
  const cotFinal = (await (await request.get(`${API}/cotizaciones/${cotizacion.id}`, { headers })).json()).data;
  expect(String(cotFinal.estado?.codigo ?? cotFinal.estado_id)).toMatch(/^(02|2)$/);

  await page.getByText('Historial').first().click();
  const filaVenta = page.locator('tr', { hasText: ventaBody.data.numero_completo ?? '' }).first();
  await expectPdf(page, () => filaVenta.getByTitle('Imprimir').click());

  // ---------- La guía facturada ya no se ofrece para facturar ----------
  await page.getByText('Nueva Venta').first().click().catch(() => undefined);
  await page.goto('/ventas');
  await page.getByRole('button', { name: 'Buscar guía de remisión' }).click();
  await expect(page.locator('.document-item', { hasText: numeroGuia })).toHaveCount(0);
});
