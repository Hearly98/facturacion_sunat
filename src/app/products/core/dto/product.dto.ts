export interface ProductDto {
  id: number | null;
  categoria_id: number;
  marca_id: number;
  nombre: string;
  descripcion: string;
  unidad_id: number;
  codigo_interno: string;
  codigo_fabricante: string;
  peso: number;
  imagen: string;
  almacenes: number[];
  sucursal_id: number;
  moneda_id: number;
  precio_compra_base: number;
  precio_venta_base: number;
  sucursales: number[];
  est: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  categoria_id: number;
  marca_id: number;
  nombre: string;
  descripcion: string;
  unidad_id: number;
  codigo_interno: string;
  codigo_fabricante: string;
  peso: number;
  sucursal_id: number;
  moneda_id: number;
  precio_compra_base: number;
  precio_venta_base: number;
  sucursales: number[];
}

export interface UpdateProductDto {
  id: number;
  categoria_id: number;
  marca_id: number;
  nombre: string;
  descripcion: string;
  unidad_id: number;
  codigo_interno: string;
  codigo_fabricante: string;
  peso: number;
  sucursal_id: number;
  moneda_id: number;
  precio_compra_base: number;
  precio_venta_base: number;
  sucursales: number[];
}
