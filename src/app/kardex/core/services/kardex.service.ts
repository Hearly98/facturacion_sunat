import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseService } from '../../../shared/services/base.service';
import { ResponseDto } from '../../../shared/models/api/response.dto';
import { environment } from '../../../../environments/environment';
import { KardexDto } from '../dto/kardex.dto';
import { KardexModel, KardexQuery } from '../models/kardex.model';
import { KardexMapper } from '../mappers/kardex.mapper';

@Injectable({
  providedIn: 'root',
})
export class KardexService extends BaseService {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/kardex`);
  }

  /** Movements of one product in one warehouse, with the running balance of each row. */
  getKardex(query: KardexQuery): Observable<ResponseDto<KardexModel>> {
    let params = new HttpParams().set('producto_id', query.productId).set('almacen_id', query.warehouseId);
    if (query.dateFrom) params = params.set('fecha_desde', query.dateFrom);
    if (query.dateTo) params = params.set('fecha_hasta', query.dateTo);

    return this.http
      .get<ResponseDto<KardexDto>>(`${this.baseUrl}/movimientos`, { params, headers: this.getHeaders() })
      .pipe(map((response) => ({ ...response, data: KardexMapper.fromApi(response.data) })));
  }
}
