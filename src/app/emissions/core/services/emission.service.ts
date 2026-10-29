import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { EmissionMapper } from '../mappers/emission.mapper';
import { EmissionDetailDto, EmissionDto, EmissionSummaryDto } from '../models/emission.dtos';
import { EmissionDetail, EmissionFamily, EmissionFilters, EmissionPage, EmissionSummary } from '../models/emission.models';

export type EmissionFile = 'xml' | 'cdr' | 'pdf';

/** Módulo de Emisiones (`/emisiones`). Responde JSON plano; errores de negocio con { message }. */
@Injectable({ providedIn: 'root' })
export class EmissionService {
  readonly #http = inject(HttpClient);
  readonly #api = `${environment.apiUrl}/emisiones`;

  list(filters: EmissionFilters): Observable<EmissionPage> {
    return this.#http
      .get<{ data: EmissionDto[]; pagination: { total: number; page: number; last_page: number } }>(this.#api, {
        params: EmissionMapper.filtersToParams(filters),
      })
      .pipe(
        map(({ data, pagination }) => ({
          items: data.map(EmissionMapper.fromApi),
          total: pagination.total,
          page: pagination.page,
          lastPage: pagination.last_page,
        })),
      );
  }

  summary(family: EmissionFamily): Observable<EmissionSummary> {
    return this.#http
      .get<{ data: EmissionSummaryDto }>(`${this.#api}/resumen`, { params: { familia: family } })
      .pipe(map(({ data }) => EmissionMapper.summaryFromApi(data)));
  }

  detail(id: number): Observable<EmissionDetail> {
    return this.#http.get<{ data: EmissionDetailDto }>(`${this.#api}/${id}`).pipe(map(({ data }) => EmissionMapper.detailFromApi(data)));
  }

  sendNow(id: number): Observable<EmissionDetail> {
    return this.#http
      .post<{ data: EmissionDetailDto }>(`${this.#api}/${id}/enviar`, {})
      .pipe(map(({ data }) => EmissionMapper.detailFromApi(data)));
  }

  sendBatch(ids: number[]): Observable<{ queued: number; skipped: number }> {
    return this.#http
      .post<{ data: { encoladas: number; omitidas: number } }>(`${this.#api}/enviar-lote`, { ids })
      .pipe(map(({ data }) => ({ queued: data.encoladas, skipped: data.omitidas })));
  }

  reschedule(id: number): Observable<EmissionDetail> {
    return this.#http
      .post<{ data: EmissionDetailDto }>(`${this.#api}/${id}/reprogramar`, {})
      .pipe(map(({ data }) => EmissionMapper.detailFromApi(data)));
  }

  download(id: number, file: EmissionFile): Observable<HttpResponse<Blob>> {
    return this.#http.get(`${this.#api}/${id}/${file}`, { responseType: 'blob', observe: 'response' });
  }
}

export const emissionErrorMessage = (error: any): string =>
  error?.error?.message ?? 'No se pudo completar la operación';
