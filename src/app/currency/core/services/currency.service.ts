import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../../../shared/services/base.service';
import { ResponseDto } from '../../../shared/models/api/response.dto';
import { QueryParamsModel } from '../../../shared/models/query/query-params.model';
import { QueryResultsModel } from '../../../shared/models/query/query-results.model';
import { GetCurrencyModel } from '../models/get-currency.model';
import { CreateCurrencyModel } from '../models/create-currency.model';
import { UpdateCurrencyModel } from '../models/update-currency.model';
import { environment } from '../../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class CurrencyService extends BaseService {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/monedas`);
  }

  getAll(): Observable<ResponseDto<GetCurrencyModel[]>> {
    return this.getRequest<ResponseDto<GetCurrencyModel[]>>('');
  }

  getById(id: number): Observable<ResponseDto<GetCurrencyModel>> {
    return this.getRequest<ResponseDto<GetCurrencyModel>>(`/${id}`);
  }

  create(body: CreateCurrencyModel): Observable<ResponseDto<GetCurrencyModel>> {
    return this.postRequest<CreateCurrencyModel, ResponseDto<GetCurrencyModel>>('/', body);
  }

  update(body: UpdateCurrencyModel): Observable<ResponseDto<GetCurrencyModel>> {
    return this.putRequest<UpdateCurrencyModel, ResponseDto<GetCurrencyModel>>('/', body);
  }

  delete(id: number): Observable<ResponseDto<GetCurrencyModel>> {
    return this.deleteRequest(`/${id}`);
  }

  search(body: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<GetCurrencyModel>>> {
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<GetCurrencyModel>>>(
      `/search`,
      body
    );
  }
}
