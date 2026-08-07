import { PurchaseDetailDto, PurchaseDto, PurchasePaymentDto } from '../dto/purchase.dto';
import { PurchaseDetailModel, PurchaseModel, PurchasePaymentModel } from '../models/purchase.model';

export class PurchaseMapper {
  /**
   * Converts backend DTO (Spanish, snake_case, decimals as strings) to
   * frontend Model (English, camelCase, decimals as number). Mismo patrón que
   * QuotationMapper.
   */
  static fromApi(dto: PurchaseDto): PurchaseModel {
    return {
      id: dto.id,
      companyId: dto.empresa_id,
      branchId: dto.sucursal_id,
      userId: dto.usuario_id,
      documentId: dto.documento_id,
      serieId: dto.serie_id,
      supplierId: dto.proveedor_id,
      currencyId: dto.moneda_id,
      paymentMethodId: dto.metodo_pago_id,
      number: dto.numero,
      issueDate: dto.fecha_emision,
      subtotal: Number(dto.subtotal),
      tax: Number(dto.igv),
      total: Number(dto.total),
      amountPaid: Number(dto.monto_acuenta),
      amountPending: Number(dto.monto_pendiente),
      notes: dto.comentario,
      affectsStock: dto.afecta_stock,
      stateId: dto.estado_id,
      stateCode: dto.estado_compra?.codigo ?? null,
      stateName: dto.estado_compra?.nombre ?? null,
      supplier: dto.proveedor
        ? {
            id: dto.proveedor.id,
            name: dto.proveedor.nombre,
            document: dto.proveedor.documento,
            phone: dto.proveedor.telefono,
            address: dto.proveedor.direccion,
            email: dto.proveedor.email,
            bank: dto.proveedor.banco,
            bankAccount: dto.proveedor.cuenta,
          }
        : null,
      currencyName: dto.moneda?.nombre ?? null,
      currencySymbol: dto.moneda?.simbolo ?? null,
      branchName: dto.sucursal?.nombre ?? null,
      userName: dto.usuario ? `${dto.usuario.nombre} ${dto.usuario.apellido ?? ''}`.trim() : null,
      details: (dto.detalles ?? []).map((detalle) => this.detailFromApi(detalle)),
    };
  }

  private static detailFromApi(dto: PurchaseDetailDto): PurchaseDetailModel {
    return {
      id: dto.id,
      purchaseId: dto.compra_id,
      productId: dto.producto_id,
      productName: dto.producto?.nombre ?? null,
      productCode: dto.producto?.codigo_interno ?? null,
      productUnit: dto.producto?.unidad?.nombre ?? null,
      productUnitId: dto.producto?.unidad?.id ?? null,
      unitCost: Number(dto.precio_compra),
      quantity: dto.cantidad,
      total: Number(dto.total),
    };
  }

  static paymentFromApi(dto: PurchasePaymentDto): PurchasePaymentModel {
    return {
      id: dto.id,
      purchaseId: dto.compraId,
      amount: dto.monto,
      paymentDate: dto.fechaPago,
      method: dto.metodo,
      bankId: dto.bancoId,
      destinationBank: dto.bancoDestino,
      destinationAccount: dto.cuentaDestino,
      paymentState: dto.estadoPago,
      externalReference: dto.referenciaExterna,
      notes: dto.observacion,
      userName: dto.usuarioNombre,
      active: dto.activo,
    };
  }
}
