import { PaymentMethodDto, CreatePaymentMethodDto, UpdatePaymentMethodDto } from '../dto';
import { PaymentMethod, CreatePaymentMethod, UpdatePaymentMethod } from '../models';

export class PaymentMethodMapper {
  static fromApi(dto: PaymentMethodDto): PaymentMethod {
    return {
      id: dto.id,
      code: dto.codigo,
      name: dto.nombre,
      active: dto.est,
    };
  }

  static toApi(model: PaymentMethod): PaymentMethodDto {
    return {
      id: model.id,
      codigo: model.code,
      nombre: model.name,
      est: model.active,
    };
  }

  static fromApiCreate(dto: CreatePaymentMethodDto): CreatePaymentMethod {
    return {
      code: dto.codigo,
      name: dto.nombre,
      active: true,
    };
  }

  static toApiCreate(model: CreatePaymentMethod): CreatePaymentMethodDto {
    return {
      codigo: model.code,
      nombre: model.name,
    };
  }

  static fromApiUpdate(dto: UpdatePaymentMethodDto): UpdatePaymentMethod {
    return {
      id: dto.id,
      code: dto.codigo,
      name: dto.nombre,
      active: true,
    };
  }

  static toApiUpdate(model: UpdatePaymentMethod): UpdatePaymentMethodDto {
    return {
      id: model.id,
      codigo: model.code,
      nombre: model.name,
    };
  }
}
