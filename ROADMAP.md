# ROADMAP — FactuLink Front

> Documentación viva. Refleja el estado real del código, no un diseño aspiracional.
> Última actualización: 2026-09-02.

## Descripción

Panel de administración para un sistema de facturación electrónica (SUNAT, Perú):
gestión de clientes, proveedores, productos/inventario (kardex), cotizaciones, compras,
ventas, guías de remisión y emisión de comprobantes electrónicos.

## Stack tecnológico

| Aspecto | Elección |
|---|---|
| Framework | Angular 20 (standalone components, sin NgModules) |
| Estado | RxJS (`Observable`, `subscribe`) + `signal()` puntual en componentes nuevos |
| Forms | Reactive Forms + `TypedFormGroup` |
| UI | CoreUI + Bootstrap 5 + SCSS (**en migración gradual a componentes nativos**, ver abajo) |
| Testing | Karma/Jasmine (unit) + Playwright (e2e) |
| Package manager | npm |
| Backend | Laravel (`facturacion-api`), arquitectura hexagonal, Sanctum (auth), Scramble (docs OpenAPI en `/docs/api.json`) |
| SSR/PWA | Ninguno — panel admin interno, no necesita SEO ni offline por ahora |

## Decisiones técnicas

| Decisión | Razón |
|---|---|
| RxJS en vez de Signals-only | Angular 20 no tiene `httpResource()`/`Signal Forms` estables — se evalúa migrar cuando se suba a Angular 22 (ver "Migración a Angular 22" abajo, la encara el equipo directamente, no delegado) |
| CoreUI hoy, componentes nativos a futuro | Ver sección "Migración de componentes UI" |
| Feature-per-folder (`<feature>/core/{models,services,types}/helpers/pages/components`) | Consistencia con el resto del proyecto, cada módulo es autocontenido |
| DTOs backend en camelCase español (`documento`, `tipoDocumentoId`) mapeados a modelos en inglés vía `XxxMapper` | El backend expone su propia convención; el mapper es el único punto donde se traduce — ver skill `angular-dto-model-mapper` para el porqué |
| `ResponseHelper` del backend: `{data, isValid, messages, errors}` leído en el nivel superior por todo servicio | No se adopta un interceptor que desenvuelva la respuesta — rompería cada `subscribe()` existente (evaluado y descartado explícitamente, no es un olvido) |

## Migración de componentes UI (CoreUI → nativos)

Existe una iniciativa empezada el 2026-06-29 (`shared/components/modal/`, `card/`,
documentada en `COMPONENTES_NATIVOS.md`) que reemplaza componentes CoreUI por versiones
propias: signals para estado, `<ng-content>` para proyección, solo clases Bootstrap
(sin componentes Angular de CoreUI). Se abandonó sin adopción: hoy 74 archivos siguen
usando `@coreui/angular` y `modal`/`card` nativos se usan en 0 archivos.

**Regla vigente desde 2026-09-02: todo componente NUEVO sigue esta convención nativa,
no CoreUI.** La migración de componentes existentes es gradual, feature por feature —
no hay fecha límite, se hace cuando se toca cada pantalla por otra razón.

## Estructura del proyecto

```
src/app/
├── core/            # config, interceptors, servicios transversales (auth, permisos)
├── shared/          # components/, pipes/, utils/, services/, alerts/, confirm-modal/
├── layout/          # shell de la app (sidebar, header)
└── <feature>/       # un directorio por módulo de negocio
    └── core/{models,services,types}/, helpers/, pages/, components/
```

## Checklist por módulo

- [x] Clientes (`customer/`) — CRUD, búsqueda rápida, tipo de documento
- [x] Proveedores (`supplier/`) — CRUD, búsqueda rápida
- [x] Productos (`products/`) — CRUD, importación masiva desde Excel con Kardex auditado
- [x] Categorías (`category/`), Marcas (`brand/`), Unidad de medida (`unit-of-measure/`)
- [x] Almacenes (`almacen/`) — stock por almacén, transferencias
- [x] Kardex/Movimientos (`kardex/`, `movimiento/`) — ingreso, salida, traslado
- [x] Cotizaciones (`quotation/`) — creación, estados, clonado, vínculo a venta/guía
- [x] Compras (`purchase/`) — creación, edición, PDF
- [x] Ventas (`sales/`) — creación, historial, vínculo con cotización/guía de remisión
- [x] Guías de remisión (`shipping-guide/`) — creación, edición, PDF, clonado
- [x] Emisión SUNAT (`emission/`) — listado, descarga PDF/XML/CDR (**integración Greenter real: pendiente, hoy es un mock — el usuario la encara él mismo**)
- [x] Sucursales (`sucursal/`), Bancos (`banco/`), Series (`series/`), Métodos de pago (`payment-method/`), Tipos de documento (`document-type/`), Monedas (`currency/`)
- [x] Usuarios (`user/`), Roles (`rol/`), Organización (`organization/`)
- [ ] Portal público de consulta (no existe, no se necesita por ahora)

## Próximos pasos priorizados

**Alta**
- Migrar gradualmente los 74 archivos CoreUI → componentes nativos, empezando por los que se tocan por otra razón
- Integración real Greenter/SUNAT (reemplazar el mock de `GreenterSunatClient`) — el usuario la implementa directamente

**Media**
- Completar `Moneda.codigo` en el seeder (`MonedaSeeder.php` no lo llena hoy)
- Extender `docs/domain/` a más flujos a medida que se documentan

**Baja / evaluado y descartado por ahora**
- `apiResponseInterceptor` — requiere refactor invasivo de todos los servicios, no vale la pena hoy
- Refresh token / rotación — Sanctum no tiene expiración de tokens configurada, no aplica
- SSR, PWA, multi-tenant en el front — panel admin interno sin esas necesidades
- Vitest/Stryker, Signals-only, `@Service()`, `httpResource()`, Signal Forms — requieren Angular 22; se evalúan cuando se suba de versión, y esa migración la encara el equipo directamente para entenderla bien, no delegada
