export interface KardexMovementModel {
  id: number;
  date: string;
  typeCode: string | null;
  typeDescription: string | null;
  /** 1 adds stock, -1 removes it, 0 does not affect it */
  direction: -1 | 0 | 1;
  quantity: number;
  signedQuantity: number;
  reference: string;
  userName: string | null;
  transferId: number | null;
  balance: number;
}

export interface KardexModel {
  productId: number;
  warehouseId: number;
  openingBalance: number;
  finalStock: number;
  movements: KardexMovementModel[];
}

export interface KardexQuery {
  productId: number;
  warehouseId: number;
  dateFrom: string | null;
  dateTo: string | null;
}
