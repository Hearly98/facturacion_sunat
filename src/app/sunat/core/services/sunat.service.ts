import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';
import { EmissionMapper } from 'src/app/emissions/core/mappers/emission.mapper';
import { SendingPolicy } from 'src/app/emissions/core/models/emission.models';
import { environment } from 'src/environments/environment';
import { SunatMapper } from '../mappers/sunat.mapper';
import { CreditNoteDto, CreditNoteLineDto, SunatConfigDto } from '../models/sunat.dtos';
import {
  CreateCreditNote,
  CreditNote,
  CreditNoteBalance,
  SunatConfig,
  SunatEnvironment,
} from '../models/sunat.models';

/**
 * Configuración SUNAT y notas de crédito. El envío de comprobantes vive en EmissionService (/emisiones).
 * Endpoints SUNAT del backend. Responden JSON plano (no el envoltorio ResponseDto) y los
 * errores de negocio llegan como HTTP 422/409 con { message }.
 */
@Injectable({ providedIn: 'root' })
export class SunatService {
  readonly #http = inject(HttpClient);
  readonly #api = environment.apiUrl;

  getConfig(): Observable<SunatConfig> {
    return this.#http.get<SunatConfigDto>(`${this.#api}/sunat/configuracion`).pipe(map(SunatMapper.configFromApi));
  }

  saveEnvironment(environmentName: SunatEnvironment, exists: boolean): Observable<unknown> {
    return this.saveSettings({ ambiente: environmentName }, exists);
  }

  /** Política de envío del módulo de Emisiones; se guarda junto con el ambiente actual. */
  savePolicy(policy: SendingPolicy, environmentName: SunatEnvironment, exists: boolean): Observable<SunatConfig> {
    return this.saveSettings({ ambiente: environmentName, ...EmissionMapper.policyToApi(policy) }, exists).pipe(
      switchMap(() => this.getConfig()),
    );
  }

  private saveSettings(fields: Record<string, unknown>, exists: boolean): Observable<unknown> {
    const body = { max_intentos: 3, timeout_segundos: 60, ...fields };

    return exists
      ? this.#http.put(`${this.#api}/sunat/configuracion`, body)
      : this.#http.post(`${this.#api}/sunat/configuracion`, body);
  }

  saveCredentials(solUser: string, solPassword: string, certificate: File | null, certificatePassword: string | null): Observable<SunatConfig> {
    const form = new FormData();
    form.append('sol_usuario', solUser);
    form.append('sol_clave', solPassword);
    if (certificate) {
      form.append('certificado', certificate);
      form.append('certificado_password', certificatePassword ?? '');
    }

    return this.#http
      .post<SunatConfigDto>(`${this.#api}/sunat/configuracion/credenciales`, form)
      .pipe(map(SunatMapper.configFromApi));
  }



  getCreditNoteBalance(saleId: number): Observable<CreditNoteBalance> {
    return this.#http
      .get<{ data: { puede_anular: boolean; lineas: CreditNoteLineDto[] } }>(`${this.#api}/ventas/${saleId}/notas-credito/saldo`)
      .pipe(map(({ data }) => ({ canCancel: data.puede_anular, lines: data.lineas.map(SunatMapper.creditNoteLineFromApi) })));
  }

  getCreditNotes(saleId: number): Observable<CreditNote[]> {
    return this.#http
      .get<{ data: CreditNoteDto[] }>(`${this.#api}/notas-credito`, { params: { venta_id: saleId } })
      .pipe(map(({ data }) => data.map(SunatMapper.creditNoteFromApi)));
  }

  createCreditNote(model: CreateCreditNote): Observable<CreditNote> {
    return this.#http
      .post<{ data: CreditNoteDto }>(`${this.#api}/notas-credito`, SunatMapper.createCreditNoteToApi(model))
      .pipe(map(({ data }) => SunatMapper.creditNoteFromApi(data)));
  }


  /** PDF de la nota (documento de facturación); XML y CDR viven en el módulo de Emisiones. */
  downloadCreditNotePdf(creditNoteId: number): Observable<HttpResponse<Blob>> {
    return this.#http.get(`${this.#api}/notas-credito/${creditNoteId}/pdf`, { responseType: 'blob', observe: 'response' });
  }
}

/** Extrae el mensaje de negocio de un HttpErrorResponse del backend SUNAT. */
export const sunatErrorMessage = (error: any): string =>
  error?.error?.message ?? error?.error?.messages?.[0]?.message ?? 'No se pudo completar la operación con SUNAT';
