export type ProductForm = {
  id: number | null;
  categoryId: number | null;
  unitId: number | null;
  currencyId: number | null;
  brandId: number | null;
  name: string | null;
  description: string | null;
  internalCode: string | null;
  manufacturerCode: string | null;
  image: string | File | null;
  basePurchasePrice: number | null;
  baseSalePrice: number | null;
  weight: number | null;
  branchId: number | null;
  warehouses: number[] | null;
};
