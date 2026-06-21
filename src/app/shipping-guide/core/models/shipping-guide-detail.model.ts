export class ShippingGuideDetailModel {
  guia_det_id: number = 0;
  guia_id: number = 0;
  prod_id: number = 0;
  cantidad: number = 0;
  und_id?: number | null;
  peso_unitario: number = 0;
  peso_total: number = 0;
  descripcion: string = '';
  producto?: {
    prod_id: number;
    prod_nom: string;
    prod_cod_interno: string;
  };
}
