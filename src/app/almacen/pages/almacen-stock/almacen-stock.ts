import { Component, inject, OnInit, ViewContainerRef, Inject } from '@angular/core';
import {
    ButtonDirective,
    CardBodyComponent,
    CardComponent,
    ColComponent,
    RowComponent,
    TableDirective,
    FormControlDirective,
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BaseComponent } from '../../../shared/base/base.component';
import { MODULES } from '../../../core/config/permissions/modules';
import { AlmacenService } from '../../core/services/almacen.service';
import { ProductoAlmacenService } from '../../core/services/producto-almacen.service';
import { GetAlmacenModel } from '../../core/models';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { ProductoAlmacenModel } from '../../core/models/producto-almacen.model';

@Component({
    selector: 'app-almacen-stock',
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
        FormControlDirective,
        RouterModule
    ],
    templateUrl: './almacen-stock.html',
})
export class AlmacenStockComponent extends BaseComponent implements OnInit {
    public productos: ProductoAlmacenModel[] = [];
    public filteredProductos: ProductoAlmacenModel[] = [];
    public almacen?: GetAlmacenModel;
    public title = 'Stock del Almacén';
    public searchTerm = '';

    #productoAlmacenService = inject(ProductoAlmacenService);
    #almacenService = inject(AlmacenService);
    #globalNotification = inject(GlobalNotification);
    #route = inject(ActivatedRoute);
    #formBuilder = inject(FormBuilder);

    public filterForm = this.#formBuilder.group({
        nombre: ['']
    });

    constructor(@Inject(ViewContainerRef) viewContainerRef: ViewContainerRef) {
        super(MODULES.ALMACEN, viewContainerRef);
    }

    ngOnInit(): void {
        const almId = Number(this.#route.snapshot.paramMap.get('id'));
        if (almId) {
            this.loadAlmacen(almId);
            this.loadProductos(almId);
        }
    }

    loadAlmacen(id: number) {
        this.#almacenService.getById(id).subscribe({
            next: (response) => {
                if (response.isValid) {
                    this.almacen = response.data;
                    this.title = `Productos - ${this.almacen.nombre}`;
                }
            }
        });
    }

    loadProductos(almacenId: number) {
        const subscription = this.#productoAlmacenService.getByAlmacen(almacenId).subscribe({
            next: (response) => {
                if (response.isValid) {
                    this.productos = response.data;
                    this.filteredProductos = response.data;
                }
            },
            error: (err) => {
                this.#globalNotification.openToastAlert('Error', 'No se pudo cargar los productos', 'danger');
            }
        });
        this.subscriptions.push(subscription);
    }

    onSearch() {
        const term = this.filterForm.value.nombre?.toLowerCase() || '';
        if (!term) {
            this.filteredProductos = this.productos;
        } else {
            this.filteredProductos = this.productos.filter(p =>
                p.producto?.name?.toLowerCase().includes(term) ||
                p.producto?.internalCode?.toLowerCase().includes(term)
            );
        }
    }

    clearSearch() {
        this.filterForm.reset();
        this.filteredProductos = this.productos;
    }
}
