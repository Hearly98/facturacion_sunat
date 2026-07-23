import { CustomerDto, CreateCustomerDto, UpdateCustomerDto } from '../dto';
import { Customer, CreateCustomer, UpdateCustomer } from '../models';

export class CustomerMapper {
  /**
   * Converts backend DTO (Spanish names) to frontend Model (English names)
   */
  static fromApi(dto: CustomerDto): Customer {
    return {
      id: dto.id,
      companyId: dto.empresaId,
      firstName: dto.nombre,
      lastName: dto.apellido,
      businessName: dto.razonSocial,
      document: dto.documento,
      phone: dto.telefono,
      address: dto.direccion,
      email: dto.email,
      ubigeoCode: dto.codigoUbigeo,
      documentTypeId: dto.tipoDocumentoId,
    };
  }

  /**
   * Converts frontend Model (English names) to backend DTO (Spanish names)
   */
  static toApi(model: Customer): CustomerDto {
    return {
      id: model.id,
      empresaId: model.companyId,
      nombre: model.firstName,
      apellido: model.lastName,
      razonSocial: model.businessName,
      documento: model.document,
      telefono: model.phone,
      direccion: model.address,
      email: model.email,
      codigoUbigeo: model.ubigeoCode,
      tipoDocumentoId: model.documentTypeId,
    };
  }

  /**
   * Converts frontend CreateCustomer (English names) to backend CreateCustomerDto (Spanish names)
   */
  static toApiCreate(model: CreateCustomer): CreateCustomerDto {
    return {
      empresaId: model.companyId,
      nombre: model.firstName,
      apellido: model.lastName,
      razonSocial: model.businessName,
      documento: model.document,
      telefono: model.phone,
      direccion: model.address,
      email: model.email,
      codigoUbigeo: model.ubigeoCode,
      tipoDocumentoId: model.documentTypeId,
    };
  }

  /**
   * Converts frontend UpdateCustomer (English names) to backend UpdateCustomerDto (Spanish names)
   */
  static toApiUpdate(model: UpdateCustomer): UpdateCustomerDto {
    return {
      id: model.id,
      empresaId: model.companyId,
      nombre: model.firstName,
      apellido: model.lastName,
      razonSocial: model.businessName,
      documento: model.document,
      telefono: model.phone,
      direccion: model.address,
      email: model.email,
      codigoUbigeo: model.ubigeoCode,
      tipoDocumentoId: model.documentTypeId,
    };
  }
}
