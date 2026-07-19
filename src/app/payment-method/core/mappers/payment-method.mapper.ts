import { PaymentMethodDto, CreatePaymentMethodDto, UpdatePaymentMethodDto } from '../dto';
import { PaymentMethod, CreatePaymentMethod, UpdatePaymentMethod } from '../models';

export class PaymentMethodMapper {
  static fromApi(dto: PaymentMethodDto): PaymentMethod {
    return {
      id: dto.mp_id,
      code: dto.mp_cod,
      name: dto.mp_nom,
      active: dto.mp_activo,
    };
  }

  static toApi(model: PaymentMethod): PaymentMethodDto {
    return {
      mp_id: model.id,
      mp_cod: model.code,
      mp_nom: model.name,
      mp_activo: model.active,
    };
  }

  static fromApiCreate(dto: CreatePaymentMethodDto): CreatePaymentMethod {
    return {
      code: dto.mp_cod,
      name: dto.mp_nom,
      active: dto.mp_activo,
    };
  }

  static toApiCreate(model: CreatePaymentMethod): CreatePaymentMethodDto {
    return {
      mp_cod: model.code,
      mp_nom: model.name,
      mp_activo: model.active,
    };
  }

  static fromApiUpdate(dto: UpdatePaymentMethodDto): UpdatePaymentMethod {
    return {
      id: dto.mp_id,
      code: dto.mp_cod,
      name: dto.mp_nom,
      active: dto.mp_activo,
    };
  }

  static toApiUpdate(model: UpdatePaymentMethod): UpdatePaymentMethodDto {
    return {
      mp_id: model.id,
      mp_cod: model.code,
      mp_nom: model.name,
      mp_activo: model.active,
    };
  }
}
