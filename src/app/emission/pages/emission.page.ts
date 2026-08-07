import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  RowComponent,
  ColComponent,
  CardComponent,
  CardBodyComponent,
  CardHeaderComponent,
  ButtonDirective,
  FormSelectDirective,
  FormLabelDirective,
  FormControlDirective,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { BaseSearchComponent } from '../../shared/base/search-base.component';
import { TypedFormGroup } from '../../shared/types/types-form';
import { FilterForm } from '../core/types/filter-form';
import { EmissionService } from '../core/services/emission.service';
import { GetEmissionModel } from '../core/models/get-emission.model';
import { PaginatorComponent } from '../../shared/components/paginator/paginator.component';
import { EmissionListComponent } from '../components/emission-list.component';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { buildFilterForm, mapFilterParams } from '../helpers';

@Component({
  selector: 'app-emission',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    ButtonDirective,
    FormControlDirective,
    IconDirective,
    PaginatorComponent,
    EmissionListComponent,
  ],
  templateUrl: './emission.page.html',
  styles: ``,
})
export class EmissionPage implements OnInit {
  public form!: TypedFormGroup<FilterForm>;
  public title = 'Emisión Electrónica';
  public emissions: GetEmissionModel[] = [];
  public loading = false;
  public totalRecords = 0;

  readonly #formBuilder = inject(FormBuilder);
  readonly #service = inject(EmissionService);
  readonly #notification = inject(GlobalNotification);

  readonly statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'emitida', label: 'Emitida' },
    { value: 'enviada', label: 'Enviada' },
    { value: 'error_envio', label: 'Error al enviar' },
  ];

  ngOnInit(): void {
    this.form = buildFilterForm(this.#formBuilder);
    this.search();
  }

  search(): void {
    this.loading = true;
    const params = mapFilterParams(this.form.value);

    this.#service.getEmissions(params).subscribe({
      next: (response) => {
        this.emissions = response.data;
        this.totalRecords = 0;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onPageChange(page: number): void {
    this.form.patchValue({ page });
    this.search();
  }

  reset(): void {
    this.form.reset({ page: 1, limit: 10 });
    this.search();
  }
}
