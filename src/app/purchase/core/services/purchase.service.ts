import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { BaseService } from '@shared/services/base.service';
import { PurchaseCreateDto } from '../purchase-create-dto';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from '@shared/models/api/response.dto';
import { QueryParamsModel } from '@shared/models/query/query-params.model';
import { QueryResultsModel } from '@shared/models/query/query-results.model';
import { PurchaseDto, PurchasePaymentDto } from '../dto/purchase.dto';
import { PurchaseModel, PurchasePaymentModel } from '../models/purchase.model';
import { PurchaseMapper } from '../mappers/purchase.mapper';
import { RegisterPaymentDto } from '../types/register-payment-dto';

@Injectable({
  providedIn: 'root',
})
export class PurchaseService extends BaseService {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/compras`);
  }

  getAll(): Observable<ResponseDto<any[]>> {
    return this.getRequest('');
  }

  create(body: PurchaseCreateDto): Observable<ResponseDto<PurchaseModel>> {
    return this.postRequest<PurchaseCreateDto, ResponseDto<PurchaseDto>>('/', body).pipe(
      map((response) => ({
        ...response,
        data: PurchaseMapper.fromApi(response.data),
      })),
    );
  }

  delete(id: number): Observable<ResponseDto<any>> {
    return this.deleteRequest(`${id}`);
  }

  update(body: any): Observable<ResponseDto<PurchaseModel>> {
    return this.putRequest<any, ResponseDto<PurchaseDto>>('/', body).pipe(
      map((response) => ({
        ...response,
        data: PurchaseMapper.fromApi(response.data),
      })),
    );
  }

  get(id: number): Observable<ResponseDto<PurchaseModel>> {
    return this.getRequest<ResponseDto<PurchaseDto>>(`/${id}`).pipe(
      map((response) => ({
        ...response,
        data: PurchaseMapper.fromApi(response.data),
      })),
    );
  }

  search(body: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<PurchaseModel>>> {
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<PurchaseDto>>>(
      `/search`,
      body,
    ).pipe(
      map((response) => ({
        ...response,
        data: {
          ...response.data,
          items: response.data.items.map((dto) => PurchaseMapper.fromApi(dto)),
        },
      })),
    );
  }

  print(id: number) {
    return this.http.get(`${environment.apiUrl}/compras/${id}/pdf`, {
      responseType: 'blob',
      observe: 'response',
    });
  }

  getPayments(id: number, includeAnulados = false): Observable<ResponseDto<PurchasePaymentModel[]>> {
    const suffix = includeAnulados ? '?include_anulados=true' : '';
    return this.getRequest<ResponseDto<PurchasePaymentDto[]>>(`/${id}/pagos${suffix}`).pipe(
      map((response) => ({
        ...response,
        data: (response.data ?? []).map((dto) => PurchaseMapper.paymentFromApi(dto)),
      })),
    );
  }

  registerPayment(id: number, body: RegisterPaymentDto): Observable<ResponseDto<PurchasePaymentModel>> {
    return this.postRequest<RegisterPaymentDto, ResponseDto<PurchasePaymentDto>>(`/${id}/pagar`, body).pipe(
      map((response) => ({
        ...response,
        data: PurchaseMapper.paymentFromApi(response.data),
      })),
    );
  }

  anularPayment(purchaseId: number, paymentId: number): Observable<ResponseDto<any>> {
    return this.deleteRequest(`/${purchaseId}/pagos/${paymentId}`);
  }
}
