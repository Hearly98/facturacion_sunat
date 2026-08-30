import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { SalesMainPage } from './sales-main.page';
import { SaleService } from '../../core/services/sale.service';
import { CurrencyService } from 'src/app/currency/core/services/currency.service';
import { DocumentService } from 'src/app/document/core/services/document.service';
import { CustomerService } from 'src/app/customer/core/services/customer.service';
import { SucursalService } from 'src/app/sucursal/core/services/sucursal.service';
import { ProductService } from 'src/app/products/core/services/product.service';
import { PaymentMethodService } from 'src/app/payment-method/core/services/payment-method.service';
import { DocumentTypeService } from 'src/app/document-type/core/services/document-type.service';
import { OrganizationService } from 'src/app/organization/core/services/organization.service';
import { AlmacenService } from 'src/app/almacen/core/services/almacen.service';
import { GlobalNotification } from '@shared/alerts/global-notification/global-notification';
import { ConfirmService } from '@shared/confirm-modal/core/services/confirm-modal.service';
import { buildSaleForm } from '../../helpers/build-sale-form';
import { GetCustomer } from 'src/app/customer/core/models';
import { QuotationModel, QuotationCustomerModel } from 'src/app/quotation/core/models/quotation.model';
import { GetShippingGuideModel } from 'src/app/shipping-guide/core/models/get-shipping-guide.model';
import { CustomerDto } from 'src/app/customer/core/dto';
import { QuotationService } from 'src/app/quotation/core/services/quotation.service';
import { ShippingGuideService } from 'src/app/shipping-guide/core/services/shipping-guide.service';

// REGRESSION: patchCustomer/onSelectCotizacion/onSelectGuia used to read field names that
// don't exist on the real DTOs (item.documento/tipoDocumentoId/direccion/telefono instead of
// item.document/documentTypeId/address/phone), so "Tipo Documento", "Documento", "Dirección" y
// "Teléfono" quedaban en blanco al elegir un cliente, vincular una cotización o una guía.

describe('SalesMainPage', () => {
  let component: SalesMainPage;
  let fixture: ComponentFixture<SalesMainPage>;

  const buildForm = () => new FormBuilder().group(buildSaleForm());

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesMainPage],
      providers: [
        provideNoopAnimations(),
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } },
        { provide: SaleService, useValue: {} },
        { provide: CurrencyService, useValue: {} },
        { provide: DocumentService, useValue: {} },
        { provide: CustomerService, useValue: {} },
        { provide: SucursalService, useValue: {} },
        { provide: ProductService, useValue: {} },
        { provide: PaymentMethodService, useValue: {} },
        { provide: DocumentTypeService, useValue: {} },
        { provide: OrganizationService, useValue: {} },
        { provide: AlmacenService, useValue: {} },
        { provide: GlobalNotification, useValue: {} },
        { provide: ConfirmService, useValue: {} },
        { provide: QuotationService, useValue: {} },
        { provide: ShippingGuideService, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SalesMainPage);
    component = fixture.componentInstance;
    component.form = buildForm();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('patchCustomer', () => {
    it('fills document, document type, address, email and phone from a GetCustomer', () => {
      const customer: GetCustomer = {
        id: 1,
        companyId: 1,
        firstName: 'Juan',
        lastName: 'Perez',
        businessName: 'Juan Perez',
        document: '12345678',
        phone: '999888777',
        address: 'Av. Siempre Viva 123',
        email: 'juan@example.com',
        ubigeoCode: '150101',
        documentTypeId: 1,
      };

      component.patchCustomer(customer);

      expect(component.form.value.cli_documento).toBe('12345678');
      expect(component.form.value.tip_id).toBe(1);
      expect(component.form.value.cli_direcc).toBe('Av. Siempre Viva 123');
      expect(component.form.value.cli_correo).toBe('juan@example.com');
      expect(component.form.value.cli_telf).toBe('999888777');
    });
  });

  describe('onSelectCotizacion', () => {
    const customer: QuotationCustomerModel = {
      id: 5,
      name: 'Empresa SAC',
      document: '20123456789',
      documentTypeId: 6,
      address: 'Jr. Comercio 456',
      phone: '987654321',
      email: 'ventas@empresa.com',
    };

    const cotizacion: QuotationModel = {
      id: 10,
      companyId: 1,
      branchId: 1,
      customerId: 5,
      currencyId: 1,
      userId: 1,
      number: '001',
      fullNumber: 'COT-001',
      issueDate: '2026-08-01',
      validUntilDate: null,
      showValidUntilDate: false,
      contactName: null,
      contactPhone: null,
      contactEmail: null,
      contactArea: null,
      showCurrency: true,
      subtotal: 100,
      tax: 18,
      taxRequired: true,
      total: 118,
      showTotal: true,
      discount: 0,
      notes: null,
      showNotes: false,
      paymentTerms: null,
      showPaymentTerms: false,
      paymentMethodId: null,
      showPaymentMethod: false,
      paymentForm: null,
      showPaymentForm: false,
      deliveryTime: null,
      showDeliveryTime: false,
      deliveryPlace: null,
      showDeliveryPlace: false,
      warranty: null,
      showWarranty: false,
      considerations: null,
      showConsiderations: false,
      complementaryService: null,
      showComplementaryService: false,
      stateId: 1,
      stateCode: 'PENDIENTE',
      stateName: 'Pendiente',
      customer,
      currencyName: 'Soles',
      currencySymbol: 'S/',
      branchName: 'Principal',
      details: [],
    };

    it('links the quotation id and fills the customer fields with the real model field names', () => {
      component.onSelectCotizacion(cotizacion);

      expect(component.form.value.cot_id).toBe(10);
      expect(component.form.value.cli_id).toBe(5);
      expect(component.form.value.cli_documento).toBe('20123456789');
      expect(component.form.value.tip_id).toBe(6);
      expect(component.form.value.cli_direcc).toBe('Jr. Comercio 456');
      expect(component.form.value.cli_correo).toBe('ventas@empresa.com');
      expect(component.form.value.cli_telf).toBe('987654321');
      expect(component.linkedCotizacion()).toEqual(cotizacion);
    });
  });

  describe('onSelectGuia', () => {
    const clienteDto: CustomerDto = {
      id: 8,
      nombre: 'Maria',
      apellido: 'Lopez',
      razonSocial: 'Maria Lopez',
      documento: '87654321',
      telefono: '911222333',
      direccion: 'Calle Los Pinos 789',
      email: 'maria@example.com',
      codigoUbigeo: '150102',
      tipoDocumentoId: 1,
      empresaId: 1,
    };

    const guia = Object.assign(new GetShippingGuideModel(), {
      guia_id: 20,
      cliente: clienteDto,
    });

    it('maps the raw ClienteResource DTO through CustomerMapper before patching the form', () => {
      component.onSelectGuia(guia);

      expect(component.form.value.guia_id).toBe(20);
      expect(component.form.value.cli_id).toBe(8);
      expect(component.form.value.cli_documento).toBe('87654321');
      expect(component.form.value.tip_id).toBe(1);
      expect(component.form.value.cli_direcc).toBe('Calle Los Pinos 789');
      expect(component.form.value.cli_correo).toBe('maria@example.com');
      expect(component.form.value.cli_telf).toBe('911222333');
    });

    it('getClientInitialValue reads the mapped business name, not the non-existent cli_nom', () => {
      component.linkedGuia.set(guia);

      expect(component.getClientInitialValue('cli_id')).toBe('Maria Lopez');
    });
  });
});
