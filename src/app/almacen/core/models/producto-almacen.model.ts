import { Product } from "src/app/products/core/models";
import { GetAlmacenModel } from "./get-almacen.model";

export class ProductoAlmacenModel {
  id: number = 0;
  productoId: number = 0;
  almacenId: number = 0;
  stockActual: number = 0;
  precioCompraBase: number | null = null;
  precioVentaBase: number | null = null;
  activo: boolean = true;
  producto?: Product;
  almacen?: GetAlmacenModel;
}