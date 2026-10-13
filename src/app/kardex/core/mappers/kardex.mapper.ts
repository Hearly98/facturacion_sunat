import { KardexDto, KardexMovementDto } from '../dto/kardex.dto';
import { KardexModel, KardexMovementModel } from '../models/kardex.model';

export class KardexMapper {
  static fromApi(dto: KardexDto): KardexModel {
    return {
      productId: dto.producto_id,
      warehouseId: dto.almacen_id,
      openingBalance: dto.saldo_inicial,
      finalStock: dto.stock_final,
      movements: (dto.movimientos ?? []).map((m) => this.movementFromApi(m)),
    };
  }

  private static movementFromApi(dto: KardexMovementDto): KardexMovementModel {
    return {
      id: dto.id,
      date: dto.fecha,
      typeCode: dto.tipo_codigo,
      typeDescription: dto.tipo_descripcion,
      direction: dto.afectacion_stock,
      quantity: dto.cantidad,
      signedQuantity: dto.cantidad * dto.afectacion_stock,
      reference: dto.referencia,
      userName: dto.usuario_nombre,
      transferId: dto.transferencia_id,
      balance: dto.saldo_acumulado,
    };
  }
}
