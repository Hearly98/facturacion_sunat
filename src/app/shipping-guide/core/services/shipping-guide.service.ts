import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../../../shared/services/base.service';
import { environment } from '../../../../environments/environment';
import { ResponseDto } from '../../../shared/models/api/response.dto';
import { GetShippingGuideModel } from '../models/get-shipping-guide.model';
import { QueryParamsModel } from '../../../shared/models/query/query-params.model';
import { QueryResultsModel } from '../../../shared/models/query/query-results.model';
import { SerieModel } from 'src/app/series/core/models/serie.model';

@Injectable({
  providedIn: 'root',
})
export class ShippingGuideService extends BaseService {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/guias-remision`);
  }

  search(params: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<GetShippingGuideModel>>> {
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<GetShippingGuideModel>>>(
      `/search`,
      params
    );
  }

  getSeries(): Observable<ResponseDto<SerieModel[]>> {
    return this.getRequest<ResponseDto<SerieModel[]>>(`/series`);
  }

  getById(id: number): Observable<ResponseDto<GetShippingGuideModel>> {
    return this.getRequest<ResponseDto<GetShippingGuideModel>>(`/${id}`);
  }

  create(data: any): Observable<ResponseDto<GetShippingGuideModel>> {
    return this.postRequest<any, ResponseDto<GetShippingGuideModel>>('/', data);
  }

  delete(id: number): Observable<ResponseDto<void>> {
    return this.deleteRequest(`/${id}`);
  }

  update(id: number, data: any): Observable<ResponseDto<GetShippingGuideModel>> {
    return this.putRequest<any, ResponseDto<GetShippingGuideModel>>(`/${id}`, data);
  }

  print(id: number): Observable<HttpResponse<Blob>> {
    return this.http.get(`${environment.apiUrl}/guias-remision/${id}/print`, {
      responseType: 'blob',
      observe: 'response',
    });
  }
}