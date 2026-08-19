export interface ProductImportRow {
  fila: number;
  codigo_interno: string | null;
  nombre: string | null;
  categoria: string | null;
  unidad: string | null;
  precio_compra: number | null;
  precio_venta: number | null;
  peso: number | null;
  stock_inicial: number | null;
  valida: boolean;
  errores: string[];
  categoria_se_creara: boolean;
  unidad_se_creara: boolean;
}

export interface ProductImportPreview {
  filas: ProductImportRow[];
  total_filas: number;
  total_validas: number;
  total_con_error: number;
  categorias_a_crear: string[];
  unidades_a_crear: string[];
}

export interface ProductImportRowResult {
  fila: number;
  exito: boolean;
  nombre: string | null;
  producto_id: number | null;
  error: string | null;
}

export interface ProductImportConfirmResult {
  resultados: ProductImportRowResult[];
  total_creados: number;
  total_con_error: number;
}
