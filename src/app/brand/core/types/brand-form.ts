export interface BrandForm {
  id: number | null;
  name: string | null;
  code: string | null;
  active: boolean | null;
}

export interface BrandFilterForm {
  name?: string | null;
  code?: string | null;
}
