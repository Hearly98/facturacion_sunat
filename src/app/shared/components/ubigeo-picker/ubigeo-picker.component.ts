import { Component, computed, forwardRef, inject, input, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  ButtonCloseDirective,
  ButtonDirective,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { UbigeoService } from '@shared/services/ubigeo.service';

export interface UbigeoSeleccionado {
  codigo: string;
  departamento: string;
  provincia: string;
  distrito: string;
}

/**
 * Selector de ubigeo SUNAT: muestra "código - Departamento / Provincia / Distrito" y abre un
 * modal con tres combos en cascada. El código de 6 dígitos se calcula del distrito elegido,
 * así el usuario nunca tiene que saberlo de memoria. Funciona con formControlName.
 */
@Component({
  selector: 'app-ubigeo-picker',
  standalone: true,
  imports: [
    ButtonDirective,
    ButtonCloseDirective,
    IconDirective,
    ModalComponent,
    ModalHeaderComponent,
    ModalTitleDirective,
    ModalBodyComponent,
    ModalFooterComponent,
  ],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UbigeoPickerComponent), multi: true },
  ],
  template: `
    @if (mode() === 'inline') {
      <div class="row g-2">
        <div class="col-md-4">
          <select
            class="form-select"
            [id]="inputId()"
            [class.is-invalid]="invalid()"
            [disabled]="disabled()"
            aria-label="Departamento"
            (change)="onDepartamento($any($event.target).value)"
          >
            <option value="" [selected]="!departamento()">Departamento</option>
            @for (d of departamentos(); track d.codigo) {
              <option [value]="d.codigo" [selected]="d.codigo === departamento()">{{ d.nombre }}</option>
            }
          </select>
        </div>
        <div class="col-md-4">
          <select
            class="form-select"
            [class.is-invalid]="invalid()"
            [disabled]="disabled() || !departamento()"
            aria-label="Provincia"
            (change)="onProvincia($any($event.target).value)"
          >
            <option value="" [selected]="!provincia()">Provincia</option>
            @for (p of provincias(); track p.codigo) {
              <option [value]="p.codigo" [selected]="p.codigo === provincia()">{{ p.nombre }}</option>
            }
          </select>
        </div>
        <div class="col-md-4">
          <select
            class="form-select"
            [class.is-invalid]="invalid()"
            [disabled]="disabled() || !provincia()"
            aria-label="Distrito"
            (change)="onDistrito($any($event.target).value)"
          >
            <option value="" [selected]="!distrito()">Distrito</option>
            @for (d of distritos(); track d.codigo) {
              <option [value]="d.codigo" [selected]="d.codigo === distrito()">{{ d.nombre }}</option>
            }
          </select>
        </div>
        <div class="col-12 small text-body-secondary">
          Código de ubigeo: <strong class="text-body">{{ value() ?? '------' }}</strong>
        </div>
      </div>
    } @else {
    <div class="input-group">
      <input
        class="form-control"
        [id]="inputId()"
        [class.is-invalid]="invalid()"
        [value]="display()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        readonly
        (click)="open()"
        style="cursor: pointer"
      />
      <button
        type="button"
        cButton
        color="secondary"
        variant="outline"
        [disabled]="disabled()"
        (click)="open()"
        title="Elegir departamento, provincia y distrito"
      >
        <svg cIcon name="cilLocationPin"></svg>
      </button>
    </div>

    <c-modal class="modal-background" alignment="center" [visible]="visible()" (visibleChange)="visible.set($event)">
      <c-modal-header>
        <h5 cModalTitle>{{ title() }}</h5>
        <button cButtonClose (click)="close()"></button>
      </c-modal-header>
      <c-modal-body>
        <label class="form-label" [for]="inputId() + '-dep'">Departamento</label>
        <select
          class="form-select mb-3"
          [id]="inputId() + '-dep'"
          [value]="departamento() ?? ''"
          (change)="onDepartamento($any($event.target).value)"
        >
          <option value="" disabled>Seleccione el departamento</option>
          @for (d of departamentos(); track d.codigo) {
            <option [value]="d.codigo" [selected]="d.codigo === departamento()">{{ d.nombre }}</option>
          }
        </select>

        <label class="form-label" [for]="inputId() + '-prov'">Provincia</label>
        <select
          class="form-select mb-3"
          [id]="inputId() + '-prov'"
          [disabled]="!departamento()"
          [value]="provincia() ?? ''"
          (change)="onProvincia($any($event.target).value)"
        >
          <option value="" disabled>Seleccione la provincia</option>
          @for (p of provincias(); track p.codigo) {
            <option [value]="p.codigo" [selected]="p.codigo === provincia()">{{ p.nombre }}</option>
          }
        </select>

        <label class="form-label" [for]="inputId() + '-dist'">Distrito</label>
        <select
          class="form-select mb-3"
          [id]="inputId() + '-dist'"
          [disabled]="!provincia()"
          [value]="distrito() ?? ''"
          (change)="onDistrito($any($event.target).value)"
        >
          <option value="" disabled>Seleccione el distrito</option>
          @for (d of distritos(); track d.codigo) {
            <option [value]="d.codigo" [selected]="d.codigo === distrito()">{{ d.nombre }}</option>
          }
        </select>

        <p class="mb-0 text-body-secondary">
          Código de ubigeo:
          <strong class="text-body">{{ distrito() ?? '------' }}</strong>
        </p>
      </c-modal-body>
      <c-modal-footer>
        <button type="button" cButton color="secondary" (click)="close()">Cancelar</button>
        <button type="button" cButton color="primary" [disabled]="!distrito()" (click)="confirm()">
          Usar este ubigeo
        </button>
      </c-modal-footer>
    </c-modal>
    }
  `,
})
export class UbigeoPickerComponent implements ControlValueAccessor {
  readonly inputId = input<string>('ubigeo');
  readonly title = input<string>('Seleccionar ubigeo');
  readonly placeholder = input<string>('Elegir departamento / provincia / distrito');
  readonly invalid = input<boolean>(false);
  /** 'modal' (por defecto) o 'inline': los tres combos en el propio formulario, para usarlo dentro de otro modal. */
  readonly mode = input<'modal' | 'inline'>('modal');
  readonly selected = output<UbigeoSeleccionado>();

  readonly #ubigeoService = inject(UbigeoService);
  readonly departamentos = toSignal(this.#ubigeoService.tree(), { initialValue: [] });
  readonly #flat = toSignal(this.#ubigeoService.list(), { initialValue: [] });

  readonly value = signal<string | null>(null);
  readonly disabled = signal(false);
  readonly visible = signal(false);

  readonly departamento = signal<string | null>(null);
  readonly provincia = signal<string | null>(null);
  readonly distrito = signal<string | null>(null);

  readonly provincias = computed(
    () => this.departamentos().find((d) => d.codigo === this.departamento())?.provincias ?? [],
  );
  readonly distritos = computed(
    () => this.provincias().find((p) => p.codigo === this.provincia())?.distritos ?? [],
  );

  readonly display = computed(() => {
    const code = this.value();
    if (!code) return '';
    const label = this.#flat().find((u) => u.code === code)?.label;
    return label ? `${code} - ${label}` : code;
  });

  #onChange: (value: string | null) => void = () => {};
  #onTouched: () => void = () => {};

  open(): void {
    if (this.disabled()) return;
    const code = this.value();
    this.departamento.set(code ? code.slice(0, 2) : null);
    this.provincia.set(code ? code.slice(0, 4) : null);
    this.distrito.set(code ?? null);
    this.visible.set(true);
  }

  close(): void {
    this.visible.set(false);
    this.#onTouched();
  }

  onDepartamento(codigo: string): void {
    this.departamento.set(codigo || null);
    this.provincia.set(null);
    this.distrito.set(null);
  }

  onProvincia(codigo: string): void {
    this.provincia.set(codigo || null);
    this.distrito.set(null);
  }

  onDistrito(codigo: string): void {
    this.distrito.set(codigo || null);
    // En línea no hay botón "Usar este ubigeo": elegir el distrito ya es la confirmación.
    if (this.mode() === 'inline' && codigo) {
      this.confirm();
    }
  }

  confirm(): void {
    const codigo = this.distrito();
    if (!codigo) return;

    const dep = this.departamentos().find((d) => d.codigo === this.departamento());
    const prov = this.provincias().find((p) => p.codigo === this.provincia());
    const dist = this.distritos().find((d) => d.codigo === codigo);

    this.value.set(codigo);
    this.#onChange(codigo);
    this.#onTouched();
    this.selected.emit({
      codigo,
      departamento: dep?.nombre ?? '',
      provincia: prov?.nombre ?? '',
      distrito: dist?.nombre ?? '',
    });
    this.visible.set(false);
  }

  writeValue(value: string | null): void {
    const code = value || null;
    this.value.set(code);
    if (this.mode() === 'inline') {
      this.departamento.set(code ? code.slice(0, 2) : null);
      this.provincia.set(code ? code.slice(0, 4) : null);
      this.distrito.set(code);
    }
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.#onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.#onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
