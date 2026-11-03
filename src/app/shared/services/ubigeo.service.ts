import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseDto } from '@shared/models/api/response.dto';

export interface Ubigeo {
  code: string;
  label: string;
}

export interface UbigeoDistrito {
  codigo: string;
  nombre: string;
}

export interface UbigeoProvincia {
  codigo: string;
  nombre: string;
  distritos: UbigeoDistrito[];
}

export interface UbigeoDepartamento {
  codigo: string;
  nombre: string;
  provincias: UbigeoProvincia[];
}

/**
 * Catálogo oficial de SUNAT (~1900 distritos). El backend lo entrega como árbol
 * departamento -> provincias -> distritos; se pide una sola vez por sesión.
 */
@Injectable({ providedIn: 'root' })
export class UbigeoService {
  readonly #http = inject(HttpClient);

  readonly #tree$ = this.#http
    .get<ResponseDto<UbigeoDepartamento[]>>(`${environment.apiUrl}/ubigeos/list`)
    .pipe(
      map((response) => response.data ?? []),
      shareReplay(1),
    );

  readonly #flat$ = this.#tree$.pipe(
    map((departamentos) =>
      departamentos.flatMap((dep) =>
        dep.provincias.flatMap((prov) =>
          prov.distritos.map((dist) => ({
            code: dist.codigo,
            label: `${dep.nombre} / ${prov.nombre} / ${dist.nombre}`,
          })),
        ),
      ),
    ),
    shareReplay(1),
  );

  tree(): Observable<UbigeoDepartamento[]> {
    return this.#tree$;
  }

  list(): Observable<Ubigeo[]> {
    return this.#flat$;
  }

  /** "Departamento / Provincia / Distrito" para un código, o null si no existe. */
  describe(code: string | null | undefined): Observable<string | null> {
    return this.#flat$.pipe(map((all) => all.find((u) => u.code === code)?.label ?? null));
  }
}
