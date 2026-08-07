import { test, expect } from '@playwright/test';
import { shortCode, unique } from './helpers/master-crud.helpers';
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

// Cliente has a real DNI/RUC dynamic form: selecting the document type removes
// firstName/lastName or businessName from the DOM entirely (not just hides them), and
// businessName auto-fills from firstName+lastName when DNI is picked. Both paths are covered
// here since they exercise genuinely different code paths, not just different data. The modal
// uses the same dynamic `[formControlName]="item.formControlName"` binding as the generic
// modules, so fields are located by label (see fillModalFieldsByLabel), not by attribute.

test('Cliente (DNI): crear, buscar, editar y eliminar', async ({ page }) => {
  const firstName = unique('Juan E2E ');
  const lastName = 'Perez';
  const document = shortCode(8);

  await page.goto('/clientes');

  await openCreateModal(page, 'Nuevo Cliente');
  // Pick the document type first: it controls which fields even exist in the DOM below.
  await fillModalFieldsByLabel(page, [{ label: 'Tipo Documento', value: 'DNI', type: 'select' }]);
  await fillModalFieldsByLabel(page, [
    { label: 'Nombre', value: firstName },
    { label: 'Apellido', value: lastName },
    { label: 'Documento', value: document },
    { label: 'Telefono', value: '999999999' },
    { label: 'Correo', value: `${shortCode(6).toLowerCase()}@example.com` },
  ]);
  const createBody = await clickAndWaitForApi(page, ['POST'], () => submitModal(page));
  expect(createBody.isValid, JSON.stringify(createBody)).toBe(true);
  await waitForModalClosed(page);

  // The search field maps to firstName -> backend `nombre`, and razonSocial auto-fills as
  // "firstName lastName" for DNI customers, so searching by firstName finds it.
  await page.locator('[formcontrolname="firstName"]').fill(firstName);
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  const createdRow = findRowByText(page, firstName);
  await expect(createdRow).toBeVisible({ timeout: 10_000 });

  // Editar
  const editedLastName = `${lastName} EDITADO`;
  await clickRowEdit(createdRow);
  // The edit modal loads the record asynchronously and patches the form once it resolves —
  // filling before that patch lands gets silently overwritten by it.
  await waitForModalFieldPopulated(page, 'Apellido');
  await fillModalFieldsByLabel(page, [{ label: 'Apellido', value: editedLastName }]);
  const updateBody = await clickAndWaitForApi(page, ['PUT', 'PATCH'], () => submitModal(page));
  expect(updateBody.isValid, JSON.stringify(updateBody)).toBe(true);
  await waitForModalClosed(page);

  await page.locator('[formcontrolname="firstName"]').fill(firstName);
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  const editedRow = findRowByText(page, editedLastName);
  await expect(editedRow).toBeVisible({ timeout: 10_000 });

  // Eliminar
  await clickRowDelete(editedRow);
  const deleteBody = await clickAndWaitForApi(page, ['DELETE'], () => confirmDeleteDialog(page));
  expect(deleteBody.isValid, JSON.stringify(deleteBody)).toBe(true);
});

test('Cliente (RUC): crear, editar y eliminar (buscar por nombre NO aplica a este camino)', async ({
  page,
}) => {
  // Known, real gap found while writing this suite (not a test limitation): the list's search
  // field is wired to `firstName` -> backend `nombre` column (customer/helpers/map-filter-params.ts),
  // but a RUC customer never populates `nombre` — only `razonSocial`. ClienteController even lists
  // `razon_social` as a filterable column backend-side, but the frontend never sends that key, so
  // searching by name for a RUC client silently returns nothing via the UI today. Locating the row
  // directly (not through Buscar) here is deliberate, not a workaround for a Playwright limitation.
  const businessName = unique('Constructora E2E ');
  const document = shortCode(11);

  await page.goto('/clientes');

  await openCreateModal(page, 'Nuevo Cliente');
  await fillModalFieldsByLabel(page, [{ label: 'Tipo Documento', value: 'RUC', type: 'select' }]);
  await fillModalFieldsByLabel(page, [
    { label: 'Razon Social', value: businessName },
    { label: 'Documento', value: document },
    { label: 'Telefono', value: '999999999' },
    { label: 'Correo', value: `${shortCode(6).toLowerCase()}@example.com` },
  ]);
  const createBody = await clickAndWaitForApi(page, ['POST'], () => submitModal(page));
  expect(createBody.isValid, JSON.stringify(createBody)).toBe(true);
  await waitForModalClosed(page);

  const createdRow = findRowByText(page, businessName);
  await expect(createdRow).toBeVisible({ timeout: 10_000 });

  // Editar
  const editedBusinessName = `${businessName} EDITADO`;
  await clickRowEdit(createdRow);
  await waitForModalFieldPopulated(page, 'Razon Social');
  await fillModalFieldsByLabel(page, [{ label: 'Razon Social', value: editedBusinessName }]);
  const updateBody = await clickAndWaitForApi(page, ['PUT', 'PATCH'], () => submitModal(page));
  expect(updateBody.isValid, JSON.stringify(updateBody)).toBe(true);
  await waitForModalClosed(page);

  const editedRow = findRowByText(page, editedBusinessName);
  await expect(editedRow).toBeVisible({ timeout: 10_000 });

  // Eliminar
  await clickRowDelete(editedRow);
  const deleteBody = await clickAndWaitForApi(page, ['DELETE'], () => confirmDeleteDialog(page));
  expect(deleteBody.isValid, JSON.stringify(deleteBody)).toBe(true);
});
