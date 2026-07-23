import { Page, Locator, expect } from '@playwright/test';

/** Unique-enough value per test run; workers run serially so Date.now() never collides. */
export function unique(prefix: string): string {
  return `${prefix}${Date.now()}`;
}

/**
 * Short unique code for tightly-limited `codigo` columns (varchar(4)-varchar(10) across the
 * master tables). Base36 timestamp tail — monotonic per millisecond, plenty unique for a
 * serially-run local suite.
 */
export function shortCode(len = 8): string {
  return Date.now().toString(36).toUpperCase().slice(-len);
}

export interface FieldInput {
  formControlName: string;
  /** For selects, the visible <option> text to pick. For text inputs, the literal value. Ignored when selectIndex is set. */
  value: string;
  type?: 'text' | 'select';
  /**
   * Pick a <option> by position instead of by label — needed when the option text is built from
   * seed data that isn't guaranteed stable (e.g. Banco's currency select renders
   * `{{name}} ({{code}})`, and this dev DB's seeded currencies have an empty `codigo`).
   * Index 0 is always the "Seleccione" placeholder, so real options start at 1.
   */
  selectIndex?: number;
}

/**
 * Fills fields by `[formcontrolname]` attribute. Only reliable where the template writes a
 * STATIC `formControlName="x"` binding (no brackets) — Angular preserves that verbatim as a real
 * DOM attribute. Used for Banco and Serie, whose hand-written modals bind this way.
 */
export async function fillFields(page: Page, fields: FieldInput[]) {
  // Scoped to the modal: Banco's own `name` field shares its formControlName with the list
  // page's search input behind it, and both are static bindings — an unscoped attribute selector
  // matches both at once.
  const modal = page.locator('c-modal').last();
  for (const field of fields) {
    const locator = modal.locator(`[formcontrolname="${field.formControlName}"]`);
    if (field.type === 'select') {
      if (field.selectIndex !== undefined) {
        await locator.selectOption({ index: field.selectIndex });
      } else {
        await locator.selectOption({ label: field.value });
      }
    } else {
      await locator.fill(field.value);
    }
  }
}

/** Attribute-based sibling of waitForModalFieldPopulated, for Banco/Serie's static bindings. */
export async function waitForAttrFieldPopulated(page: Page, formControlName: string) {
  const modal = page.locator('c-modal').last();
  await expect(modal.locator(`[formcontrolname="${formControlName}"]`)).not.toHaveValue('', {
    timeout: 10_000,
  });
}

export interface LabeledFieldInput {
  /** Exact visible <label> text inside the modal. */
  label: string;
  value: string;
  type?: 'text' | 'select';
  selectIndex?: number;
}

/**
 * Fills fields inside the currently-open modal by their visible label text, walking to the
 * label's next input/select sibling. Required for every module whose modal uses the DYNAMIC
 * `[formControlName]="item.formControlName"` binding (the shared `structure` array + @switch
 * pattern used by Categoria, Marca, Unidad, Moneda, TipoDocumento, MetodoPago, Sucursal,
 * Proveedor, and Cliente) — that binding style never reflects a `formcontrolname` DOM attribute
 * at all, so attribute selectors silently miss the modal field entirely (and, worse, can
 * silently match an unrelated field of the same name still open behind the modal, e.g. the list
 * page's own search input).
 */
function modalFieldControl(page: Page, label: string): Locator {
  const modal = page.locator('c-modal').last();
  const escaped = label.replace(/"/g, '\\"');
  return modal
    .locator(`label:text-is("${escaped}")`)
    .locator('xpath=following-sibling::*[self::input or self::select][1]')
    .first();
}

export async function fillModalFieldsByLabel(page: Page, fields: LabeledFieldInput[]) {
  for (const field of fields) {
    const control = modalFieldControl(page, field.label);
    if (field.type === 'select') {
      if (field.selectIndex !== undefined) {
        await control.selectOption({ index: field.selectIndex });
      } else {
        await control.selectOption({ label: field.value });
      }
    } else {
      await control.fill(field.value);
    }
  }
}

/**
 * Opening the edit modal triggers an async `getById()` that patches the form once it resolves —
 * filling a field immediately after clicking edit races that load and gets silently overwritten
 * the moment the fetched record's original value patches in. Waiting for the field to actually
 * hold its pre-existing (non-empty) value first makes the edit deterministic.
 */
export async function waitForModalFieldPopulated(page: Page, label: string) {
  await expect(modalFieldControl(page, label)).not.toHaveValue('', { timeout: 10_000 });
}

export async function openCreateModal(page: Page, buttonText: string) {
  await page.getByRole('button', { name: buttonText, exact: true }).click();
}

export async function submitModal(page: Page, saveButtonText = 'Guardar') {
  await page.getByRole('button', { name: saveButtonText, exact: true }).click();
}

export function findRowByText(page: Page, text: string): Locator {
  return page.locator('table tbody tr', { hasText: text });
}

export async function clickRowEdit(row: Locator) {
  await row.getByRole('button').nth(0).click();
}

export async function clickRowDelete(row: Locator) {
  await row.getByRole('button').nth(1).click();
}

/** Shared ConfirmService dialog: Cancelar is always first, the confirm action always second. */
export async function confirmDeleteDialog(page: Page) {
  // Some modals (e.g. Serie's) stay in the DOM hidden rather than unmounting when closed, so an
  // unscoped `c-modal-footer` can match a stale one alongside the confirm dialog's own — visible
  // narrows it to the one actually on screen.
  const footer = page.locator('c-modal-footer:visible');
  await expect(footer).toBeVisible();
  await footer.locator('button').last().click();
}

/** Tolerant to either CoreUI unmounting the modal or just hiding it via CSS. */
export async function waitForModalClosed(page: Page, saveButtonText = 'Guardar') {
  await expect(page.getByRole('button', { name: saveButtonText, exact: true })).toBeHidden({
    timeout: 10_000,
  });
}

/**
 * Waits for the XHR that a click triggers and returns its parsed ResponseDto body.
 * Matching by HTTP method (not URL) sidesteps the fact that every module hits a different
 * endpoint path/verb combination (some PUT to the base URL with id in the body, others PUT to
 * `/id`) — there's only ever one relevant in-flight request per click on these modals.
 */
export async function clickAndWaitForApi(
  page: Page,
  methods: string[],
  click: () => Promise<void>,
): Promise<{ isValid?: boolean; message?: string; data?: unknown }> {
  const [response] = await Promise.all([
    page.waitForResponse(
      (res) => methods.includes(res.request().method()) && res.url().includes('/api/'),
    ),
    click(),
  ]);
  if (response.status() >= 400) {
    console.log(`API_ERROR_BODY ${response.url()} [${response.status()}]:`, await response.text());
  }
  expect(response.status(), `expected ${response.url()} to succeed`).toBeLessThan(400);
  return response.json();
}
