import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { UbigeoService } from './ubigeo.service';

// Forma real de GET /ubigeos/list: árbol departamento -> provincias -> distritos.
const ARBOL = [
  {
    codigo: '15',
    nombre: 'Lima',
    provincias: [
      {
        codigo: '1501',
        nombre: 'Lima',
        distritos: [
          { codigo: '150101', nombre: 'Lima' },
          { codigo: '150104', nombre: 'Barranco' },
        ],
      },
    ],
  },
];

describe('UbigeoService', () => {
  let service: UbigeoService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(UbigeoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function responder() {
    http.expectOne((r) => r.url.endsWith('/ubigeos/list')).flush({ data: ARBOL, isValid: true });
  }

  it('expone el árbol para los combos en cascada', async () => {
    const promesa = firstValueFrom(service.tree());
    responder();

    const arbol = (await promesa) as any[];
    expect(arbol[0].provincias[0].distritos[1].codigo).toBe('150104');
  });

  it('aplana el árbol con una etiqueta legible por distrito', async () => {
    const promesa = firstValueFrom(service.list());
    responder();

    expect(await promesa).toContain({ code: '150104', label: 'Lima / Lima / Barranco' });
  });

  it('describe un código y devuelve null si no existe', async () => {
    const promesa = firstValueFrom(service.describe('150104'));
    responder();
    expect(await promesa).toBe('Lima / Lima / Barranco');

    expect(await firstValueFrom(service.describe('999999'))).toBeNull();
  });

  it('pide el catálogo una sola vez por sesión', () => {
    service.tree().subscribe();
    service.list().subscribe();
    responder();
  });
});
