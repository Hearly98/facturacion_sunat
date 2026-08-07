# Componentes Nativos: Modal y Card

## Introducción

Documentación completa de los componentes reutilizables nativos de Angular que reemplazan CoreUI. Diseñados para ser **agnósticos, simples y totalmente customizables**.

---

## Tabla de contenidos

1. [Instalación](#instalación)
2. [Modal](#modal)
3. [Card](#card)
4. [Ejemplos prácticos](#ejemplos-prácticos)
5. [Styling](#styling)
6. [Mejores prácticas](#mejores-prácticas)

---

## Instalación

### Import individual

```typescript
import { ModalComponent, ModalHeaderComponent, ModalBodyComponent, ModalFooterComponent } from '@shared/components/modal';
import { CardComponent, CardHeaderComponent, CardBodyComponent, CardFooterComponent } from '@shared/components/card';
```

### En un componente standalone

```typescript
import { Component } from '@angular/core';
import { ModalComponent, ModalHeaderComponent, ModalBodyComponent, ModalFooterComponent } from '@shared/components/modal';
import { CardComponent, CardHeaderComponent, CardBodyComponent, CardFooterComponent } from '@shared/components/card';

@Component({
  selector: 'app-mi-componente',
  standalone: true,
  imports: [
    ModalComponent, 
    ModalHeaderComponent, 
    ModalBodyComponent, 
    ModalFooterComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    CardFooterComponent
  ],
  template: `...`
})
export class MiComponente {}
```

---

## Modal

### Descripción

Componente modal reutilizable que proporciona una capa visual sobre el contenido principal. Incluye header, body y footer con proyección de contenido.

### Estructura

```
ModalComponent (contenedor principal)
├── ModalHeaderComponent (header con botón close)
├── ModalBodyComponent (contenido principal)
└── ModalFooterComponent (botones de acción)
```

### API: ModalComponent

#### Inputs

| Propiedad | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `isOpen` | `Signal<boolean>` | `false` | Controla si el modal está visible |
| `size` | `Signal<ModalSize>` | `'md'` | Tamaño del modal: `'sm' \| 'md' \| 'lg' \| 'xl'` |
| `closeOnBackdropClick` | `boolean` | `true` | Cierra al hacer clic en el overlay |

#### Outputs

| Evento | Descripción |
|--------|-------------|
| `close` | Se emite cuando se cierra el modal (clic en X, backdrop, etc) |

#### Tamaños disponibles

- `sm`: 300px
- `md`: 500px (default)
- `lg`: 800px
- `xl`: 1000px

*En mobile (< 768px): 90vw máximo*

### API: ModalHeaderComponent

#### Inputs

| Propiedad | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `showClose` | `boolean` | `true` | Muestra el botón close (X) |

#### Outputs

| Evento | Descripción |
|--------|-------------|
| `closeClick` | Se emite al hacer clic en el botón close |

#### Content Projection

El contenido dentro del `<app-modal-header>` se proyecta como título.

```html
<app-modal-header>
  Mi Título Aquí
</app-modal-header>
```

### API: ModalBodyComponent

Contenedor con scroll automático para contenido largo. Sin inputs ni outputs.

```html
<app-modal-body>
  <!-- Tu contenido aquí -->
</app-modal-body>
```

### API: ModalFooterComponent

Contenedor para botones de acción. Sin inputs ni outputs. Los botones se alinean a la derecha.

```html
<app-modal-footer>
  <button class="btn btn-secondary">Cancelar</button>
  <button class="btn btn-primary">Guardar</button>
</app-modal-footer>
```

### Ejemplo completo: Modal básico

```typescript
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent, ModalHeaderComponent, ModalBodyComponent, ModalFooterComponent } from '@shared/components/modal';

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, ModalHeaderComponent, ModalBodyComponent, ModalFooterComponent],
  template: `
    <!-- Botón para abrir -->
    <button class="btn btn-primary mb-3" (click)="isOpen.set(true)">
      Crear Usuario
    </button>

    <!-- Modal -->
    <app-modal [isOpen]="isOpen()" size="md" (close)="isOpen.set(false)">
      
      <app-modal-header (closeClick)="isOpen.set(false)">
        Crear Nuevo Usuario
      </app-modal-header>

      <app-modal-body>
        <form>
          <div class="mb-3">
            <label class="form-label">Nombre</label>
            <input type="text" class="form-control" [(ngModel)]="formData.nombre" name="nombre">
          </div>
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" [(ngModel)]="formData.email" name="email">
          </div>
        </form>
      </app-modal-body>

      <app-modal-footer>
        <button class="btn btn-secondary" (click)="isOpen.set(false)">Cancelar</button>
        <button class="btn btn-primary" (click)="onSave()">Guardar</button>
      </app-modal-footer>

    </app-modal>
  `,
  styles: []
})
export class UserModalComponent {
  isOpen = signal(false);
  formData = { nombre: '', email: '' };

  onSave() {
    console.log('Guardando usuario:', this.formData);
    this.isOpen.set(false);
  }
}
```

### Ejemplo: Modal con opciones dinámicas

```typescript
<app-modal 
  [isOpen]="isOpen()" 
  [size]="modalSize()" 
  [closeOnBackdropClick]="allowBackdropClose()"
  (close)="handleClose()"
>
  <app-modal-header [showClose]="showCloseButton()">
    {{ modalTitle() }}
  </app-modal-header>

  <app-modal-body>
    <ng-container [ngSwitch]="modalType()">
      <app-confirm-content *ngSwitchCase="'confirm'" />
      <app-form-content *ngSwitchCase="'form'" />
      <app-info-content *ngSwitchDefault />
    </ng-container>
  </app-modal-body>

  <app-modal-footer *ngIf="showFooter()">
    <button class="btn btn-secondary" (click)="isOpen.set(false)">
      {{ cancelText() }}
    </button>
    <button class="btn btn-primary" (click)="onConfirm()">
      {{ confirmText() }}
    </button>
  </app-modal-footer>
</app-modal>
```

---

## Card

### Descripción

Componente contenedor para agrupar contenido relacionado. Proporciona un layout con header, body y footer opcionales.

### Estructura

```
CardComponent (contenedor principal)
├── CardHeaderComponent (encabezado)
├── CardBodyComponent (contenido)
└── CardFooterComponent (pie)
```

### API: CardComponent

Sin inputs ni outputs. Es un wrapper puro para layout.

### API: CardHeaderComponent

Encabezado con fondo gris. Sin inputs ni outputs.

```html
<app-card-header>
  Información del Cliente
</app-card-header>
```

### API: CardBodyComponent

Contenedor principal con padding. Sin inputs ni outputs.

```html
<app-card-body>
  <!-- Tu contenido -->
</app-card-body>
```

### API: CardFooterComponent

Pie con fondo gris y borde superior. Sin inputs ni outputs.

```html
<app-card-footer>
  <!-- Botones o acciones -->
</app-card-footer>
```

### Ejemplo completo: Card con información

```typescript
<app-card>
  <app-card-header>
    Detalles del Pedido
  </app-card-header>

  <app-card-body>
    <div class="row">
      <div class="col-md-6">
        <p><strong>Número:</strong> #PED-001</p>
        <p><strong>Cliente:</strong> Juan Pérez</p>
      </div>
      <div class="col-md-6">
        <p><strong>Fecha:</strong> 29/06/2026</p>
        <p><strong>Estado:</strong> <span class="badge bg-success">Completado</span></p>
      </div>
    </div>
  </app-card-body>

  <app-card-footer>
    <button class="btn btn-sm btn-outline-primary">Editar</button>
    <button class="btn btn-sm btn-outline-danger">Eliminar</button>
  </app-card-footer>
</app-card>
```

### Ejemplo: Card anidadas (lista de items)

```typescript
<app-card>
  <app-card-header>
    Facturas Pendientes
  </app-card-header>

  <app-card-body>
    <div *ngFor="let factura of facturas()" class="mb-2">
      <app-card>
        <app-card-body class="d-flex justify-content-between align-items-center">
          <div>
            <strong>{{ factura.numero }}</strong>
            <br>
            {{ factura.cliente }}
          </div>
          <div>
            <span class="badge bg-warning">{{ factura.dias_vencimiento }} días</span>
            <strong class="ms-2">{{ factura.monto | currency }}</strong>
          </div>
        </app-card-body>
      </app-card>
    </div>
  </app-card-body>
</app-card>
```

### Ejemplo: Card solo body (minimalista)

```typescript
<app-card>
  <app-card-body>
    <h5>Quick Stats</h5>
    <p>Total vendido: $10,000</p>
  </app-card-body>
</app-card>
```

---

## Ejemplos prácticos

### Caso 1: Modal de confirmación

```typescript
import { Component, Output, EventEmitter, Input, signal } from '@angular/core';
import { ModalComponent, ModalHeaderComponent, ModalBodyComponent, ModalFooterComponent } from '@shared/components/modal';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [ModalComponent, ModalHeaderComponent, ModalBodyComponent, ModalFooterComponent],
  template: `
    <app-modal [isOpen]="isOpen()" size="sm" [closeOnBackdropClick]="false">
      <app-modal-header [showClose]="false">Confirmación</app-modal-header>
      
      <app-modal-body>
        <p>{{ message() }}</p>
      </app-modal-body>

      <app-modal-footer>
        <button class="btn btn-secondary" (click)="onCancel()">Cancelar</button>
        <button class="btn btn-danger" (click)="onConfirm()">Eliminar</button>
      </app-modal-footer>
    </app-modal>
  `
})
export class ConfirmModalComponent {
  @Input() isOpen = signal(false);
  @Input() message = signal('¿Está seguro?');
  @Output() confirmed = new EventEmitter<void>();

  onConfirm() {
    this.confirmed.emit();
    this.isOpen.set(false);
  }

  onCancel() {
    this.isOpen.set(false);
  }
}
```

Uso:
```typescript
<app-confirm-modal 
  [isOpen]="showConfirm()" 
  [message]="'¿Eliminar este cliente?'"
  (confirmed)="deleteClient()"
/>
```

### Caso 2: Modal con formulario reactivo

```typescript
import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent, ModalHeaderComponent, ModalBodyComponent, ModalFooterComponent } from '@shared/components/modal';

@Component({
  selector: 'app-client-form-modal',
  standalone: true,
  imports: [
    ModalComponent, ModalHeaderComponent, ModalBodyComponent, ModalFooterComponent,
    ReactiveFormsModule
  ],
  template: `
    <app-modal [isOpen]="isOpen()" size="lg" (close)="onClose()">
      <app-modal-header (closeClick)="onClose()">
        {{ isEditing() ? 'Editar Cliente' : 'Nuevo Cliente' }}
      </app-modal-header>

      <app-modal-body>
        <form [formGroup]="form">
          <div class="mb-3">
            <label class="form-label">Nombre</label>
            <input type="text" class="form-control" formControlName="nombre">
          </div>
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" formControlName="email">
          </div>
          <div class="mb-3">
            <label class="form-label">Teléfono</label>
            <input type="tel" class="form-control" formControlName="telefono">
          </div>
        </form>
      </app-modal-body>

      <app-modal-footer>
        <button class="btn btn-secondary" (click)="onClose()">Cancelar</button>
        <button class="btn btn-primary" [disabled]="!form.valid" (click)="onSave()">
          Guardar
        </button>
      </app-modal-footer>
    </app-modal>
  `
})
export class ClientFormModalComponent {
  isOpen = signal(false);
  isEditing = signal(false);
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required]
    });
  }

  onClose() {
    this.isOpen.set(false);
    this.form.reset();
  }

  onSave() {
    if (this.form.valid) {
      console.log('Datos guardados:', this.form.value);
      this.onClose();
    }
  }
}
```

### Caso 3: Dashboard con cards

```typescript
import { Component, signal } from '@angular/core';
import { CardComponent, CardBodyComponent, CardHeaderComponent, CardFooterComponent } from '@shared/components/card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CardComponent, CardBodyComponent, CardHeaderComponent, CardFooterComponent],
  template: `
    <div class="container-fluid mt-4">
      <div class="row">
        <div class="col-md-4">
          <app-card>
            <app-card-body class="text-center">
              <h3>{{ totalVentas() | currency }}</h3>
              <p class="text-muted">Total Vendido</p>
            </app-card-body>
          </app-card>
        </div>

        <div class="col-md-4">
          <app-card>
            <app-card-body class="text-center">
              <h3>{{ pedidosPendientes() }}</h3>
              <p class="text-muted">Pedidos Pendientes</p>
            </app-card-body>
          </app-card>
        </div>

        <div class="col-md-4">
          <app-card>
            <app-card-body class="text-center">
              <h3>{{ clientesActivos() }}</h3>
              <p class="text-muted">Clientes Activos</p>
            </app-card-body>
          </app-card>
        </div>
      </div>

      <div class="row mt-4">
        <div class="col-md-12">
          <app-card>
            <app-card-header>Últimas Transacciones</app-card-header>
            <app-card-body>
              <table class="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Monto</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let t of transacciones()">
                    <td>{{ t.fecha | date }}</td>
                    <td>{{ t.cliente }}</td>
                    <td>{{ t.monto | currency }}</td>
                    <td><span class="badge" [ngClass]="t.estado === 'completado' ? 'bg-success' : 'bg-warning'">{{ t.estado }}</span></td>
                  </tr>
                </tbody>
              </table>
            </app-card-body>
          </app-card>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  totalVentas = signal(10000);
  pedidosPendientes = signal(15);
  clientesActivos = signal(42);
  transacciones = signal([
    { fecha: new Date(), cliente: 'Juan', monto: 500, estado: 'completado' },
    { fecha: new Date(), cliente: 'María', monto: 1200, estado: 'pendiente' }
  ]);
}
```

---

## Styling

### Bootstrap Integration

Ambos componentes usan clases Bootstrap:
- `form-control`, `form-label` para formularios
- `btn`, `btn-primary`, `btn-secondary` para botones
- `badge`, `table` para contenido
- `row`, `col-*` para grid

### Custom CSS

Puedes agregar tus propios estilos en el componente que los usa:

```typescript
@Component({
  selector: 'app-mi-modal',
  standalone: true,
  imports: [ModalComponent, ...],
  template: `
    <app-modal class="mi-modal-custom">
      <!-- contenido -->
    </app-modal>
  `,
  styles: [`
    :host ::ng-deep .mi-modal-custom .modal-container {
      border-radius: 1rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    }
  `]
})
export class MiModalComponent {}
```

### Animaciones

El Modal anima con fade in/out (150ms). Para cambiar la velocidad, edita `modal.component.ts`:

```typescript
animate('150ms ease-in', style({ opacity: 1 }))  // Cambiar 150ms
```

---

## Mejores prácticas

### ✅ DO's

1. **Usa signals para state**
   ```typescript
   isOpen = signal(false);
   modalSize = signal<ModalSize>('md');
   ```

2. **Content projection para flexibilidad**
   ```html
   <app-modal-body>
     <!-- Puede ser cualquier cosa -->
   </app-modal-body>
   ```

3. **Handles output events**
   ```html
   <app-modal (close)="handleClose()">
   ```

4. **Keep components agnóstico**
   ```typescript
   // ✅ Bien: no asume caso de uso
   <app-card>
     <app-card-body>{{ contenido }}</app-card-body>
   </app-card>
   ```

### ❌ DON'Ts

1. **No adds business logic dentro del componente**
   ```typescript
   // ❌ Mal
   onSave() {
     this.apiService.save(this.form.value); // lógica de negocio aquí
   }
   
   // ✅ Bien
   @Output() save = new EventEmitter();
   onSave() {
     this.save.emit(this.form.value); // el padre maneja la lógica
   }
   ```

2. **No hardcodes valores**
   ```typescript
   // ❌ Mal
   <app-modal size="lg">
   
   // ✅ Bien
   <app-modal [size]="modalSize()">
   ```

3. **No mezcles content projection con inputs**
   ```typescript
   // ❌ Mal
   <app-modal [title]="'Editar'" (close)="...">
     <!-- ¿dónde va el contenido? -->
   </app-modal>
   
   // ✅ Bien
   <app-modal (close)="...">
     <app-modal-header>Editar</app-modal-header>
     <app-modal-body><!-- contenido --></app-modal-body>
   </app-modal>
   ```

### Testing

Para tests, mock los signals:

```typescript
import { signal } from '@angular/core';
import { ModalComponent } from '@shared/components/modal';

describe('MiComponente', () => {
  it('should open modal', () => {
    const component = new MiComponenteComponent();
    component.isOpen.set(true);
    expect(component.isOpen()).toBe(true);
  });
});
```

---

## FAQ

**P: ¿Cómo hago un modal sin header?**

R: No incluyas `<app-modal-header>`:
```html
<app-modal>
  <app-modal-body>Contenido sin header</app-modal-body>
</app-modal>
```

**P: ¿Cómo cambio los colores de los botones?**

R: Bootstrap utilities en el footer:
```html
<app-modal-footer>
  <button class="btn btn-success">Aprobar</button>
  <button class="btn btn-danger">Rechazar</button>
</app-modal-footer>
```

**P: ¿Puedo anidar modales?**

R: Técnicamente sí, pero no es recomendado UX-wise. Si lo necesitas, asegúrate que cada modal tenga su propio z-index.

**P: ¿Qué pasa si el contenido es muy largo?**

R: `ModalBodyComponent` tiene `overflow-y: auto`, así que scrollea automáticamente.

**P: ¿Cómo animaciones más complejas?**

R: Edita las animations en `modal.component.ts`:
```typescript
transition(':enter', [
  style({ opacity: 0, scale: 0.95 }),
  animate('200ms ease-out', style({ opacity: 1, scale: 1 }))
])
```

---

## Próximos pasos

1. **Entiende la estructura** — lee este documento y los archivos .ts
2. **Prueba localmente** — crea un componente de prueba
3. **Migra gradualmente** — reemplaza CoreUI en 76 archivos poco a poco
4. **Crea más componentes** — Button, Input, Select si los necesitas

---

*Última actualización: 2026-06-29*
*Versión: 1.0*
