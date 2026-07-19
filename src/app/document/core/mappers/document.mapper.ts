import { Injectable } from '@angular/core';
import { DocumentDto, CreateDocumentDto, UpdateDocumentDto } from '../dtos/document.dto';
import { Document, CreateDocument, UpdateDocument } from '../models/document.model';

@Injectable({
  providedIn: 'root',
})
export class DocumentMapper {
  fromApi(dto: DocumentDto): Document {
    return {
      id: dto.id,
      code: dto.codigo,
      name: dto.nombre,
    };
  }

  toApi(model: Document): DocumentDto {
    return {
      id: model.id,
      codigo: model.code,
      nombre: model.name,
    };
  }

  toApiCreate(model: CreateDocument): CreateDocumentDto {
    return {
      codigo: model.code,
      nombre: model.name,
    };
  }

  toApiUpdate(model: UpdateDocument): UpdateDocumentDto {
    return {
      id: model.id,
      codigo: model.code,
      nombre: model.name,
    };
  }
}
