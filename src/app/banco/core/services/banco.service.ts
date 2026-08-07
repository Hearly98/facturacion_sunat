import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { BaseService } from '@shared/services/base.service';
import { ResponseDto } from '@shared/models/api/response.dto';
import { Banco, CreateBanco, UpdateBanco } from '../models';
import { BancoDto, CreateBancoDto, UpdateBancoDto } from '../dto/banco.dto';
import { BancoMapper } from '../mappers/banco.mapper';
import { QueryParamsModel } from '@shared/models/query/query-params.model';
import { QueryResultsModel } from '@shared/models/query/query-results.model';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class BancoService extends BaseService {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/bancos`);
  }

  getAll(): Observable<ResponseDto<Banco[]>> {
    return this.getRequest<ResponseDto<BancoDto[]>>('').pipe(
      map((response) => ({
        ...response,
        data: response.data.map((dto) => BancoMapper.fromApi(dto)),
      })),
    );
  }

  getById(id: number): Observable<ResponseDto<Banco>> {
    return this.getRequest<ResponseDto<BancoDto>>(`/${id}`).pipe(
      map((response) => ({
        ...response,
        data: BancoMapper.fromApi(response.data),
      })),
    );
  }

  create(body: CreateBanco): Observable<ResponseDto<Banco>> {
    const dto = BancoMapper.toApiCreate(body);
    return this.postRequest<CreateBancoDto, ResponseDto<BancoDto>>('', dto).pipe(
      map((response) => ({
        ...response,
        data: BancoMapper.fromApi(response.data),
      })),
    );
  }

  update(body: UpdateBanco): Observable<ResponseDto<Banco>> {
    const dto = BancoMapper.toApiUpdate(body);
    return this.putRequest<UpdateBancoDto, ResponseDto<BancoDto>>(`/${body.id}`, dto).pipe(
      map((response) => ({
        ...response,
        data: BancoMapper.fromApi(response.data),
      })),
    );
  }

  delete(id: number): Observable<ResponseDto<Banco | null>> {
    return this.deleteRequest<ResponseDto<BancoDto>>(`/${id}`).pipe(
      map((response) => ({
        ...response,
        data: response.data ? BancoMapper.fromApi(response.data) : null,
      })),
    );
  }

  search(params: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<Banco>>> {
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<BancoDto>>>(
      '/search',
      params,
    ).pipe(
      map((response) => ({
        ...response,
        data: new QueryResultsModel(
          response.data.items.map((dto) => BancoMapper.fromApi(dto)),
          response.data.total,
          response.data.errorMessage,
        ),
      })),
    );
  }
}
