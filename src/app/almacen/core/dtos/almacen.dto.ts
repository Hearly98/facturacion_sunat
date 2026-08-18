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
  // Solo viene en AlmacenController::search() (relación eager-cargada, cruda, snake_case) --
  // index/store/show/update/activate/deactivate no la incluyen.
  sucursal?: {
    id: number;
    nombre: string;
  };
};

export type CreateAlmacenDto = {
  // AlmacenController::store() valida "sucursal_id" (fix de hoy: la validación vieja pedía
  // suc_id contra una columna que sucursales nunca tuvo). No confundir con el "suc_id" que
  // ese mismo endpoint devuelve en la respuesta -- ver el comentario en AlmacenDto arriba.
  sucursal_id: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
};

export type UpdateAlmacenDto = {
  nombre: string;
  descripcion?: string | null;
};
