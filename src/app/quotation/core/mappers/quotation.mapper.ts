import { QuotationDetailDto, QuotationDto } from '../dto/quotation.dto';
import { QuotationDetailModel, QuotationModel } from '../models/quotation.model';

export class QuotationMapper {
  /**
   * Converts backend DTO (Spanish, snake_case, decimals as strings) to
   * frontend Model (English, camelCase, decimals as number).
   */
  static fromApi(dto: QuotationDto): QuotationModel {
    return {
      id: dto.id,
      companyId: dto.empresa_id,
      branchId: dto.sucursal_id,
      customerId: dto.cliente_id,
      currencyId: dto.moneda_id,
      userId: dto.usuario_id,
      number: dto.numero,
      fullNumber: dto.numero_completo,
      issueDate: dto.fecha_emision,
      validUntilDate: dto.fecha_valido_hasta,
      showValidUntilDate: dto.mostrar_fecha_valido_hasta,
      contactName: dto.nombre_contacto,
      contactPhone: dto.telefono_contacto,
      contactEmail: dto.correo_contacto,
      contactArea: dto.area_contacto,
      showCurrency: dto.mostrar_moneda,
      subtotal: Number(dto.subtotal),
      tax: Number(dto.igv),
      taxRequired: dto.igv_requerido,
      total: Number(dto.total),
      showTotal: dto.mostrar_total,
      discount: Number(dto.descuento),
      notes: dto.observaciones,
      showNotes: dto.mostrar_observaciones,
      paymentTerms: dto.condiciones_pago,
      showPaymentTerms: dto.mostrar_condiciones_pago,
      paymentMethodId: dto.tipo_pago_id,
      showPaymentMethod: dto.mostrar_tipo_pago,
      paymentForm: dto.forma_pago,
      showPaymentForm: dto.mostrar_forma_pago,
      deliveryTime: dto.plazo_entrega,
      showDeliveryTime: dto.mostrar_plazo_entrega,
      deliveryPlace: dto.lugar_entrega,
      showDeliveryPlace: dto.mostrar_lugar_entrega,
      warranty: dto.garantia,
      showWarranty: dto.mostrar_garantia,
      considerations: dto.consideraciones,
      showConsiderations: dto.mostrar_consideraciones,
      complementaryService: dto.servicio_complementario,
      showComplementaryService: dto.mostrar_servicio_complementario,
      stateId: dto.estado_id,
      stateCode: dto.estado_cotizacion?.codigo ?? null,
      stateName: dto.estado_cotizacion?.nombre ?? null,
      customer: dto.cliente
        ? {
            id: dto.cliente.id,
            name: dto.cliente.razon_social || `${dto.cliente.nombre} ${dto.cliente.apellido ?? ''}`.trim(),
            document: dto.cliente.documento,
            documentTypeId: dto.cliente.tipo_documento_id,
            address: dto.cliente.direccion,
            phone: dto.cliente.telefono,
            email: dto.cliente.email,
          }
        : null,
      currencyName: dto.moneda?.nombre ?? null,
      currencySymbol: dto.moneda?.simbolo ?? null,
      branchName: dto.sucursal?.nombre ?? null,
      details: (dto.detalles ?? []).map((detalle) => this.detailFromApi(detalle)),
    };
  }

  private static detailFromApi(dto: QuotationDetailDto): QuotationDetailModel {
    return {
      id: dto.id,
      quotationId: dto.cotizacion_id,
      productId: dto.producto_id,
      productName: dto.producto?.nombre ?? dto.descripcion ?? null,
      productCode: dto.producto?.codigo_interno ?? null,
      productUnit: dto.producto?.unidad?.nombre ?? null,
      productUnitId: dto.producto?.unidad?.id ?? null,
      productWeight: dto.producto?.peso ? Number(dto.producto.peso) : null,
      unitPrice: Number(dto.precio_unitario),
      quantity: dto.cantidad,
      discount: Number(dto.descuento),
      total: Number(dto.total),
      description: dto.descripcion,
    };
  }
}
