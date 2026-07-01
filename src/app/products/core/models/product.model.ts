export class ProductModel {
  sucursalId: number = 0;
  categoriaId: number = 0;
  nombre: string = '';
  descripcion: string = '';
  unidadId: number = 0;
  codigoInterno: string = '';
  codigoFabricante: string = '';
  imagen: string = '';
  monedaId: number = 0;
  marcaId: number = 0;
  precioCompraBase: number = 0;
  precioVentaBase: number = 0;
  sucursales?: number[] = [];
  est?: boolean = false;
}
