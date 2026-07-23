import { Component, Inject, inject, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  RowComponent,
  TableDirective,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BancoService } from '../../core/services/banco.service';
import { TypedFormGroup } from '@shared/types/types-form';
import { BaseSearchComponent } from '@shared/base/search-base.component';
import { MODULES } from 'src/app/core/config/permissions/modules';
import { PageParamsModel } from '@shared/models/query/page-params.model';
import { PaginatorComponent } from '@shared/components/paginator/paginator.component';
import { ConfirmService } from '@shared/confirm-modal/core/services/confirm-modal.service';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { BancoNewEditModal } from '../../components/banco-new-edit-modal/banco-new-edit-modal';
import { Banco } from '../../core/models';
import { BancoFilterForm } from '../../core/types';
import { buildBancoFilterForm, bancoMapFilterParams, bancoFilterSort } from '../../helpers';

@Component({
  selector: 'app-banco',
  standalone: true,
  imports: [
    CommonModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    IconDirective,
    ButtonDirective,
    TableDirective,
    ReactiveFormsModule,
    BancoNewEditModal,
    PaginatorComponent,
  ],
  templateUrl: './banco.html',
  styleUrl: './banco.scss',
})
export class BancoComponent extends BaseSearchComponent implements OnInit {
  @ViewChild('bancoNewEditModal') bancoNewEditModal!: BancoNewEditModal;
  public form!: TypedFormGroup<BancoFilterForm>;
  public title = 'Bancos';
  public bancos: Banco[] = [];

  readonly #formBuilder = inject(FormBuilder);
  readonly #bancoService = inject(BancoService);
  readonly #confirmService = inject(ConfirmService);
  readonly #globalNotification = inject(GlobalNotification);

  constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
    super(MODULES.BANCO, viewContainerRef);
  }

  ngOnInit(): void {
    this.createForm();
    this.onSearch();
  }

  createForm(): void {
    this.form = this.#formBuilder.group(buildBancoFilterForm()) as TypedFormGroup<BancoFilterForm>;
  }

  onSearch(filter: Record<string, any> | null = null, page = 1): void {
    const sort = bancoFilterSort();
    const filterToUse = filter ?? bancoMapFilterParams(this.form.value);
    const pageSize = 10;
    const pageParams = new PageParamsModel(page, pageSize);
    this.updateFilter(filterToUse);
    this.updateSort(sort);
    this.updatePage(pageParams);
    const params = this.getPageParams();

    const subscription = this.#bancoService.search(params).subscribe({
      next: (response) => {
        if (response.isValid) {
          this.bancos = response.data.items || [];
          this.total = response.data.total;
        }
      },
      error: (response) => {
        this.#globalNotification.openToastAlert('Error al buscar', response.message, 'danger');
      },
    });
    this.subscriptions.push(subscription);
  }

  onPageChange(page: number): void {
    this.onSearch(this.filter, page);
  }

  onClean(): void {
    this.form.reset();
    this.onSearch();
  }

  openModal(id?: number): void {
    this.bancoNewEditModal?.openModal(id, () => this.onSearch());
  }

  onDelete(id: number): void {
    this.#confirmService
      .open({
        title: 'Eliminar',
        message: '¿Estás seguro de eliminar este banco?',
        color: 'danger',
        confirmText: 'Si, eliminar',
        cancelText: 'Cancelar',
      })
      .then((confirmed) => {
        if (!confirmed) return;

        const subscription = this.#bancoService.delete(id).subscribe({
          next: (response) => {
            this.#globalNotification.openAlert(response);
            if (response.isValid) {
              this.onSearch();
            }
          },
          error: (response) => {
            this.#globalNotification.openToastAlert('Error al eliminar', response.message, 'danger');
          },
        });
        this.subscriptions.push(subscription);
      });
  }
}
