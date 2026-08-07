import { ProductForm } from '../core/types/product-form';
import { FormControl, Validators } from '@angular/forms';

export const buildProductForm = (isEditMode: boolean = false): {
  [K in keyof ProductForm]: FormControl<ProductForm[K]>;
} => {
  const priceValidators = isEditMode
    ? [Validators.min(0)]
    : [Validators.required, Validators.min(0)];

  return {
    id: new FormControl<number | null>(null),
    categoryId: new FormControl<number | null>(null),
    name: new FormControl<string | null>(null, [Validators.required]),
    description: new FormControl<string | null>(null),
    unitId: new FormControl<number | null>(null),
    currencyId: new FormControl<number | null>(null),
    brandId: new FormControl<number | null>(null),
    image: new FormControl<string | File | null>(null),
    manufacturerCode: new FormControl<string | null>(null),
    internalCode: new FormControl<string | null>(null),
    basePurchasePrice: new FormControl<number | null>(null, priceValidators),
    baseSalePrice: new FormControl<number | null>(null, priceValidators),
    weight: new FormControl<number | null>(null),
    branchId: new FormControl<number | null>(null),
    warehouses: new FormControl<number[] | null>(null),
  };
};
