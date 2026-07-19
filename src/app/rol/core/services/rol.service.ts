import { Injectable } from '@angular/core';
import { BaseService } from '../../../shared/services/base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from '../../../shared/models/api/response.dto';
import { QueryParamsModel } from '../../../shared/models/query/query-params.model';
import { QueryResultsModel } from '../../../shared/models/query/query-results.model';
import { CreateRol, Rol, UpdateRol } from '../models';
import { RolDto, CreateRolDto, UpdateRolDto } from '../dtos';
import { RolMapper } from '../mappers';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RolService extends BaseService {
  constructor(
    http: HttpClient,
    private readonly rolMapper: RolMapper,
  ) {
    super(http, `${environment.apiUrl}/roles`);
  }

  getAll(): Observable<ResponseDto<Rol[]>> {
    return this.getRequest<ResponseDto<RolDto[]>>('').pipe(
      map((response) => ({
        ...response,
        data: response.data?.map((dto) => this.rolMapper.fromApiDto(dto)) ?? [],
      })),
    );
  }

  create(body: CreateRol): Observable<ResponseDto<Rol>> {
    const dto = this.rolMapper.toApiCreateDto(body);
    return this.postRequest<CreateRolDto, ResponseDto<RolDto>>('/', dto).pipe(
      map((response) => ({
        ...response,
        data: this.rolMapper.fromApiDto(response.data),
      })),
    );
  }

  update(body: UpdateRol): Observable<ResponseDto<Rol>> {
    const dto = this.rolMapper.toApiUpdateDto(body);
    return this.putRequest<UpdateRolDto, ResponseDto<RolDto>>('/', dto).pipe(
      map((response) => ({
        ...response,
        data: this.rolMapper.fromApiDto(response.data),
      })),
    );
  }

  getById(id: number): Observable<ResponseDto<Rol>> {
    return this.getRequest<ResponseDto<RolDto>>(`/${id}`).pipe(
      map((response) => ({
        ...response,
        data: this.rolMapper.fromApiDto(response.data),
      })),
    );
  }

  delete(id: number): Observable<ResponseDto<Rol | null>> {
    return this.deleteRequest<ResponseDto<RolDto>>(`/${id}`).pipe(
      map((response) => ({
        ...response,
        data: response.data ? this.rolMapper.fromApiDto(response.data) : null,
      })),
    );
  }

  search(body: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<Rol>>> {
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<RolDto>>>(
      `/search`,
      body,
    ).pipe(
      map((response) => ({
        ...response,
        data: {
          ...response.data,
          items: response.data?.items?.map((dto) => this.rolMapper.fromApiDto(dto)) ?? [],
        },
      })),
    );
  }
}
