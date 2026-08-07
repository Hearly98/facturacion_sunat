import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseDto } from '@shared/models/api/response.dto';
import { QuotationModel } from '../models/quotation.model';
import { QuotationDto } from '../dto/quotation.dto';
import { QuotationMapper } from '../mappers/quotation.mapper';
import { QuotationCreateDto } from '../types/quotation-create-dto';
import { PageParamsModel } from '@shared/models/query/page-params.model';
import { Serie } from 'src/app/series/core/models/serie.model';
import { BaseService } from '@shared/services/base.service';
import { QueryParamsModel } from '@shared/models/query/query-params.model';
import { QueryResultsModel } from '@shared/models/query/query-results.model';

@Injectable({
  providedIn: 'root',
})
export class QuotationService extends BaseService {

  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/cotizaciones`);
  }

  search(body: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<QuotationModel>>> {
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<QuotationDto>>>(
      `/search`,
      body
    ).pipe(
      map(response => ({
        ...response,
        data: {
          ...response.data,
          items: response.data.items.map(dto => QuotationMapper.fromApi(dto)),
        },
      }))
    );
  }

  getSeries(): Observable<ResponseDto<Serie[]>> {
    return this.getRequest<ResponseDto<Serie[]>>(`/series`);
  }

  getEstados(): Observable<ResponseDto<{ id: number; codigo: string; nombre: string }[]>> {
    return this.getRequest<ResponseDto<{ id: number; codigo: string; nombre: string }[]>>(`/estados`);
  }

  getPendientes(): Observable<ResponseDto<QuotationModel[]>> {
    return this.getRequest<ResponseDto<QuotationDto[]>>(`/pendientes`).pipe(
      map(response => ({
        ...response,
        data: response.data.map(dto => QuotationMapper.fromApi(dto)),
      }))
    );
  }

  getById(id: number): Observable<ResponseDto<QuotationModel>> {
    return this.getRequest<ResponseDto<QuotationDto>>(`/${id}`).pipe(
      map(response => ({
        ...response,
        data: QuotationMapper.fromApi(response.data),
      }))
    );
  }

  create(data: QuotationCreateDto): Observable<ResponseDto<QuotationModel>> {
    return this.postRequest<QuotationCreateDto, ResponseDto<QuotationDto>>('', data).pipe(
      map(response => ({
        ...response,
        data: QuotationMapper.fromApi(response.data),
      }))
    );
  }

  update(id: number, data: QuotationCreateDto): Observable<ResponseDto<QuotationModel>> {
    return this.putRequest<QuotationCreateDto, ResponseDto<QuotationDto>>(`/${id}`, data).pipe(
      map(response => ({
        ...response,
        data: QuotationMapper.fromApi(response.data),
      }))
    );
  }

  anular(id: number): Observable<ResponseDto<void>> {
    return this.postRequest(`/${id}/anular`, {});
  }

  clone(id: number): Observable<ResponseDto<QuotationModel>> {
    return this.postRequest<unknown, ResponseDto<QuotationDto>>(`/${id}/clone`, {}).pipe(
      map(response => ({
        ...response,
        data: QuotationMapper.fromApi(response.data),
      }))
    );
  }

  print(id: number) {
    return this.http.get(`${environment.apiUrl}/cotizaciones/${id}/pdf`, {
      responseType: 'blob',
      observe: 'response'
    });
  }
}
