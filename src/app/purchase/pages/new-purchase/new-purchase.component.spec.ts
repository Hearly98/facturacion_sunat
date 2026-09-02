import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';

import { NewPurchaseComponent } from './new-purchase.component';
import { CurrencyService } from 'src/app/currency/core/services/currency.service';
import { DocumentService } from 'src/app/document/core/services/document.service';
import { SupplierService } from 'src/app/supplier/core/services/supplier.service';
import { ProductService } from 'src/app/products/core/services/product.service';
import { DocumentTypeService } from 'src/app/document-type/core/services/document-type.service';
import { PaymentMethodService } from 'src/app/payment-method/core/services/payment-method.service';
import { SucursalService } from 'src/app/sucursal/core/services/sucursal.service';
import { AlmacenService } from 'src/app/almacen/core/services/almacen.service';
import { ProductoAlmacenService } from 'src/app/almacen/core/services/producto-almacen.service';
import { PurchaseService } from '../../core/services/purchase.service';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { buildPurchaseForm } from '../../helpers/build-purchase-form';
import { Supplier } from 'src/app/supplier/core/models';

// REGRESSION: patchSupplier used to read item.prov_documento/tip_id/prov_direcc/prov_correo/
// prov_telf, fields that don't exist on the real Supplier model (item.document/documentTypeId/
// address/email/phone) -- so selecting a proveedor in a new purchase always left "Tipo
// Documento", "Documento", "Dirección" y "Teléfono" blank.

describe('NewPurchaseComponent', () => {
  let component: NewPurchaseComponent;
  let fixture: ComponentFixture<NewPurchaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewPurchaseComponent],
      providers: [
        { provide: CurrencyService, useValue: {} },
        { provide: DocumentService, useValue: {} },
        { provide: SupplierService, useValue: {} },
        { provide: ProductService, useValue: {} },
        { provide: DocumentTypeService, useValue: {} },
        { provide: PaymentMethodService, useValue: {} },
        { provide: SucursalService, useValue: {} },
        { provide: AlmacenService, useValue: {} },
        { provide: ProductoAlmacenService, useValue: {} },
        { provide: PurchaseService, useValue: {} },
        { provide: GlobalNotification, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NewPurchaseComponent);
    component = fixture.componentInstance;
    component.form = new FormBuilder().group(buildPurchaseForm());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('patchSupplier', () => {
    it('fills document, document type, address, email and phone from a Supplier', () => {
      const supplier: Supplier = {
        id: 3,
        companyId: 1,
        documentTypeId: 6,
        name: 'Distribuidora SAC',
        document: '20456789123',
        phone: '944555666',
        address: 'Av. Industrial 500',
        email: 'contacto@distribuidora.com',
        bank: null,
        account: null,
        active: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };

      component.patchSupplier(supplier);

      expect(component.form.get('prov_documento')?.value).toBe('20456789123');
      expect(component.form.get('tip_id')?.value).toBe(6);
      expect(component.form.get('prov_direcc')?.value).toBe('Av. Industrial 500');
      expect(component.form.get('prov_correo')?.value).toBe('contacto@distribuidora.com');
      expect(component.form.get('prov_telf')?.value).toBe('944555666');
    });
  });

  describe('onSelectItem', () => {
    it('patches the supplier fields when selecting prov_id', () => {
      const supplier: Supplier = {
        id: 3,
        companyId: 1,
        documentTypeId: 1,
        name: 'Juan Vendedor',
        document: '12345678',
        phone: '911222333',
        address: 'Jr. Comercio 10',
        email: 'juan@example.com',
        bank: null,
        account: null,
        active: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };

      component.onSelectItem('prov_id', supplier);

      expect(component.form.get('prov_id')?.value).toBe(3);
      expect(component.form.get('prov_documento')?.value).toBe('12345678');
      expect(component.form.get('tip_id')?.value).toBe(1);
      expect(component.form.get('prov_direcc')?.value).toBe('Jr. Comercio 10');
      expect(component.form.get('prov_correo')?.value).toBe('juan@example.com');
      expect(component.form.get('prov_telf')?.value).toBe('911222333');
    });
  });
});
