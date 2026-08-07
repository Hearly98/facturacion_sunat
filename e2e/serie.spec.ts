import { test, expect } from '@playwright/test';
import { shortCode } from './helpers/master-crud.helpers';
import {
  fillFields,
  findRowByText,
  clickRowEdit,
  clickRowDelete,
  confirmDeleteDialog,
  waitForModalClosed,
  waitForAttrFieldPopulated,
  clickAndWaitForApi,
} from './helpers/master-crud.helpers';

// Serie's page has no search/filter UI at all, and its modal is fully hand-written (a SUNAT
// document-type select, no validation-message component, a Save button that's simply `disabled`
// while the form is invalid instead of showing inline errors, and a dynamic "Guardar"/"Actualizar"
// label). Kept as its own spec instead of forcing it into the generic loop.
test('Serie: crear, editar y eliminar', async ({ page }) => {
  const number = `E2E${shortCode(4)}`;
  const editedNumber = `${number}B`;

  await page.goto('/series');

  // Crear
  await page.getByRole('button', { name: 'Nueva Serie', exact: true }).click();
  await fillFields(page, [
    { formControlName: 'code', value: 'FACTURA ELECTRÓNICA', type: 'select' },
    { formControlName: 'number', value: number },
    { formControlName: 'counter', value: '1' },
  ]);
  const createBody = await clickAndWaitForApi(page, ['POST'], () =>
    page.getByRole('button', { name: 'Guardar', exact: true }).click(),
  );
  expect(createBody.isValid, JSON.stringify(createBody)).toBe(true);
  await waitForModalClosed(page);

  const createdRow = findRowByText(page, number);
  await expect(createdRow).toBeVisible();

  // Editar
  await clickRowEdit(createdRow);
  await waitForAttrFieldPopulated(page, 'number');
  await fillFields(page, [{ formControlName: 'number', value: editedNumber }]);
  const updateBody = await clickAndWaitForApi(page, ['PUT', 'PATCH'], () =>
    page.getByRole('button', { name: 'Actualizar', exact: true }).click(),
  );
  expect(updateBody.isValid, JSON.stringify(updateBody)).toBe(true);
  await waitForModalClosed(page, 'Actualizar');

  const editedRow = findRowByText(page, editedNumber);
  await expect(editedRow).toBeVisible();

  // Eliminar
  await clickRowDelete(editedRow);
  const deleteBody = await clickAndWaitForApi(page, ['DELETE'], () => confirmDeleteDialog(page));
  expect(deleteBody.isValid, JSON.stringify(deleteBody)).toBe(true);
});
