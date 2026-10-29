import { EmissionDetailDto, EmissionDto, EmissionSummaryDto, SendingPolicyDto } from '../models/emission.dtos';
import { Emission, EmissionDetail, EmissionFilters, EmissionSummary, SendingPolicy } from '../models/emission.models';

export class EmissionMapper {
  static fromApi(dto: EmissionDto): Emission {
    return {
      id: dto.id,
      family: dto.familia,
      saleId: dto.venta_id,
      documentType: dto.tipo_documento,
      documentTypeName: dto.tipo_nombre,
      number: dto.numero,
      affectedDocument: dto.documento_afectado,
      customer: dto.cliente,
      total: Number(dto.total),
      status: dto.estado,
      issuedAt: dto.fecha_emision,
      scheduledFor: dto.programada_para,
      deadline: dto.fecha_limite,
      hoursLeft: dto.horas_restantes,
      attempts: dto.intentos,
      nextAttemptAt: dto.proximo_intento_en,
      responseCode: dto.codigo_respuesta,
      responseDescription: dto.descripcion_respuesta,
    };
  }

  static detailFromApi(dto: EmissionDetailDto): EmissionDetail {
    return {
      ...EmissionMapper.fromApi(dto),
      observations: dto.observaciones ?? [],
      hash: dto.hash,
      hasXml: dto.tiene_xml,
      hasCdr: dto.tiene_cdr,
      history: (dto.historial ?? []).map((h) => ({
        number: h.numero,
        status: h.estado,
        code: h.codigo,
        description: h.descripcion,
        date: h.fecha,
      })),
    };
  }

  static summaryFromApi(dto: EmissionSummaryDto): EmissionSummary {
    return {
      total: dto.total,
      byStatus: dto.por_estado ?? {},
      pending: dto.pendientes,
      needsAttention: dto.requieren_atencion,
    };
  }

  static filtersToParams(filters: EmissionFilters): Record<string, string> {
    const params: Record<string, string> = { familia: filters.family };
    if (filters.status) params['estado'] = filters.status;
    if (filters.from) params['desde'] = filters.from;
    if (filters.to) params['hasta'] = filters.to;
    if (filters.search?.trim()) params['buscar'] = filters.search.trim();
    if (filters.dueSoon) params['por_vencer'] = '1';
    params['page'] = String(filters.page ?? 1);
    params['per_page'] = String(filters.perPage ?? 20);
    return params;
  }

  static policyFromApi(dto: SendingPolicyDto | undefined): SendingPolicy {
    return {
      type: dto?.tipo ?? 'INMEDIATO',
      time: dto?.hora_envio ?? '23:00',
      days: dto?.dias_envio ?? [],
      safetyMarginHours: dto?.margen_seguridad_horas ?? 24,
      warnings: dto?.advertencias ?? [],
    };
  }

  static policyToApi(policy: SendingPolicy) {
    return {
      politica_envio: policy.type,
      hora_envio: policy.time,
      dias_envio: policy.type === 'PROGRAMADO' ? policy.days : [],
      margen_seguridad_horas: policy.safetyMarginHours,
    };
  }
}
