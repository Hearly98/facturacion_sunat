import { Component, inject, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  ModalComponent,
  ModalBodyComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
  ModalFooterComponent,
  ButtonDirective,
  ButtonCloseDirective,
  SpinnerComponent,
  BadgeModule,
  RowComponent,
  ColComponent,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { FormsModule } from '@angular/forms';
import { QuotationService } from 'src/app/quotation/core/services/quotation.service';
import { ShippingGuideService } from 'src/app/shipping-guide/core/services/shipping-guide.service';
import { QuotationModel } from 'src/app/quotation/core/models/quotation.model';
import { ShippingGuideModel } from 'src/app/shipping-guide/core/models/shipping-guide.model';
import { Observable } from 'rxjs';
import { ResponseDto } from '@shared/models/api/response.dto';
import { QueryResultsModel } from '@shared/models/query/query-results.model';
import { GetShippingGuideModel } from 'src/app/shipping-guide/core/models/get-shipping-guide.model';

export type SearchDocumentType = 'cotizacion' | 'guia';

@Component({
  selector: 'app-search-document-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent,
    ModalBodyComponent,
    ModalHeaderComponent,
    ModalTitleDirective,
    ModalFooterComponent,
    ButtonDirective,
    ButtonCloseDirective,
    SpinnerComponent,
    BadgeModule,
    IconDirective,
    RowComponent,
    ColComponent,
    DatePipe,
  ],
  templateUrl: './search-document-modal.component.html',
  styles: `
    :host {
      display: contents;
    }

    .document-item {
      transition:
        background-color 0.15s ease,
        border-color 0.15s ease;
      cursor: pointer;
    }
    .document-item:hover {
      background-color: var(--cui-primary-bg-subtle, #cfe2ff);
      border-color: var(--cui-primary, #0d6efd) !important;
    }
    .cursor-pointer {
      cursor: pointer;
    }
  `,
})
export class SearchDocumentModalComponent {
  @Input() set isVisible(value: boolean) {
    this._isVisible.set(value);
    if (value) {
      this.load();
    }
  }
  get isVisible(): boolean {
    return this._isVisible();
  }
  private _isVisible = signal(false);

  @Input() set documentType(value: SearchDocumentType) {
    this.type.set(value);
  }
  get documentType(): SearchDocumentType {
    return this.type();
  }

  @Output() itemSelected = new EventEmitter<QuotationModel | ShippingGuideModel>();
  @Output() modalClosed = new EventEmitter<void>();

  type = signal<SearchDocumentType>('cotizacion');
  loading = signal(false);
  searchTerm = '';

  private allItems = signal<(QuotationModel | ShippingGuideModel)[]>([]);
  filteredItems = signal<(QuotationModel | ShippingGuideModel)[]>([]);

  readonly #quotationService = inject(QuotationService);
  readonly #guiaService = inject(ShippingGuideService);

  get visible(): boolean {
    return this._isVisible();
  }

  private load() {
    this.loading.set(true);
    const params = {
      filter: this.type() === 'cotizacion' ? { estados: ['01'] } : [],
      page: { page: 1, pageSize: 100 },
      sort: [{ property: 'fecha_emision', direction: 'desc' }],
    };

    const request: Observable<ResponseDto<QueryResultsModel<any>>> =
      this.type() === 'cotizacion'
        ? this.#quotationService.search(params)
        : this.#guiaService.search(params);

    request.subscribe({
      next: (response: any) => {
        this.loading.set(false);
        if (response.isValid) {
          this.allItems.set(response.data.items);
          this.filteredItems.set(response.data.items);
        }
      },
      error: () => this.loading.set(false),
    });
  }

  onSearchInput() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredItems.set(this.allItems());
      return;
    }

    if (this.type() === 'cotizacion') {
      this.filteredItems.set(
        (this.allItems() as QuotationModel[]).filter(
          (c) =>
            c.numero_completo?.toLowerCase().includes(term) ||
            c.cliente?.cli_nom?.toLowerCase().includes(term),
        ),
      );
    } else {
      this.filteredItems.set(
        (this.allItems() as GetShippingGuideModel[]).filter(
          (g) =>
            g.numero_completo?.toLowerCase().includes(term) ||
            g.cliente?.cli_nom?.toLowerCase().includes(term),
        ),
      );
    }
  }

  clearSearch() {
    this.searchTerm = '';
    this.filteredItems.set(this.allItems());
  }

  selectCotizacion(cotId: number) {
    this.#quotationService.getById(cotId).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.itemSelected.emit(response.data);
        }
      },
    });
    this.close();
  }

  selectGuia(item: ShippingGuideModel) {
    this.itemSelected.emit(item);
    this.close();
  }

  close() {
    this._isVisible.set(false);
    this.modalClosed.emit();
  }

  onVisibleChange(isVisible: boolean) {
    if (!isVisible) {
      this._isVisible.set(false);
      this.modalClosed.emit();
    }
  }

  asCotizaciones(): QuotationModel[] {
    return this.filteredItems() as QuotationModel[];
  }

  asGuias(): GetShippingGuideModel[] {
    return this.filteredItems() as GetShippingGuideModel[];
  }
}
