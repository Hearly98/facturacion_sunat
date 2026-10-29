import {
  CreditNoteDto,
  CreditNoteLineDto,
  SunatConfigDto,
} from '../models/sunat.dtos';
import { EmissionMapper } from 'src/app/emissions/core/mappers/emission.mapper';
import { CreateCreditNote, CreditNote, CreditNoteLine, SunatConfig } from '../models/sunat.models';

export class SunatMapper {
  static configFromApi(dto: SunatConfigDto): SunatConfig {
    return {
      environment: dto.ambiente,
      autoSend: dto.auto_envio,
      solUser: dto.credenciales?.sol_usuario ?? null,
      hasSolPassword: dto.credenciales?.tiene_clave_sol ?? false,
      hasCertificate: dto.credenciales?.tiene_certificado ?? false,
      certificateExpiresAt: dto.credenciales?.certificado_vence ?? null,
      policy: EmissionMapper.policyFromApi(dto.politica),
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
