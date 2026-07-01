import { Component, Inject, OnInit, ViewChild, ViewContainerRef, inject } from '@angular/core';
import {
  RowComponent,
  ColComponent,
  CardComponent,
  CardBodyComponent,
  ButtonDirective,
  TableDirective,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { BaseSearchComponent } from '../../shared/base/search-base.component';
import { MODULES } from '../../core/config/permissions/modules';
import { TypedFormGroup } from '../../shared/types/types-form';
import { FilterForm } from '../core/types/filter-form';
import { buildFilterForm, filterSort, mapParams } from '../helpers';
import { DocumentService } from '../core/services/document.service';
import { DocumentModel } from '../core/models/document.model';
import { PageParamsModel } from '../../shared/models/query/page-params.model';
import { PaginatorComponent } from '../../paginator/paginator.component';
import { DocumentNewEditModalComponent } from '../components/document-new-edit-modal.component';
import { GetDocumentModel } from '../core/models/get-document.model';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { ConfirmService } from '@shared/confirm-modal/core/services/confirm-modal.service';

@Component({
  selector: 'app-document',
  standalone: true,
  imports: [
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    ButtonDirective,
    TableDirective,
    IconDirective,
    ReactiveFormsModule,
    PaginatorComponent,
    DocumentNewEditModalComponent,
  ],
  templateUrl: './document.page.html',
  styles: ``,
})
export class DocumentPage extends BaseSearchComponent implements OnInit {
  @ViewChild('documentNewEditModal') documentNewEditModal!: DocumentNewEditModalComponent;
  public form!: TypedFormGroup<FilterForm>;
  public title = 'Documentos';
  public documents: GetDocumentModel[] = [];
  #formBuilder = inject(FormBuilder);
  #service = inject(DocumentService);
  #confirmService = inject(ConfirmService);
  #globalNotification = inject(GlobalNotification);
  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.COMPANY, viewContainerRef);
  }

  ngOnInit(): void {
    this.createForm();
    this.onSearch();
  }

  createForm() {
    this.form = this.#formBuilder.group(buildFilterForm());
  }

  onSearch(filter: any = null, page = 1) {
    const sort = filterSort(this.form.value);
    const filterToUse = filter || mapParams(this.form.value);
    const pageSize = 10;
    const pageParams = new PageParamsModel(page, pageSize);
    this.updateFilter(filterToUse);
    this.updateSort(sort);
    this.updatePage(pageParams);
    const params = this.getPageParams();
    const subscription = this.#service.search(params).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.total = response.data.total;
          this.documents = response.data.items as any;
        } else {
          console.error(response);
        }
      },
      error: (response) => {
        console.error(response?.messages ?? response);
      },
    });
    this.subscriptions.push(subscription);
  }

  onPageChange(page: number): void {
    this.onSearch(this.filter, page);
  }

  onClean() {
    this.form.reset();
  }

  openModal(id?: number) {
    if (this.documentNewEditModal) {
      this.documentNewEditModal.openModal(id, () => {
        this.onSearch();
      });
    }
  }

  onDelete(id: number) {
    this.#confirmService
      .open({
        title: 'Eliminar',
        message: '¿Estás seguro de eliminar este registro?',
        color: 'danger',
        confirmText: 'Si, eliminar',
        cancelText: 'Cancelar',
      })
      .then((confirmed) => {
        if (confirmed) {
          this.#service.delete(id).subscribe({
            next: (response) => {
              if (response.isValid) {
                this.#globalNotification.openAlert(response);
                this.onSearch();
              } else {
                this.#globalNotification.openAlert(response);
              }
            },
            error: (response) => {
              this.#globalNotification.openToastAlert('Error al eliminar', response, 'danger');
            },
          });
        }
      });
  }
}
