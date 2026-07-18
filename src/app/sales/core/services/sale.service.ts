import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseDto } from '@shared/models/api/response.dto';
import { SaleModel } from '../models/sale.model';
import { Serie } from 'src/app/series/core/models/serie.model';
import { QueryParamsModel } from '@shared/models/query/query-params.model';
import { BaseService } from '@shared/services/base.service';
import { QueryResultsModel } from '@shared/models/query/query-results.model';

@Injectable({
  providedIn: 'root',
})
export class SaleService extends BaseService {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/ventas`);
  }

  search(body: QueryParamsModel): Observable<ResponseDto<QueryResultsModel<SaleModel>>> {
    return this.postRequest<QueryParamsModel, ResponseDto<QueryResultsModel<SaleModel>>>(
      `/search`,
      body
    );
  }

  getSeriesByDocType(docId: number): Observable<ResponseDto<Serie[]>> {
    return this.getRequest<ResponseDto<Serie[]>>(`/series/${docId}`);
  }

  getById(id: number): Observable<ResponseDto<SaleModel>> {
    return this.getRequest<ResponseDto<SaleModel>>(`/${id}`);
  }

  create(data: any): Observable<ResponseDto<SaleModel>> {
    return this.postRequest<any, ResponseDto<SaleModel>>('', data);
  }

  delete(id: number): Observable<ResponseDto<void>> {
    return this.deleteRequest<ResponseDto<void>>(`/${id}`);
  }

  print(id: number) {
    return this.http.get(`${environment.apiUrl}/ventas/${id}/pdf?formato=a4`, {
      responseType: 'blob',
      observe: 'response'
    });
  }
}
