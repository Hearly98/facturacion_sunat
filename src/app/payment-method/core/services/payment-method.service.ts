import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { ResponseDto } from '@shared/models/api/response.dto';
import { BaseService } from '@shared/services/base.service';
import { map, Observable } from 'rxjs';
import { PaymentMethod, CreatePaymentMethod, UpdatePaymentMethod } from '../models';
import { PaymentMethodDto, CreatePaymentMethodDto, UpdatePaymentMethodDto } from '../dto';
import { PaymentMethodMapper } from '../mappers';
import { QueryParamsModel } from '@shared/models/query/query-params.model';
import { QueryResultsModel } from '@shared/models/query/query-results.model';

@Injectable({
  providedIn: 'root',
})
export class PaymentMethodService extends BaseService {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/metodo_pagos`);
  }

  getAll(): Observable<ResponseDto<PaymentMethod[]>> {
    return this.getRequest<ResponseDto<PaymentMethodDto[]>>('').pipe(
      map((response) => ({
        ...response,
        data: response.data.map((dto) => PaymentMethodMapper.fromApi(dto)),
      }))
    );
  }

  getById(id: number): Observable<ResponseDto<PaymentMethod>> {
    return this.getRequest<ResponseDto<PaymentMethodDto>>(`/${id}`).pipe(
      map((response) => ({
        ...response,
        data: PaymentMethodMapper.fromApi(response.data),
      }))
    );
  }

  delete(id: number): Observable<ResponseDto<PaymentMethod | null>> {
    return this.deleteRequest<ResponseDto<PaymentMethodDto>>(`/${id}`).pipe(
      map((response) => ({
        ...response,
        data: response.data ? PaymentMethodMapper.fromApi(response.data) : null,
      }))
    );
  }

  create(body: CreatePaymentMethod): Observable<ResponseDto<PaymentMethod>> {
    const dto = PaymentMethodMapper.toApiCreate(body);
    return this.postRequest<CreatePaymentMethodDto, ResponseDto<PaymentMethodDto>>(
      `/`,
      dto
    ).pipe(
      map((response) => ({
        ...response,
        data: PaymentMethodMapper.fromApi(response.data),
      }))
    );
  }

  update(body: UpdatePaymentMethod): Observable<ResponseDto<PaymentMethod>> {
    const dto = PaymentMethodMapper.toApiUpdate(body);
    return this.putRequest<UpdatePaymentMethodDto, ResponseDto<PaymentMethodDto>>('/', dto).pipe(
      map((response) => ({
        ...response,
        data: PaymentMethodMapper.fromApi(response.data),
      }))
    );
  }

  search(
    body: QueryParamsModel
  ): Observable<ResponseDto<QueryResultsModel<PaymentMethod>>> {
    return this.postRequest<
      QueryParamsModel,
      ResponseDto<QueryResultsModel<PaymentMethodDto>>
    >(`/search`, body).pipe(
      map((response) => ({
        ...response,
        data: {
          ...response.data,
          items: response.data.items.map((dto) => PaymentMethodMapper.fromApi(dto)),
        },
      }))
    );
  }
}
