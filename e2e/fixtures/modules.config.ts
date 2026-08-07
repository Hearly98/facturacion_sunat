import { LabeledFieldInput, shortCode, unique } from '../helpers/master-crud.helpers';

export interface ModuleConfig {
  /** Test title. */
  name: string;
  route: string;
  createButtonText: string;
  /** formControlName of the list page's search input used to find the created row. */
  searchControlName: string;
  /** The value used to identify the created row's text in the table. */
  identifyValue: string;
  createFields: LabeledFieldInput[];
  /** Exact <label> text to change on edit, and its new value. */
  editField: { label: string; value: string };
}

// `codigo` columns across these tables are varchar(10) (varchar(4) for Moneda only) — see
// migrations under facturacion-api/database/migrations/2026_06_28_200001_create_core_master_tables.php.
// shortCode() keeps every generated code within those limits. Labels below are copied verbatim
// from each module's own `*-structure.ts` (verified directly — they're NOT all accented/cased
// the same way, e.g. Unidad's "Codigo" has no accent while Sucursal's "Dirección" does).

export function categoriaConfig(): ModuleConfig {
  const name = unique('Categoria E2E ');
  return {
    name: 'Categoria',
    route: '/categorias',
    createButtonText: 'Nuevo Registro',
    searchControlName: 'name',
    identifyValue: name,
    createFields: [
      { label: 'Código', value: shortCode() },
      { label: 'Nombre', value: name },
    ],
    editField: { label: 'Nombre', value: `${name} EDITADO` },
  };
}

export function marcaConfig(): ModuleConfig {
  const name = unique('Marca E2E ');
  return {
    name: 'Marca',
    route: '/marcas',
    createButtonText: 'Nueva Marca',
    searchControlName: 'name',
    identifyValue: name,
    createFields: [
      // Marca's code has a `^[A-Za-z0-9\-_]+$` validator — shortCode()'s base36 output satisfies it.
      { label: 'Código', value: shortCode() },
      { label: 'Nombre', value: name },
    ],
    editField: { label: 'Nombre', value: `${name} EDITADO` },
  };
}

export function unidadConfig(): ModuleConfig {
  const name = unique('Unidad E2E ');
  return {
    name: 'Unidad de Medida',
    route: '/unidad-medida',
    createButtonText: 'Nuevo Registro',
    searchControlName: 'name',
    identifyValue: name,
    createFields: [
      { label: 'Codigo', value: shortCode() },
      { label: 'Nombre', value: name },
      { label: 'Abreviatura', value: 'un' },
    ],
    editField: { label: 'Nombre', value: `${name} EDITADO` },
  };
}

export function monedaConfig(): ModuleConfig {
  const name = unique('Moneda E2E ');
  return {
    name: 'Moneda',
    route: '/monedas',
    createButtonText: 'Nuevo Registro',
    searchControlName: 'name',
    identifyValue: name,
    createFields: [
      // monedas.codigo is varchar(4) — the tightest column in the whole set.
      { label: 'Código', value: shortCode(4) },
      { label: 'Símbolo', value: '$' },
      { label: 'Nombre', value: name },
    ],
    editField: { label: 'Nombre', value: `${name} EDITADO` },
  };
}

export function tipoDocumentoConfig(): ModuleConfig {
  const name = unique('TipoDoc E2E ');
  return {
    name: 'Tipo de Documento',
    route: '/tipo-documento',
    createButtonText: 'Nuevo Registro',
    // Gotcha confirmed via code audit: this module's filter form uses `nombre`, not `name` like the rest.
    searchControlName: 'nombre',
    identifyValue: name,
    createFields: [
      { label: 'Nombre', value: name },
      // Real gap found while writing this suite: tipo_documentos.codigo is varchar(10) in the
      // migration, but StoreTipoDocumentoRequest (or equivalent) validates max 4 chars — the DB
      // column is more permissive than the validation rule. shortCode(4) stays inside the
      // stricter (real) limit.
      { label: 'Código', value: shortCode(4) },
    ],
    editField: { label: 'Nombre', value: `${name} EDITADO` },
  };
}

export function metodoPagoConfig(): ModuleConfig {
  const name = unique('MetodoPago E2E ');
  return {
    name: 'Metodo de Pago',
    route: '/metodo-pago',
    createButtonText: 'Nuevo Registro',
    searchControlName: 'name',
    identifyValue: name,
    createFields: [
      { label: 'Código', value: shortCode() },
      { label: 'Nombre', value: name },
    ],
    editField: { label: 'Nombre', value: `${name} EDITADO` },
  };
}

export function sucursalConfig(): ModuleConfig {
  const name = unique('Sucursal E2E ');
  return {
    name: 'Sucursal',
    route: '/sucursales',
    createButtonText: 'Nuevo Registro',
    searchControlName: 'name',
    identifyValue: name,
    // Only `name` is actually required per the form validators; the rest (code, address, ubigeo,
    // department/province/district) have no validator at all.
    createFields: [{ label: 'Nombre', value: name }],
    editField: { label: 'Nombre', value: `${name} EDITADO` },
  };
}

export function proveedorConfig(): ModuleConfig {
  const name = unique('Proveedor E2E ');
  return {
    name: 'Proveedor',
    route: '/proveedores',
    createButtonText: 'Nuevo Registro',
    searchControlName: 'name',
    identifyValue: name,
    createFields: [
      { label: 'Nombre', value: name },
      { label: 'Tipo Documento', value: 'DNI', type: 'select' },
      // proveedores.documento is varchar(15).
      { label: 'Documento', value: shortCode(8) },
      { label: 'Correo', value: `${shortCode(6).toLowerCase()}@example.com` },
      { label: 'Direccion', value: 'Av. Prueba E2E 123' },
    ],
    editField: { label: 'Nombre', value: `${name} EDITADO` },
  };
}

/** The 8 modules whose create/edit modal shares the generic `structure` + switch(type) pattern. */
export const GENERIC_MODULES: Array<() => ModuleConfig> = [
  categoriaConfig,
  marcaConfig,
  unidadConfig,
  monedaConfig,
  tipoDocumentoConfig,
  metodoPagoConfig,
  sucursalConfig,
  proveedorConfig,
];
