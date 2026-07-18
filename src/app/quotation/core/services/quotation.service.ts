import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseDto } from '@shared/models/api/response.dto';
import { QuotationModel } from '../models/quotation.model';
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
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<QuotationModel>>>(
      `/search`,
      body
    );
  }

  getSeries(): Observable<ResponseDto<Serie[]>> {
    return this.getRequest<ResponseDto<Serie[]>>(`/series`);
  }

  getById(id: number): Observable<ResponseDto<QuotationModel>> {
    return this.getRequest<ResponseDto<QuotationModel>>(`/${id}`);
  }

  create(data: any): Observable<ResponseDto<QuotationModel>> {
    return this.postRequest('', data);
  }

  update(id: number, data: any): Observable<ResponseDto<QuotationModel>> {
    return this.putRequest(`/${id}`, data);
  }

  anular(id: number): Observable<ResponseDto<void>> {
    return this.postRequest(`/${id}/anular`, {});
  }

  print(id: number) {
    return this.http.get(`${environment.apiUrl}/cotizaciones/${id}/pdf`, {
      responseType: 'blob',
      observe: 'response'
    });
  }
}
