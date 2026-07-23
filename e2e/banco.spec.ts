import { test, expect } from '@playwright/test';
import { shortCode, unique } from './helpers/master-crud.helpers';
import {
  openCreateModal,
  fillFields,
  submitModal,
  findRowByText,
  clickRowEdit,
  clickRowDelete,
  confirmDeleteDialog,
  waitForModalClosed,
  waitForAttrFieldPopulated,
  clickAndWaitForApi,
} from './helpers/master-crud.helpers';

// Banco's modal is hand-written (not the shared `structure` array pattern): two selects, one
// hardcoded (accountType) and one service-backed (currencyId). Kept as its own spec instead of
// forcing it into the generic loop.
test('Banco: crear, buscar, editar y eliminar', async ({ page }) => {
  const name = unique('Banco E2E ');
  const editedName = `${name} EDITADO`;
  const accountNumber = shortCode(10);

  await page.goto('/bancos');

  // Crear
  await openCreateModal(page, 'Nuevo Banco');
  await fillFields(page, [
    { formControlName: 'name', value: name },
    { formControlName: 'accountNumber', value: accountNumber },
    { formControlName: 'accountType', value: 'Ahorro', type: 'select' },
    // Currency label is built as `{{name}} ({{code}})` and this dev DB's seeded currencies have
    // an empty `codigo`, so pick by position instead of relying on the exact rendered text.
    { formControlName: 'currencyId', value: '', type: 'select', selectIndex: 1 },
  ]);
  const createBody = await clickAndWaitForApi(page, ['POST'], () => submitModal(page));
  expect(createBody.isValid, JSON.stringify(createBody)).toBe(true);
  await waitForModalClosed(page);

  // Buscar
  // `:visible` matters here: the modal stays in the DOM (hidden, not unmounted) after closing,
  // so an unscoped selector still matches its own `name` field alongside the search input.
  await page.locator('[formcontrolname="name"]:visible').fill(name);
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  const createdRow = findRowByText(page, name);
  await expect(createdRow).toBeVisible();
  await expect(createdRow).toContainText(accountNumber);

  // Editar
  await clickRowEdit(createdRow);
  // The edit modal loads the record asynchronously and patches the form once it resolves —
  // filling before that patch lands gets silently overwritten by it.
  await waitForAttrFieldPopulated(page, 'name');
  await fillFields(page, [{ formControlName: 'name', value: editedName }]);
  const updateBody = await clickAndWaitForApi(page, ['PUT', 'PATCH'], () => submitModal(page));
  expect(updateBody.isValid, JSON.stringify(updateBody)).toBe(true);
  await waitForModalClosed(page);

  await page.locator('[formcontrolname="name"]:visible').fill(editedName);
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  const editedRow = findRowByText(page, editedName);
  await expect(editedRow).toBeVisible();

  // Eliminar
  await clickRowDelete(editedRow);
  const deleteBody = await clickAndWaitForApi(page, ['DELETE'], () => confirmDeleteDialog(page));
  expect(deleteBody.isValid, JSON.stringify(deleteBody)).toBe(true);
});
