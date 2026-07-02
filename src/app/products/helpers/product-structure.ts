import { GetMarcaModel } from 'src/app/brand/core/models';
import { GetCategoryModel } from 'src/app/category/core/models';
import { GetCurrencyModel } from 'src/app/currency/core/models/get-currency.model';
import { GetUnitOfMeasureModel } from 'src/app/unit-of-measure/core/models';

export const productStructure = (
  brandOptions?: GetMarcaModel[],
  unitOfMeasureOptions?: GetUnitOfMeasureModel[],
  categoryOptions?: GetCategoryModel[],
  currencyOptions?: GetCurrencyModel[],
  isEditMode: boolean = false,
) => {
  let brands: { label: string; value: number }[] = [];
  let unitOfMeasures: { label: string; value: number }[] = [];
  let categories: { label: string; value: number }[] = [];
  let currencies: { label: string; value: number }[] = [];
  if (brandOptions) brands = brandOptions.map((s) => ({ label: s.nombre, value: s.id }));
  if (unitOfMeasureOptions)
    unitOfMeasures = unitOfMeasureOptions.map((s) => ({ label: s.nombre, value: s.id }));
  if (categoryOptions)
    categories = categoryOptions.map((s) => ({ label: s.nombre, value: s.id }));
  if (currencyOptions)
    currencies = currencyOptions.map((s) => ({ label: s.nombre, value: s.id }));
  return [
    {
      label: 'Nombre',
      formControlName: 'prod_nom',
      type: 'text',
      col: '12',
    },
    {
      label: 'Descripción',
      formControlName: 'prod_descrip',
      type: 'text',
      col: '12',
    },
    {
      label: 'Código Interno',
      formControlName: 'prod_cod_interno',
      type: 'text',
      col: '6',
    },
    {
      label: 'Código Fabricante',
      formControlName: 'cod_fabricante',
      type: 'text',
      col: '6',
    },
    {
      label: 'Categoría',
      formControlName: 'cat_id',
      type: 'select',
      col: '3',
      options: categories,
    },
    {
      label: 'Unidad',
      formControlName: 'und_id',
      type: 'select',
      col: '3',
      options: unitOfMeasures,
    },
    {
      label: 'Moneda',
      formControlName: 'mon_id',
      type: 'select',
      col: '3',
      options: currencies,
    },
    {
      label: 'Marca',
      formControlName: 'marca_id',
      type: 'select',
      col: '3',
      options: brands,
    },
    ...(isEditMode ? [] : [
    {
      label: 'Precio Compra Base',
      formControlName: 'precio_compra_base',
      type: 'number',
      col: '6',
    },
    {
      label: 'Precio Venta Base',
      formControlName: 'precio_venta_base',
      type: 'number',
      col: '6',
    }]),
    {
      label: 'Imagen',
      formControlName: 'prod_img',
      type: 'file',
      col: '12',
    },
  ];
};
