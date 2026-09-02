# TODO — FactuLink Front

> Estado de trabajo actual. Cualquier dev o IA que abre el proyecto debería saber en qué
> estado está sin leer todo el código. Actualizar al final de cada sesión de trabajo.

## Contexto rápido

- **Stack**: Angular 20, standalone components, RxJS, CoreUI + Bootstrap (en migración a
  componentes nativos, ver `ROADMAP.md`), Reactive Forms + `TypedFormGroup`.
- **Backend**: Laravel hexagonal en `../facturacion-api`, responde siempre
  `{data, isValid, messages, errors}` (`ResponseHelper`), auth con Sanctum (sin refresh
  token — los tokens no expiran), docs OpenAPI vía Scramble en `/docs/api.json`.
- **Patrón clave**: cada entidad tiene un `XxxMapper.fromApi()/.toApi()` que traduce el
  DTO del backend (camelCase, palabras en español: `documento`, `tipoDocumentoId`) al
  modelo del frontend (inglés: `document`, `documentTypeId`). Cualquier código que
  parchea un form con datos de la API debe pasar por el Mapper, no leer el DTO directo
  — ver skill `angular-dto-model-mapper` si un campo aparece en blanco sin error.
- **Auth**: `authInterceptor` + `errorInterceptor` en `app.config.ts`. En 401 se
  desloguea, no hay refresh silencioso.

## Convenciones

- Componentes nuevos: **nunca CoreUI**. Seguir el patrón de `shared/components/modal/`
  y `card/` — standalone, signals, `<ng-content>`, solo clases Bootstrap.
- Tests: sin `fixture.detectChanges()` salvo que el test sea específicamente sobre DOM;
  `TestBed.createComponent(X).componentInstance` + llamar métodos directo. Ver skill
  `angular-testing` para los gotchas de NG0201/NG05105/campos privados/etc.
- `ng test` compila TODO el proyecto sin importar `--include` — si un archivo que no
  tocaste rompe la compilación, confirmalo con `git status` antes de asumir que es tuyo.

## Últimas features implementadas

- **2026-09-02** — Rescate de patrones del tech-service (Sprint 1 + Sprint 2, ver
  `RESCATE-TECH-SERVICE.md` en la raíz del monorepo): `currency` pipe (símbolo real de
  `Moneda`, no hardcodeado), util de fecha local (`shared/utils/local-date.util.ts`),
  `empty-state`/`error-state`/`status-badge`/`page-header` (componentes nativos),
  `loadingInterceptor` + `LoadingService`, `sync:types` vía Scramble, CSV export util.
- **2026-08-30** — Corregidos 11 bugs reales de mismatch DTO/modelo en clientes,
  proveedores, ventas y compras (`patchCustomer`/`patchSupplier` leían campos que no
  existen en el DTO real), más un filtro roto en Emisiones. Ver memoria
  `bugfix/blank-tipo-documento-cliente-proveedor`.
- Importación masiva de productos desde Excel con stock auditado en Kardex.
- Venta integrada con Cotización y Guía de Remisión (herencia de precio/logística).
- Paginador compartido rediseñado (números clickeables en vez de texto).

## Bugs conocidos

| Bug | Causa raíz | Estado |
|---|---|---|
| Símbolo de moneda hardcodeado a "S/." en templates de montos | Nunca se leyó `currencySymbol`/`simbolo` del DTO real | Corregido 2026-09-02 (`currency` pipe) |
| Fechas se corren un día en compras (`purchase-edit.page.ts`) | `new Date(string)` sobre `YYYY-MM-DD` se interpreta como medianoche UTC; en Perú (GMT-5) muestra el día anterior | Corregido 2026-09-02 |
| `Moneda.codigo` queda `NULL` al sembrar | `MonedaSeeder.php` solo llena `nombre`/`simbolo` | Pendiente — no programado aún |
| Integración Greenter/SUNAT es un mock | `GreenterSunatClient` simula el envío, nunca arma un XML UBL real ni llama a Greenter | Pendiente — el usuario la implementa él mismo, no delegar |
| Suite completo de `ng test` tiene ~151 fallos preexistentes por falta de `provideHttpClientTesting()`/`provideNoopAnimations()` globales | Ningún setup de test global en el proyecto | Documentado, no arreglado (decisión: es un cambio de infraestructura, no de un archivo) |

## Próximos pasos priorizados

**Alta**
- Migrar gradualmente componentes CoreUI existentes a los nativos (`modal`/`card`/`empty-state`/etc.)
- Completar `Moneda.codigo` en el seeder

**Media**
- Extender `docs/domain/` a los flujos que falten
- Revisar sitios con `new Date(string)` directo fuera de los ya auditados

**Próxima sesión**
- Confirmar con el usuario si migra Sprint 3 del `RESCATE-TECH-SERVICE.md` (ESLint flat
  config, Route Resolvers, Page Objects E2E, eliminar barrels) o si lo deja para más
  adelante.
