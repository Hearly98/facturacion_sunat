import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  RowComponent,
  TableDirective,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { AlmacenService } from '../../../almacen/core/services/almacen.service';
import { GetAlmacenModel } from '../../../almacen/core/models';
import { ProductImportService } from '../../core/services/product-import.service';
import {
  ProductImportConfirmResult,
  ProductImportPreview,
} from '../../core/models/product-import.model';

@Component({
  selector: 'app-product-import',
  imports: [
    RouterLink,
    FormsModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    IconDirective,
    ButtonDirective,
    TableDirective,
  ],
  templateUrl: './product-import.html',
  styleUrl: './product-import.scss',
})
export class ProductImport implements OnInit {
  readonly #productImportService = inject(ProductImportService);
  readonly #almacenService = inject(AlmacenService);
  readonly #globalNotification = inject(GlobalNotification);

  public almacenes: GetAlmacenModel[] = [];
  public almacenDestinoId: number | null = null;

  public archivoSeleccionado: File | null = null;
  public cargandoPreview = false;
  public cargandoConfirmacion = false;

  public preview: ProductImportPreview | null = null;
  public resultado: ProductImportConfirmResult | null = null;

  ngOnInit(): void {
    this.#almacenService.getAll().subscribe({
      next: (response) => (this.almacenes = response.data),
      error: () =>
        this.#globalNotification.openToastAlert(
          'Error',
          'No se pudieron cargar los almacenes',
          'danger',
        ),
    });
  }

  descargarPlantilla(): void {
    this.#productImportService.downloadTemplate();
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.archivoSeleccionado = input.files?.[0] ?? null;
    this.preview = null;
    this.resultado = null;
  }

  verVistaPrevia(): void {
    if (!this.archivoSeleccionado) {
      return;
    }

    this.cargandoPreview = true;
    this.resultado = null;

    this.#productImportService.preview(this.archivoSeleccionado).subscribe({
      next: (response) => {
        this.preview = response.data;
        this.cargandoPreview = false;
      },
      error: (error) => {
        this.cargandoPreview = false;
        this.#globalNotification.openToastAlert(
          'Error',
          error?.error?.messages?.[0]?.message ?? 'No se pudo leer el archivo',
          'danger',
        );
      },
    });
  }

  confirmarImportacion(): void {
    if (!this.archivoSeleccionado || !this.almacenDestinoId) {
      return;
    }

    this.cargandoConfirmacion = true;

    this.#productImportService
      .confirmar(this.archivoSeleccionado, this.almacenDestinoId)
      .subscribe({
        next: (response) => {
          this.resultado = response.data;
          this.cargandoConfirmacion = false;
          this.#globalNotification.openToastAlert(
            'Importación procesada',
            `${response.data.total_creados} productos creados, ${response.data.total_con_error} con error`,
            response.data.total_con_error > 0 ? 'warning' : 'success',
          );
        },
        error: (error) => {
          this.cargandoConfirmacion = false;
          this.#globalNotification.openToastAlert(
            'Error',
            error?.error?.messages?.[0]?.message ?? 'No se pudo procesar la importación',
            'danger',
          );
        },
      });
  }
}
