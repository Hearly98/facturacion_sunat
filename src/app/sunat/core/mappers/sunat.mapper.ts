import {
  CreditNoteDto,
  CreditNoteLineDto,
  SunatConfigDto,
  SunatSendResultDto,
} from '../models/sunat.dtos';
import { CreateCreditNote, CreditNote, CreditNoteLine, SunatConfig, SunatSendResult } from '../models/sunat.models';

export class SunatMapper {
  static configFromApi(dto: SunatConfigDto): SunatConfig {
    return {
      environment: dto.ambiente,
      autoSend: dto.auto_envio,
      solUser: dto.credenciales?.sol_usuario ?? null,
      hasSolPassword: dto.credenciales?.tiene_clave_sol ?? false,
      hasCertificate: dto.credenciales?.tiene_certificado ?? false,
      certificateExpiresAt: dto.credenciales?.certificado_vence ?? null,
    };
  }

  static sendResultFromApi(dto: SunatSendResultDto): SunatSendResult {
    return {
      status: dto.estado,
      code: dto.codigo,
      description: dto.descripcion,
      observations: dto.observaciones ?? [],
      number: dto.numero,
      hash: dto.hash,
    };
  }

  static creditNoteLineFromApi(dto: CreditNoteLineDto): CreditNoteLine {
    return {
      saleDetailId: dto.venta_detalle_id,
      code: dto.codigo,
      name: dto.nombre,
      unitPrice: Number(dto.precio_unitario),
      soldQuantity: dto.cantidad_vendida,
      returnedQuantity: dto.cantidad_devuelta,
      availableQuantity: dto.cantidad_disponible,
    };
  }

  static creditNoteFromApi(dto: CreditNoteDto): CreditNote {
    return {
      id: dto.id,
      saleId: dto.venta_id,
      affectedDocument: dto.documento_afectado,
      number: dto.numero,
      issueDate: dto.fecha_emision,
      reasonCode: dto.motivo_codigo,
      reasonDescription: dto.motivo_descripcion,
      total: Number(dto.total),
      sunatStatus: dto.estado_sunat,
      sunatDescription: dto.descripcion_respuesta,
    };
  }

  static createCreditNoteToApi(model: CreateCreditNote) {
    return {
      venta_id: model.saleId,
      motivo: model.reason,
      items: model.items
        .filter((item) => item.quantity > 0)
        .map((item) => ({ venta_detalle_id: item.saleDetailId, cantidad: item.quantity })),
    };
  }
}
