import { DocumentTypeDto, CreateDocumentTypeDto, UpdateDocumentTypeDto } from '../dto';
import { DocumentType, CreateDocumentType, UpdateDocumentType } from '../models';

export class DocumentTypeMapper {
  static fromApi(dto: DocumentTypeDto): DocumentType {
    return {
      id: dto.id,
      name: dto.nombre,
      code: dto.codigo,
    };
  }

  static toApi(model: DocumentType): DocumentTypeDto {
    return {
      id: model.id,
      nombre: model.name,
      codigo: model.code,
    };
  }

  static fromApiCreate(dto: CreateDocumentTypeDto): CreateDocumentType {
    return {
      name: dto.nombre,
      code: dto.codigo,
    };
  }

  static toApiCreate(model: CreateDocumentType): CreateDocumentTypeDto {
    return {
      nombre: model.name,
      codigo: model.code,
    };
  }

  static fromApiUpdate(dto: UpdateDocumentTypeDto): UpdateDocumentType {
    return {
      id: dto.id,
      name: dto.nombre,
      code: dto.codigo,
    };
  }

  static toApiUpdate(model: UpdateDocumentType): UpdateDocumentTypeDto {
    return {
      id: model.id,
      nombre: model.name,
      codigo: model.code,
    };
  }
}
