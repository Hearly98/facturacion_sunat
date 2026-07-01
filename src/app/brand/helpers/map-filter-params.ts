import { FilterForm } from '../core/types/filter-form';

export const mapParams = (value: Partial<FilterForm>): Record<string, any> => {
  const params: Record<string, any> = {};
  if (value.nombre) params['nombre'] = value.nombre;
  if (value.codigo) params['codigo'] = value.codigo;
  return params;
};
