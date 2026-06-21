import { FormControl, Validators } from '@angular/forms';

export const buildShippingGuideDetail = (data?: any) => {
  return {
    guia_det_id: new FormControl<number>(data?.guia_det_id || 0),
    guia_id: new FormControl<number>(data?.guia_id || 0),
    prod_cod: new FormControl<string>(data.prod_cod || ''),
    prod_id: new FormControl<number>(data?.prod_id || 0, [Validators.required]),
    prod_nom: new FormControl<string>(data?.prod_nom || ''),
    cantidad: new FormControl<number>(data?.cantidad || 0, [
      Validators.required,
      Validators.min(1),
    ]),
    und_id: new FormControl<number | null>(data?.und_id || null),
    peso_unitario: new FormControl<number>(data?.peso_unitario || 0),
    peso_total: new FormControl<number>(data?.peso_total || 0),
    descripcion: new FormControl<string>(data?.descripcion || '', [Validators.required]),
  };
};
