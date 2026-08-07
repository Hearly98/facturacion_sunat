export interface GetAlmacenProductoModel {
    almacenId: number;
    productoId: number;
    nombre: string;
    codigo?: string;
    stock: number;
    est: boolean;
}
