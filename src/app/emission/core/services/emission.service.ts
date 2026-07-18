import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GetEmissionModel } from '../models/get-emission.model';
import { PageParamsModel } from '@shared/models/query/page-params.model';

@Injectable({
  providedIn: 'root',
})
export class EmissionService {
  #http = inject(HttpClient);
  #apiUrl = '/api/emissions';

  getEmissions(params: Record<string, any>): Observable<{
    data: GetEmissionModel[];
    pagination: PageParamsModel;
  }> {
    return this.#http.get<{
      data: GetEmissionModel[];
      pagination: PageParamsModel;
    }>(this.#apiUrl, { params });
  }

  downloadPdf(emissionId: number): Observable<Blob> {
    return this.#http.get(`${this.#apiUrl}/${emissionId}/pdf`, {
      responseType: 'blob',
    });
  }

  downloadXml(emissionId: number): Observable<Blob> {
    return this.#http.get(`${this.#apiUrl}/${emissionId}/xml`, {
      responseType: 'blob',
    });
  }

  downloadCdr(emissionId: number): Observable<Blob> {
    return this.#http.get(`${this.#apiUrl}/${emissionId}/cdr`, {
      responseType: 'blob',
    });
  }
}
