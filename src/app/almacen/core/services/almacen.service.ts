import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BaseService } from '../../../shared/services/base.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from '../../../shared/models/api/response.dto';
import { QueryParamsModel } from '../../../shared/models/query/query-params.model';
import { QueryResultsModel } from '../../../shared/models/query/query-results.model';
import { environment } from '../../../../environments/environment';
import { CreateAlmacenModel, GetAlmacenModel, UpdateAlmacenModel } from '../models';
import { AlmacenDto, CreateAlmacenDto, UpdateAlmacenDto } from '../dtos';
import { AlmacenMapper } from '../mappers';

@Injectable({
  providedIn: 'root',
})
export class AlmacenService extends BaseService {
  #mapper = inject(AlmacenMapper);

  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/almacenes`);
  }

  getAll(): Observable<ResponseDto<GetAlmacenModel[]>> {
    return this.getRequest<ResponseDto<AlmacenDto[]>>('').pipe(
      map((response) => ({
        ...response,
        data: this.#mapper.fromApiList(response.data),
      })),
    );
  }

  getById(id: number): Observable<ResponseDto<GetAlmacenModel>> {
    return this.getRequest<ResponseDto<AlmacenDto>>(`/${id}`).pipe(
      map((response) => ({
        ...response,
        data: this.#mapper.fromApi(response.data),
      })),
    );
  }

  create(body: CreateAlmacenModel): Observable<ResponseDto<GetAlmacenModel>> {
    const dto = this.#mapper.toApiCreate(body);
    return this.postRequest<CreateAlmacenDto, ResponseDto<AlmacenDto>>(`/`, dto).pipe(
      map((response) => ({
        ...response,
        data: this.#mapper.fromApi(response.data),
      })),
    );
  }

  deactivate(id: number): Observable<ResponseDto<GetAlmacenModel>> {
    return this.postRequest<number, ResponseDto<AlmacenDto>>(`/${id}/desactivar`, id).pipe(
      map((response) => ({
        ...response,
        data: this.#mapper.fromApi(response.data),
      })),
    );
  }

  activate(id: number): Observable<ResponseDto<GetAlmacenModel>> {
    return this.postRequest<number, ResponseDto<AlmacenDto>>(`/${id}/activar`, id).pipe(
      map((response) => ({
        ...response,
        data: this.#mapper.fromApi(response.data),
      })),
    );
  }

  update(body: UpdateAlmacenModel, id: number): Observable<ResponseDto<GetAlmacenModel>> {
    const dto = this.#mapper.toApiUpdate(body);
    return this.putRequest<UpdateAlmacenDto, ResponseDto<AlmacenDto>>(`/${id}`, dto).pipe(
      map((response) => ({
        ...response,
        data: this.#mapper.fromApi(response.data),
      })),
    );
  }

  search(body: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<GetAlmacenModel>>> {
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<AlmacenDto>>>(
      `/search`,
      body,
    ).pipe(
      map((response) => ({
        ...response,
        data: {
          ...response.data,
          items: this.#mapper.fromApiList(response.data.items),
        },
      })),
    );
  }

  getBySucursal(sucId: number, activo: boolean = true): Observable<ResponseDto<GetAlmacenModel[]>> {
    return this.getRequest<ResponseDto<AlmacenDto[]>>(`?suc_id=${sucId}&activo=${activo}`).pipe(
      map((response) => ({
        ...response,
        data: this.#mapper.fromApiList(response.data),
      })),
    );
  }
}
