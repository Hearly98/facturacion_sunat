import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseDto } from '@shared/models/api/response.dto';

export interface Ubigeo {
  code: string;
  label: string;
}

interface UbigeoDto {
  codigo_ubigeo: string;
  departamento: string;
  provincia: string;
  distrito: string;
}

@Injectable({ providedIn: 'root' })
export class UbigeoService {
  readonly #http = inject(HttpClient);

  // Catálogo estático (~1900 filas): se pide una sola vez por sesión
  readonly #all$ = this.#http.get<ResponseDto<UbigeoDto[]>>(`${environment.apiUrl}/ubigeos/list`).pipe(
    map((response) =>
      (response.data ?? []).map((u) => ({
        code: u.codigo_ubigeo,
        label: `${u.departamento} / ${u.provincia} / ${u.distrito}`,
      })),
    ),
    shareReplay(1),
  );

  list(): Observable<Ubigeo[]> {
    return this.#all$;
  }
}
