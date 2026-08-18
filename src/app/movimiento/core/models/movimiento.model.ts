import { GetAlmacenModel } from 'src/app/almacen/core/models';
export class MovimientoModel {
  almacen_origen?: GetAlmacenModel;
  numero_completo?: string;
  fecha_emision?: Date;
  tipo_movimiento?: string;
  usuario_nombre?: string;
}
