import { test, expect, Page } from '@playwright/test';

// Cubre los quick-wins de flujo de la auditoría UX (docs/ux-review/2026-07-30-review.md) que no
// alcanza a validar el ciclo de vida completo de quotation.spec.ts: auto-tildado de "Mostrar en
// PDF", confirmación al descartar, y el default de estados al limpiar el filtro de Historial.

function fieldByLabel(page: Page, label: string) {
  return page
    .locator(`label:text-is("${label}")`)
    .locator('xpath=following-sibling::*[self::input or self::select or self::textarea][1]')
    .first();
}

function showCheckboxFor(page: Page, label: string) {
  // El checkbox "Mostrar en PDF" vive en el mismo contenedor que el campo, justo después.
  return fieldByLabel(page, label)
    .locator('xpath=following-sibling::div[1]')
    .locator('input[type="checkbox"]');
}

test.describe('Cotización — quick-wins de UX', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cotizaciones');
  });

  test('escribir en un campo con "Mostrar en PDF" lo tilda solo', async ({ page }) => {
    const checkbox = showCheckboxFor(page, 'Forma de Pago');
    await expect(checkbox).not.toBeChecked();

    await fieldByLabel(page, 'Forma de Pago').fill('Contado');
    await expect(checkbox).toBeChecked();
  });

  test('Cancelar sin cambios no pide confirmación', async ({ page }) => {
    await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
    await expect(page.locator('h5', { hasText: 'Descartar cotización' })).not.toBeVisible();
  });

  test('Cancelar con datos cargados pide confirmación y respeta "Seguir editando"', async ({ page }) => {
    await fieldByLabel(page, 'Forma de Pago').fill('Contado');

    await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
    await expect(page.locator('h5', { hasText: 'Descartar cotización' })).toBeVisible();

    await page.getByRole('button', { name: 'Seguir editando' }).click();
    await expect(fieldByLabel(page, 'Forma de Pago')).toHaveValue('Contado');

    await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
    await page.getByRole('button', { name: 'Sí, descartar' }).click();
    await expect(fieldByLabel(page, 'Forma de Pago')).toHaveValue('');
  });

  test('Limpiar en Historial vuelve a Pendiente, no a Facturado', async ({ page }) => {
    await page.locator('a.nav-link', { hasText: 'Historial' }).click();

    // Tildar algo más para confirmar que "Limpiar" de verdad resetea, no solo que ya viniera bien.
    await page.locator('#state_03').check();
    await page.getByRole('button', { name: 'Limpiar', exact: true }).click();

    await expect(page.locator('#state_01')).toBeChecked();
    await expect(page.locator('#state_02')).not.toBeChecked();
    await expect(page.locator('#state_03')).not.toBeChecked();
  });
});
