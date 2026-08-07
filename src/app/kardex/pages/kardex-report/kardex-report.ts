import { Component, Inject, inject, OnInit, ViewContainerRef } from '@angular/core';
import {
    ButtonDirective,
    CardBodyComponent,
    CardComponent,
    ColComponent,
    RowComponent,
    TableDirective,
    FormSelectDirective,
    FormControlDirective,
    FormLabelDirective,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BaseSearchComponent } from '../../../shared/base/search-base.component';
import { MODULES } from '../../../core/config/permissions/modules';
import { PageParamsModel } from '../../../shared/models/query/page-params.model';
import { KardexService } from '../../core/services/kardex.service';
import { GetKardexModel } from '../../core/models/get-kardex.model';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { CommonModule } from '@angular/common';
import { buildKardexFilterForm } from '../../helpers/build-kardex-filter-form';
import { ProductService } from '../../../products/core/services/product.service';
import { AlmacenService } from '../../../almacen/core/services/almacen.service';
import { UserService } from '../../../user/core/services/user.service';
import { TypedFormGroup } from '../../../shared/types/types-form';
import { KardexFilterForm } from '../../core/types/kardex-filter.form';
import { Product } from '../../../products/core/models';
import { GetAlmacenModel } from '../../../almacen/core/models';

@Component({
    selector: 'app-kardex-report',
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
        PaginatorComponent,
        FormSelectDirective,
        FormLabelDirective,
        FormControlDirective,
    ],
    templateUrl: './kardex-report.html',
})
export class KardexReportComponent extends BaseSearchComponent implements OnInit {
    public kardexItems: GetKardexModel[] = [];
    public products: Product[] = [];
    public warehouses: GetAlmacenModel[] = [];
    public users: any[] = [];
    public title = 'Kardex de Inventario';

    public movementTypes = [
        { label: 'Ingreso', value: 'INGRESO' },
        { label: 'Salida', value: 'SALIDA' },
        { label: 'Transferencia', value: 'TRANSFERENCIA' },
        { label: 'Ajuste', value: 'AJUSTE' },
    ];

    public pageSizeOptions = [10, 50, 100, 200];

    #kardexService = inject(KardexService);
    #productService = inject(ProductService);
    #almacenService = inject(AlmacenService);
    #userService = inject(UserService);
    #formBuilder = inject(FormBuilder);

    public filterForm!: TypedFormGroup<KardexFilterForm>;

    constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
        super(MODULES.KARDEX, viewContainerRef);
    }

    ngOnInit(): void {
        this.createForm();
        this.loadCombos();
    }

    createForm() {
        this.filterForm = this.#formBuilder.group(buildKardexFilterForm()) as TypedFormGroup<KardexFilterForm>;
    }

    loadCombos() {
        this.#productService.getAll().subscribe((res: any) => {
            if (res.isValid) this.products = res.data;
        });
        this.#almacenService.getAll().subscribe((res: any) => {
            if (res.isValid) this.warehouses = res.data;
        });
        this.#userService.getAll().subscribe((res: any) => {
            if (res.isValid) this.users = res.data;
        });
    }

    onSearch(filter = null, page = 1) {
        if (this.filterForm.invalid) {
            this.filterForm.markAllAsTouched();
            return;
        }

        const formValue = this.filterForm.value;
        const pageSize = formValue.pageSize || 50;
        const pageParams = new PageParamsModel(page, pageSize);

        const filterToUse = { ...formValue };
        delete (filterToUse as any).order;
        delete (filterToUse as any).pageSize;

        const sort = [
            {
                property: "kar_fec",
                direction: formValue.order || 'desc',
            },
        ];

        this.updateFilter(filterToUse);
        this.updateSort(sort);
        this.updatePage(pageParams);
        const params = this.getPageParams();

        const subscription = this.#kardexService.search(params).subscribe({
            next: (response) => {
                if (response.isValid) {
                    this.total = response.data.total;
                    this.kardexItems = response.data.items;
                }
            },
            error: (err) => console.error(err)
        });
        this.subscriptions.push(subscription);
    }

    onPageChange(pageValue: number): void {
        this.onSearch(null, pageValue);
    }

    onClean() {
        this.filterForm.reset({
            order: 'desc',
            pageSize: 50,
            prod_id: null
        });
        this.kardexItems = [];
    }
}
