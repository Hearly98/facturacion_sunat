export class CategoryModel {
    empresaId: number = 0;
    nombre: string = '';
    empresa?: {
        emp_id: number;
        emp_nom: string;
    } | null = null;
}
