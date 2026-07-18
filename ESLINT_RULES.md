# ESLint Rules - Guía de Convenciones

Este documento detalla las reglas personalizadas de ESLint implementadas en el proyecto.

## 1. Máximo de Líneas por Función (25 líneas)

### Regla
`@typescript-eslint/max-lines-per-function: 25`

### Propósito
Forzar funciones pequeñas y focalizadas. Funciones largas son difíciles de entender y mantener.

### Límites
- **25 líneas máximo** (contando líneas de código significativo)
- No cuentan líneas en blanco ni comentarios

### Ejemplo ❌ INCORRECTO
```typescript
// Más de 25 líneas = ERROR
public procesarDatos(datos: any[]): void {
  const resultado = [];
  for (let i = 0; i < datos.length; i++) {
    const item = datos[i];
    if (item.activo) {
      const transformado = {
        id: item.id,
        nombre: item.nombre.toUpperCase(),
        valor: item.valor * 1.1,
        fecha: new Date()
      };
      resultado.push(transformado);
    }
  }
  // ... más código
}
```

### Ejemplo ✅ CORRECTO
```typescript
public procesarDatos(datos: any[]): void {
  const datosActivos = this.filtrarActivos(datos);
  const resultado = datosActivos.map(item => this.transformarItem(item));
  this.guardarResultado(resultado);
}

private filtrarActivos(datos: any[]): any[] {
  return datos.filter(item => item.activo);
}

private transformarItem(item: any): any {
  return {
    id: item.id,
    nombre: item.nombre.toUpperCase(),
    valor: item.valor * 1.1,
    fecha: new Date()
  };
}
```

### Cómo aplicar
- **Divide funciones largas** en funciones más pequeñas
- **Extrae lógica repetida** a funciones helper
- **Usa métodos privados** para separar responsabilidades

---

## 2. Máximo de Líneas por Componente (300 líneas)

### Regla
`max-lines: 300`

### Propósito
Componentes grandes violan el Single Responsibility Principle. Componentes > 300 líneas deben ser divididos.

### Límites
- **300 líneas máximo** por archivo
- No cuentan líneas en blanco ni comentarios

### Ejemplo ❌ INCORRECTO (componente monolítico)
```typescript
// Componente.ts con 400+ líneas
// - Lógica de formulario
// - Lógica de tabla
// - Lógica de modal
// - Lógica de validación
// PROBLEMA: Demasiadas responsabilidades
```

### Ejemplo ✅ CORRECTO (componentes especializados)
```
componente/
├── componente-list.ts          (lista principal)
├── componente-form-modal.ts    (formulario)
├── componente-table.ts         (tabla especializada)
└── componente-validators.ts    (validaciones)
```

### Cómo aplicar
1. **Identifica responsabilidades** diferentes en el componente
2. **Divide en sub-componentes** o componentes separados
3. **Extrae lógica compartida** a servicios

---

## 3. Restricción de Comentarios

### Regla
`spaced-comment: [error, always, { markers: [...] }]`

### Propósito
- Código limpio y auto-documentado
- Solo comentarios que documenten (parámetros, lógica compleja, workarounds)
- No comentarios obvios

### Permitidos ✅
```typescript
// param: userData - objeto con datos del usuario
// returns: Promise<Usuario> con datos persistidos
// throws: ValidationError si faltan campos requeridos

public guardarUsuario(usuario: Usuario): Promise<Usuario> {
  // Validar antes de persistir
  if (!usuario.nombre) {
    throw new ValidationError('Nombre requerido');
  }

  return this.api.post('/usuarios', usuario);
}
```

### No permitidos ❌
```typescript
// Esto es malo - Obtener el usuario (obviedad)
const usuario = this.obtenerUsuario();

// Otro comentario malo - Incrementar contador (obvio en el código)
this.contador++;

// Comentario de sección vieja - TODO borrar esto en 2026
const valoresAntiguos = [];
```

### Guía de Documentación
- **param** - parámetros de función
- **returns** - qué retorna
- **throws** - qué excepciones lanza
- **example** - ejemplo de uso
- **@deprecated** - marca código deprecated
- **TODO** / **FIXME** - solo para trabajo pendiente real

---

## 4. Nomenclatura: Dominio + Acción

### Regla
Convención (no automatizable completamente en ESLint)

### Propósito
Código legible y autoexplicativo. El nombre debe comunicar QUÉ hace y EN QUÉ dominio.

### Estructura
```
[dominio][acción]
```

### Ejemplos por Contexto

#### Funciones/Métodos
```typescript
// Dominio: brand, Acción: crear
public brandCrear(): void { }

// Dominio: usuario, Acción: validar
public usuarioValidar(usuario: Usuario): boolean { }

// Dominio: filtro, Acción: aplicar
public filtroAplicar(valores: FilterOptions): void { }
```

#### Variables
```typescript
// brandData (datos del brand)
const brandData = await this.brandService.obtener();

// usuarioActual (usuario actual)
const usuarioActual = this.authService.obtenerUsuarioActual();

// filtrosActivos (filtros aplicados)
const filtrosActivos = this.filtroService.obtenerActivos();
```

#### Servicios
```typescript
// BrandService (servicio del dominio Brand)
@Injectable()
export class BrandService { }

// UsuarioService
@Injectable()
export class UsuarioService { }
```

#### Componentes
```typescript
// brand-new-edit-modal (componente para crear/editar brand)
@Component({
  selector: 'app-brand-new-edit-modal',
  templateUrl: './brand-new-edit-modal.html'
})
export class BrandNewEditModalComponent { }

// usuario-list (componente de lista de usuarios)
@Component({
  selector: 'app-usuario-list',
  templateUrl: './usuario-list.html'
})
export class UsuarioListComponent { }
```

#### Observables
```typescript
// marcaGuardar$ (observable que emite cuando se guarda un brand)
marcaGuardar$ = new Subject<Brand>();

// usuarioSeleccionado$ (observable del usuario seleccionado)
usuarioSeleccionado$ = new BehaviorSubject<Usuario | null>(null);
```

### Casos Especiales

#### Validadores
```typescript
// brandValidadores (objeto con funciones de validación)
const brandValidadores = {
  nombre: [Validators.required],
  codigo: [Validators.required, brandCodigoUnico()]
};
```

#### Mappers/Transformadores
```typescript
// brandMapearDelApi (convierte respuesta API a modelo interno)
private brandMapearDelApi(response: BrandApiResponse): Brand { }

// usuarioMapearAlApi (convierte modelo a formato API)
private usuarioMapearAlApi(usuario: Usuario): UsuarioApiRequest { }
```

#### DTOs
```typescript
// BrandCreateDto (DTO para crear brand)
export class BrandCreateDto { }

// UsuarioUpdateDto (DTO para actualizar usuario)
export class UsuarioUpdateDto { }
```

---

## Comandos ESLint

### Verificar problemas
```bash
npm run lint
```

### Arreglar automáticamente
```bash
npm run lint:fix
```

### Verificar archivo específico
```bash
npx eslint src/app/brand/brand.component.ts
```

### Obtener estadísticas
```bash
npx eslint src --ext .ts,.html --format json
```

---

## Excepciones

### Cuándo puedes ignorar reglas (temporalmente)

```typescript
// eslint-disable-next-line @typescript-eslint/max-lines-per-function
public funcionMuyLarga(): void {
  // ...
}

// eslint-disable @typescript-eslint/max-lines-per-function
// (desactiva para todo el resto del archivo)
```

**Importante**: Usa excepciones solo en casos reales (código generado, workarounds de librerías). Documenta por qué.

---

## Resumen de Límites

| Regla | Límite | Propósito |
|-------|--------|----------|
| Líneas por función | 25 | Funciones simples y focalizadas |
| Líneas por archivo | 300 | Componentes con una responsabilidad |
| Comentarios | Solo documentación | Código auto-explicativo |
| Nomenclatura | dominio+acción | Código legible y claro |

---

## Preguntas Frecuentes

### P: ¿Y si mi función necesita más de 25 líneas?
**R**: Es una señal de que la función hace demasiado. Extrae lógica a funciones helper o servicios. Verás que el código es más testeable y reutilizable.

### P: ¿Puedo desactivar estas reglas?
**R**: Sí, con `eslint-disable`, pero solo en casos excepcionales. Documenta por qué.

### P: ¿Cómo nombro variables con múltiples palabras?
**R**: Usa camelCase: `usuarioActual`, `brandGuardado`, `filtrosAplicados`.

### P: ¿Qué pasa con componentes que realmente necesitan ser grandes?
**R**: Divídelo. Si es complejo = múltiples componentes + servicios. Es mejor inversión de tiempo ahora que deuda técnica después.

---

**Última actualización**: 2026-07-18
**Responsable**: Equipo de Frontend
