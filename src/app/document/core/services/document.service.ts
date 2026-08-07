import { Injectable, inject } from '@angular/core';
import { BaseService } from '../../../shared/services/base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from '../../../shared/models/api/response.dto';
import { QueryParamsModel } from '../../../shared/models/query/query-params.model';
import { QueryResultsModel } from '../../../shared/models/query/query-results.model';
import { Document, CreateDocument, UpdateDocument } from '../models/document.model';
import { DocumentDto } from '../dtos/document.dto';
import { DocumentMapper } from '../mappers/document.mapper';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DocumentService extends BaseService {
  readonly #mapper = inject(DocumentMapper);

  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/documentos`);
  }

  getAll(): Observable<ResponseDto<Document[]>> {
    return this.getRequest<ResponseDto<DocumentDto[]>>('').pipe(
      map((response) => ({
        ...response,
        data: response.data.map((dto) => this.#mapper.fromApi(dto)),
      }))
    );
  }

  getById(id: number): Observable<ResponseDto<Document>> {
    return this.getRequest<ResponseDto<DocumentDto>>(`/${id}`).pipe(
      map((response) => ({
        ...response,
        data: this.#mapper.fromApi(response.data),
      }))
    );
  }

  delete(id: number): Observable<ResponseDto<Document>> {
    return this.deleteRequest<ResponseDto<DocumentDto>>(`/${id}`).pipe(
      map((response) => ({
        ...response,
        data: this.#mapper.fromApi(response.data),
      }))
    );
  }

  create(body: CreateDocument): Observable<ResponseDto<Document>> {
    const dto = this.#mapper.toApiCreate(body);
    return this.postRequest<any, ResponseDto<DocumentDto>>(`/`, dto).pipe(
      map((response) => ({
        ...response,
        data: this.#mapper.fromApi(response.data),
      }))
    );
  }

  update(body: UpdateDocument): Observable<ResponseDto<Document>> {
    const dto = this.#mapper.toApiUpdate(body);
    return this.putRequest<any, ResponseDto<DocumentDto>>('/', dto).pipe(
      map((response) => ({
        ...response,
        data: this.#mapper.fromApi(response.data),
      }))
    );
  }

  search(body: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<Document>>> {
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<DocumentDto>>>(
      `/search`,
      body
    ).pipe(
      map((response) => ({
        ...response,
        data: {
          ...response.data,
          items: response.data.items.map((dto) => this.#mapper.fromApi(dto)),
        },
      }))
    );
  }
}
