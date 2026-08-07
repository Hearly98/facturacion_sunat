export interface UpdateProduct {
  id: number;
  branchId: number;
  categoryId: number;
  name: string;
  description: string;
  unitId: number;
  internalCode: string;
  manufacturerCode: string;
  weight: number;
  image?: File;
  warehouses: number[];
  currencyId: number;
  brandId: number;
  basePurchasePrice: number;
  baseSalePrice: number;
  branches?: number[];
}

