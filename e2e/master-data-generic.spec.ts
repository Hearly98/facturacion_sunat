import { test, expect } from '@playwright/test';
import { GENERIC_MODULES } from './fixtures/modules.config';
import {
  openCreateModal,
  fillModalFieldsByLabel,
  submitModal,
  findRowByText,
  clickRowEdit,
  clickRowDelete,
  confirmDeleteDialog,
  waitForModalClosed,
  waitForModalFieldPopulated,
  clickAndWaitForApi,
} from './helpers/master-crud.helpers';

// Covers the 8 master-data modules whose create/edit modal follows the shared
// `structure` + switch(type) pattern (Categoria, Marca, Unidad, Moneda, TipoDocumento,
// MetodoPago, Sucursal, Proveedor). Serie, Banco and Cliente deviate structurally (custom
// hand-written fields, service-backed selects, a DNI/RUC dynamic switch) and have their own
// dedicated spec files instead of being forced into this generic loop.
test.describe('Tablas maestras — CRUD real (front + back)', () => {
  for (const buildConfig of GENERIC_MODULES) {
    const config = buildConfig();

    test(`${config.name}: crear, buscar, editar y eliminar`, async ({ page }) => {
      await page.goto(config.route);

      // Crear
      await openCreateModal(page, config.createButtonText);
      await fillModalFieldsByLabel(page, config.createFields);
      const createBody = await clickAndWaitForApi(page, ['POST'], () => submitModal(page));
      expect(createBody.isValid, JSON.stringify(createBody)).toBe(true);
      await waitForModalClosed(page);

      // Buscar
      await page.locator(`[formcontrolname="${config.searchControlName}"]`).fill(config.identifyValue);
      await page.getByRole('button', { name: 'Buscar', exact: true }).click();
      const createdRow = findRowByText(page, config.identifyValue);
      await expect(createdRow).toBeVisible({ timeout: 10_000 });

      // Editar
      await clickRowEdit(createdRow);
      // The edit modal loads the record asynchronously (getById) and patches the form once it
      // resolves — filling before that patch lands gets silently overwritten by it.
      await waitForModalFieldPopulated(page, config.editField.label);
      await fillModalFieldsByLabel(page, [config.editField]);
      const updateBody = await clickAndWaitForApi(page, ['PUT', 'PATCH'], () => submitModal(page));
      expect(updateBody.isValid, JSON.stringify(updateBody)).toBe(true);
      await waitForModalClosed(page);

      await page
        .locator(`[formcontrolname="${config.searchControlName}"]`)
        .fill(config.editField.value);
      await page.getByRole('button', { name: 'Buscar', exact: true }).click();
      const editedRow = findRowByText(page, config.editField.value);
      await expect(editedRow).toBeVisible({ timeout: 10_000 });

      // Eliminar
      await clickRowDelete(editedRow);
      const deleteBody = await clickAndWaitForApi(page, ['DELETE'], () => confirmDeleteDialog(page));
      expect(deleteBody.isValid, JSON.stringify(deleteBody)).toBe(true);
    });
  }
});
