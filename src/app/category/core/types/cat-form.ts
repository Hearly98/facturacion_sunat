export interface CategoryForm {
  id: number | null;
  code: string | null;
  name: string | null;
  abbreviation?: string | null;
}

export interface CategoryFilterForm {
  code?: string | null;
  name?: string | null;
}
