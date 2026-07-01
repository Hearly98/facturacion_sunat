export class MarcaModel {
  empresaId: number = 0;
  codigo: string = '';
  nombre: string = '';
  empresa?: {
    emp_id: number;
    emp_nom: string;
  } | null = null;
}
