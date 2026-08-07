import { FormControl } from '@angular/forms';
import { StockFilterForm } from '../core/types/stock-filter-form';

export const buildStockFilterForm = (): {
  [K in keyof StockFilterForm]: FormControl<StockFilterForm[K]>;
} => ({
  sucursalId: new FormControl(null),
  nombre: new FormControl(null),
  codigoInterno: new FormControl(null),
});
