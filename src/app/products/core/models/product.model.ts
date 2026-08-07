export interface Product {
  id: number | null;
  branchId: number;
  categoryId: number;
  name: string;
  description: string;
  unitId: number;
  internalCode: string;
  manufacturerCode: string;
  weight: number;
  image: string;
  warehouses: number[];
  currencyId: number;
  brandId: number;
  basePurchasePrice: number;
  baseSalePrice: number;
  branches?: number[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
