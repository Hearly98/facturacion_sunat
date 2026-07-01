import { StockProductoModel } from "./stock-producto.model";

export class StockBySucursalModel {
  productoId: number = 0;
  nombre: string = '';
  totalStock: number = 0;
  productos: StockProductoModel[] = [];
}