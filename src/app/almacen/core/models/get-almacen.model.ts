import { GetSucursalModel } from 'src/app/sucursal/core/models';
import { AlmacenModel } from './almacen.model';

export class GetAlmacenModel extends AlmacenModel {
    id: number = 0;
    sucursal?: GetSucursalModel;
    activo: boolean = true;
}
