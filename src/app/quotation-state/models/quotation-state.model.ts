export class QuotationStateModel {
    codigo: string = '';
    nombre: string = '';
    descripcion: string = '';
    color: 'warning' | 'success' | 'danger' | 'info' = 'warning';
    est: boolean = false;
}