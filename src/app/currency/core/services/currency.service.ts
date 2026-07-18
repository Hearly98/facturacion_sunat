import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { BaseService } from '../../../shared/services/base.service';
import { ResponseDto } from '../../../shared/models/api/response.dto';
import { QueryParamsModel } from '../../../shared/models/query/query-params.model';
import { QueryResultsModel } from '../../../shared/models/query/query-results.model';
import { Currency, CreateCurrency, UpdateCurrency } from '../models';
import { CurrencyDto, CreateCurrencyDto, UpdateCurrencyDto } from '../dto/currency.dto';
import { CurrencyMapper } from '../mappers/currency.mapper';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CurrencyService extends BaseService {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/monedas`);
  }

  getAll(): Observable<ResponseDto<Currency[]>> {
    return this.getRequest<ResponseDto<CurrencyDto[]>>('').pipe(
      map(response => ({
        ...response,
        data: response.data.map(dto => CurrencyMapper.fromApi(dto)),
      }))
    );
  }

  getById(id: number): Observable<ResponseDto<Currency>> {
    return this.getRequest<ResponseDto<CurrencyDto>>(`/${id}`).pipe(
      map(response => ({
        ...response,
        data: CurrencyMapper.fromApi(response.data),
      }))
    );
  }

  create(body: CreateCurrency): Observable<ResponseDto<Currency>> {
    const dto = CurrencyMapper.toApiCreate(body);
    return this.postRequest<CreateCurrencyDto, ResponseDto<CurrencyDto>>('/', dto).pipe(
      map(response => ({
        ...response,
        data: CurrencyMapper.fromApi(response.data),
      }))
    );
  }

  update(body: UpdateCurrency): Observable<ResponseDto<Currency>> {
    const dto = CurrencyMapper.toApiUpdate(body);
    return this.putRequest<UpdateCurrencyDto, ResponseDto<CurrencyDto>>('/', dto).pipe(
      map(response => ({
        ...response,
        data: CurrencyMapper.fromApi(response.data),
      }))
    );
  }

  delete(id: number): Observable<ResponseDto<Currency | null>> {
    return this.deleteRequest<ResponseDto<CurrencyDto>>(`/${id}`).pipe(
      map(response => ({
        ...response,
        data: response.data ? CurrencyMapper.fromApi(response.data) : null,
      }))
    );
  }

  search(params: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<Currency>>> {
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<CurrencyDto>>>(
      '/search',
      params
    ).pipe(
      map(response => ({
        ...response,
        data: new QueryResultsModel(
          response.data.items.map(dto => CurrencyMapper.fromApi(dto)),
          response.data.total,
          response.data.errorMessage
        ),
      }))
    );
  }
}
