import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { ResponseDto } from '@shared/models/api/response.dto';
import { BaseService } from '@shared/services/base.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DocumentTypeDto, CreateDocumentTypeDto, UpdateDocumentTypeDto } from '../dto';
import { DocumentType, CreateDocumentType, UpdateDocumentType } from '../models';
import { DocumentTypeMapper } from '../mappers';
import { QueryParamsModel } from '@shared/models/query/query-params.model';
import { QueryResultsModel } from '@shared/models/query/query-results.model';

@Injectable({
  providedIn: 'root',
})
export class DocumentTypeService extends BaseService {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/tipo_documentos`);
  }

  getAll(): Observable<ResponseDto<DocumentType[]>> {
    return this.getRequest<ResponseDto<DocumentTypeDto[]>>('').pipe(
      map(response => ({
        ...response,
        data: response.data.map(dto => DocumentTypeMapper.fromApi(dto)),
      }))
    );
  }

  create(body: CreateDocumentType): Observable<ResponseDto<DocumentType>> {
    const dto = DocumentTypeMapper.toApiCreate(body);
    return this.postRequest<CreateDocumentTypeDto, ResponseDto<DocumentTypeDto>>('/', dto).pipe(
      map(response => ({
        ...response,
        data: DocumentTypeMapper.fromApi(response.data),
      }))
    );
  }

  update(body: UpdateDocumentType): Observable<ResponseDto<DocumentType>> {
    const dto = DocumentTypeMapper.toApiUpdate(body);
    return this.putRequest<UpdateDocumentTypeDto, ResponseDto<DocumentTypeDto>>('/', dto).pipe(
      map(response => ({
        ...response,
        data: DocumentTypeMapper.fromApi(response.data),
      }))
    );
  }

  getById(id: number): Observable<ResponseDto<DocumentType>> {
    return this.getRequest<ResponseDto<DocumentTypeDto>>(`/${id}`).pipe(
      map(response => ({
        ...response,
        data: DocumentTypeMapper.fromApi(response.data),
      }))
    );
  }

  delete(id: number): Observable<ResponseDto<DocumentType | null>> {
    return this.deleteRequest<ResponseDto<DocumentTypeDto>>(`/${id}`).pipe(
      map(response => ({
        ...response,
        data: response.data ? DocumentTypeMapper.fromApi(response.data) : null,
      }))
    );
  }

  search(body: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<DocumentType>>> {
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<DocumentTypeDto>>>(
      `/search`,
      body
    ).pipe(
      map(response => ({
        ...response,
        data: {
          ...response.data,
          items: response.data.items.map(dto => DocumentTypeMapper.fromApi(dto)),
        },
      }))
    );
  }
}
