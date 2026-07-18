import { UnitOfMeasureFilterForm } from '../core/types/filter-form';

export const unitOfMeasureMapFilterParams = (value: Partial<UnitOfMeasureFilterForm>): Record<string, any> => {
  const params: Record<string, any> = {};
  if (value.name) params['nombre'] = value.name;
  return params;
};
