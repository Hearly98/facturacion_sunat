export interface CategoryDto {
  id: number | null;
  codigo: string;
  nombre: string;
  abreviatura?: string;
}

export interface CreateCategoryDto {
  codigo: string;
  nombre: string;
  abreviatura?: string;
}

export interface UpdateCategoryDto {
  id: number;
  codigo: string;
  nombre: string;
  abreviatura?: string;
}
