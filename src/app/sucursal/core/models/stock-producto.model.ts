import { StockPorAlmacenModel } from "./stock-by-almacen.model";

export class StockProductoModel {
  productoId: number = 0;
  nombre: string = '';
  codigoInterno: string = '';
  stockTotal: number = 0;
  totalPorAlmacen: StockPorAlmacenModel[] = [];
}