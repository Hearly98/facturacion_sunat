# Componentes Nativos: Modal y Card

## Estructura creada

```
shared/components/
├── modal/
│   ├── modal.component.ts           (El contenedor principal)
│   ├── modal-header.component.ts    (El header)
│   ├── modal-body.component.ts      (El contenido)
│   ├── modal-footer.component.ts    (Los botones de acción)
│   └── index.ts                     (Export barrel)
│
└── card/
    ├── card.component.ts             (El contenedor)
    ├── card-header.component.ts      (Encabezado)
    ├── card-body.component.ts        (Contenido)
    ├── card-footer.component.ts      (Pie)
    └── index.ts                      (Export barrel)
```

## Filosofía

Ambos son **agnósticos y reutilizables**:
- No tienen lógica de negocio
- Solo hacen presentación
- Aceptan cualquier contenido via `<ng-content>`
- Usan signals para reactividad
- Bootstrap utilities para styling

---

## MODAL - Ejemplos de uso

### Estructura básica (sin integrar todavía)

```typescript
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent, ModalHeaderComponent, ModalBodyComponent, ModalFooterComponent } from '@shared/components/modal';

@Component({
  selector: 'app-mi-componente',
  standalone: true,
  imports: [CommonModule, ModalComponent, ModalHeaderComponent, ModalBodyComponent, ModalFooterComponent],
  template: `
    <!-- Modal: controlas si está abierto o no -->
    <app-modal [isOpen]="isOpen()" size="lg" (close)="isOpen.set(false)">
      
      <!-- Header: título + botón close automático -->
      <app-modal-header (closeClick)="isOpen.set(false)">
        Crear Nuevo Cliente
      </app-modal-header>

      <!-- Body: aquí va tu contenido, lo que sea -->
      <app-modal-body>
        <form>
          <input type="text" class="form-control" placeholder="Nombre">
          <input type="email" class="form-control" placeholder="Email">
        </form>
      </app-modal-body>

      <!-- Footer: tus botones -->
      <app-modal-footer>
        <button class="btn btn-secondary" (click)="isOpen.set(false)">Cancelar</button>
        <button class="btn btn-primary" (click)="onSave()">Guardar</button>
      </app-modal-footer>

    </app-modal>

    <!-- Botón para abrir el modal -->
    <button class="btn btn-primary" (click)="isOpen.set(true)">
      Abrir Modal
    </button>
  `
})
export class MiComponenteComponent {
  isOpen = signal(false);

  onSave() {
    console.log('Guardando...');
  }
}
```

### Parámetros del Modal

```typescript
// Tamaño
<app-modal size="sm">   <!-- 300px -->
<app-modal size="md">   <!-- 500px (default) -->
<app-modal size="lg">   <!-- 800px -->
<app-modal size="xl">   <!-- 1000px -->

// Control de cierre
<app-modal [closeOnBackdropClick]="true">  <!-- Cierra si clicas en el overlay (default) -->
<app-modal [closeOnBackdropClick]="false"> <!-- No cierra si clicas en el overlay -->

// State reactivo
<app-modal [isOpen]="isOpen()"> <!-- Usando signal -->
<app-modal [isOpen]="true">     <!-- Hardcoded -->
```

### Caso real: Modal de búsqueda (como el que ya tienen)

```typescript
@Component({
  selector: 'app-search-document-modal',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent, ModalHeaderComponent, ModalBodyComponent, ModalFooterComponent,
    FormsModule
  ],
  template: `
    <app-modal [isOpen]="isOpen()" size="lg" (close)="onClose()">
      
      <app-modal-header (closeClick)="onClose()">
        <svg class="me-2"><!-- tu icon --></svg>
        Buscar {{ type() === 'cotizacion' ? 'Cotización' : 'Guía' }}
      </app-modal-header>

      <app-modal-body>
        <!-- Tu búsqueda aquí -->
        <div class="input-group mb-3">
          <input type="text" class="form-control" [(ngModel)]="searchTerm" placeholder="Buscar...">
        </div>

        <!-- Tu tabla de resultados -->
        <table class="table">
          <tbody>
            <tr *ngFor="let item of results()">
              <td>{{ item.numero }}</td>
              <td (click)="onSelect(item)">Ver</td>
            </tr>
          </tbody>
        </table>
      </app-modal-body>

    </app-modal>
  `
})
export class SearchDocumentModalComponent {
  isOpen = signal(false);
  type = signal<'cotizacion' | 'guia'>('cotizacion');
  searchTerm = signal('');
  results = signal([]);

  onClose() {
    this.isOpen.set(false);
  }

  onSelect(item: any) {
    this.isOpen.set(false);
    // emitir resultado...
  }
}
```

---

## CARD - Ejemplos de uso

### Estructura básica

```typescript
import { Component } from '@angular/core';
import { CardComponent, CardHeaderComponent, CardBodyComponent, CardFooterComponent } from '@shared/components/card';

@Component({
  template: `
    <app-card>
      <app-card-header>
        Información de Cliente
      </app-card-header>

      <app-card-body>
        <p>Nombre: Juan Pérez</p>
        <p>Email: juan@example.com</p>
      </app-card-body>

      <app-card-footer>
        <button class="btn btn-sm btn-primary">Editar</button>
      </app-card-footer>
    </app-card>
  `
})
export class MiCardComponent {}
```

### Sin header/footer (solo body)

```typescript
<app-card>
  <app-card-body>
    <!-- El contenido que sea -->
  </app-card-body>
</app-card>
```

### Anidado (card dentro de card)

```typescript
<app-card>
  <app-card-header>Facturas</app-card-header>
  <app-card-body>
    <div *ngFor="let factura of facturas()">
      <app-card>
        <app-card-body>
          {{ factura.numero }} - {{ factura.monto | currency }}
        </app-card-body>
      </app-card>
    </div>
  </app-card-body>
</app-card>
```

---

## Diferencias clave con CoreUI

| Aspecto | CoreUI | Nativo |
|---------|--------|--------|
| **Tamaño** | ~150KB | ~2KB |
| **Dependencia** | Dependes de CoreUI | Solo Angular + CSS |
| **Customización** | Limitada a CoreUI | 100% control |
| **Curva aprendizaje** | CoreUI-specific | HTML + CSS puro |
| **Animaciones** | CoreUI-built-in | Tú controlas con Angular animations |
| **Accesibilidad** | CoreUI lo maneja | Tú lo defines |

---

## Próximos pasos (cuando quieras integrar)

1. Reemplazar imports en componentes que usan `@coreui/angular`
2. Adaptar los templates para usar `<app-modal>` en lugar de `<c-modal>`
3. Quitar `@coreui/angular` de los imports
4. Pruebas de que todo sigue funcionando

**Ahora**: Lee la estructura y entendé cómo funcionan. Preguntá qué no entiendas.
