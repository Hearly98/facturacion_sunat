import { FormControl, Validators } from '@angular/forms';

export const buildShippingGuideDetail = (data?: any) => {
  const nombre = data?.prod_nom || '';
  return {
    guia_det_id: new FormControl<number>(data?.guia_det_id || 0),
    guia_id: new FormControl<number>(data?.guia_id || 0),
    prod_cod: new FormControl<string>(data?.prod_cod || ''),
    prod_id: new FormControl<number>(data?.prod_id || 0, [Validators.required, Validators.min(1)]),
    prod_nom: new FormControl<string>(nombre),
    cantidad: new FormControl<number>(data?.cantidad || 0, [Validators.required, Validators.min(1)]),
    // El backend exige unidad_id en cada línea (detalles.*.unidad_id required).
    und_id: new FormControl<number | null>(data?.und_id ? Number(data.und_id) : null, Validators.required),
    peso_unitario: new FormControl<number>(data?.peso_unitario || 0),
    peso_total: new FormControl<number>(data?.peso_total || (data?.peso_unitario || 0) * (data?.cantidad || 0)),
    // No hay input para la descripción en la tabla: por defecto es el nombre del producto.
    descripcion: new FormControl<string>(data?.descripcion || nombre),
    precio_unitario: new FormControl<number | null>(data?.precio_unitario ?? null),
    descuento: new FormControl<number>(data?.descuento || 0),
  };
};
