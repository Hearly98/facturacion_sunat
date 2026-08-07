export type AlmacenDto = {
  id: number;
  // AlmacenController::index/store/show/update/activate/deactivate arman el array a mano
  // con emp_id/suc_id. AlmacenController::search() (baseSearch) devuelve el modelo Eloquent
  // crudo, cuyas columnas reales son empresa_id/sucursal_id. Mismo recurso, dos formas
  // distintas según el endpoint — hay que aceptar ambas.
  emp_id?: number;
  empresa_id?: number;
  suc_id?: number;
  sucursal_id?: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
};

export type CreateAlmacenDto = {
  suc_id: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
};

export type UpdateAlmacenDto = {
  nombre: string;
  descripcion?: string | null;
};
