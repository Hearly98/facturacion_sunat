import { BrandFilterForm } from "../core/types";

export const mapParams = (value: Partial<BrandFilterForm>): Record<string, any> => {
  const params: Record<string, any> = {};
  if (value.name) params['nombre'] = value.name;
  if (value.code) params['codigo'] = value.code;
  return params;
};
