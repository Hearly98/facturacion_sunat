import { Brand } from 'src/app/brand/core/models';
import { Category } from 'src/app/category/core/models';
import { Currency } from 'src/app/currency/core/models';
import { UnitOfMeasure } from 'src/app/unit-of-measure/core/models';

export const productStructure = (
  brandOptions?: Brand[],
  unitOfMeasureOptions?: UnitOfMeasure[],
  categoryOptions?: Category[],
  currencyOptions?: Currency[],
  isEditMode: boolean = false,
) => {
  let brands: { label: string; value: number }[] = [];
  let unitOfMeasures: { label: string; value: number }[] = [];
  let categories: { label: string; value: number }[] = [];
  let currencies: { label: string; value: number }[] = [];
  if (brandOptions) brands = brandOptions.filter((s) => s.id !== null).map((s) => ({ label: s.name, value: s.id as number }));
  if (unitOfMeasureOptions)
    unitOfMeasures = unitOfMeasureOptions.filter((s) => s.id !== null).map((s) => ({ label: s.name, value: s.id as number }));
  if (categoryOptions)
    categories = categoryOptions.filter((s) => s.id !== null).map((s) => ({ label: s.name, value: s.id as number }));
  if (currencyOptions)
    currencies = currencyOptions.map((s) => ({ label: s.name, value: s.id as number }));
  return [
    {
      label: 'Nombre',
      formControlName: 'name',
      type: 'text',
      col: '12',
    },
    {
      label: 'Descripción',
      formControlName: 'description',
      type: 'text',
      col: '12',
    },
    {
      label: 'Código Interno',
      formControlName: 'internalCode',
      type: 'text',
      col: '6',
    },
    {
      label: 'Código Fabricante',
      formControlName: 'manufacturerCode',
      type: 'text',
      col: '6',
    },
    {
      label: 'Categoría',
      formControlName: 'categoryId',
      type: 'select',
      col: '3',
      options: categories,
    },
    {
      label: 'Unidad',
      formControlName: 'unitId',
      type: 'select',
      col: '3',
      options: unitOfMeasures,
    },
    {
      label: 'Moneda',
      formControlName: 'currencyId',
      type: 'select',
      col: '3',
      options: currencies,
    },
    {
      label: 'Marca',
      formControlName: 'brandId',
      type: 'select',
      col: '3',
      options: brands,
    },
    ...(isEditMode ? [] : [
      {
        label: 'Precio Compra Base',
        formControlName: 'basePurchasePrice',
        type: 'number',
        col: '6',
      },
      {
        label: 'Precio Venta Base',
        formControlName: 'baseSalePrice',
        type: 'number',
        col: '6',
      },
    ]),
    {
      label: 'Imagen',
      formControlName: 'image',
      type: 'file',
      col: '12',
    },
  ];
};
