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
import { SunatService } from 'src/app/sunat/core/services/sunat.service';
import { SaleListItemModel } from '../../core/models/sale-list-item.model';
import { of } from 'rxjs';
import { UserService } from 'src/app/user/core/services/user.service';
import { AuthService } from 'src/app/core/auth/services/auth.service';

// REGRESSION: patchCustomer/onSelectCotizacion/onSelectGuia used to read field names that
// don't exist on the real DTOs (item.documento/tipoDocumentoId/direccion/telefono instead of
// item.document/documentTypeId/address/phone), so "Tipo Documento", "Documento", "Dirección" y
// "Teléfono" quedaban en blanco al elegir un cliente, vincular una cotización o una guía.

describe('SalesMainPage', () => {
  let component: SalesMainPage;
  let fixture: ComponentFixture<SalesMainPage>;
  let sunatService: jasmine.SpyObj<SunatService>;
  let notification: jasmine.SpyObj<GlobalNotification>;
  let saleService: { search: jasmine.Spy };

  const buildForm = () => new FormBuilder().group(buildSaleForm());

  beforeEach(async () => {
    sunatService = jasmine.createSpyObj<SunatService>('SunatService', ['getCreditNoteBalance']);
    notification = jasmine.createSpyObj<GlobalNotification>('GlobalNotification', ['openToastAlert', 'openAlert']);
    saleService = { search: jasmine.createSpy('search').and.returnValue(of({ isValid: false })) };

    await TestBed.configureTestingModule({
      imports: [SalesMainPage],
      providers: [
        provideNoopAnimations(),
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } },
        { provide: SaleService, useValue: saleService },
        { provide: CurrencyService, useValue: {} },
        { provide: DocumentService, useValue: {} },
        { provide: CustomerService, useValue: {} },
        { provide: SucursalService, useValue: {} },
        { provide: ProductService, useValue: {} },
        { provide: PaymentMethodService, useValue: {} },
        { provide: DocumentTypeService, useValue: {} },
        { provide: OrganizationService, useValue: {} },
        { provide: AlmacenService, useValue: {} },
        { provide: GlobalNotification, useValue: notification },
        { provide: ConfirmService, useValue: {} },
        { provide: QuotationService, useValue: {} },
        { provide: ShippingGuideService, useValue: {} },
        { provide: SunatService, useValue: sunatService },
        { provide: UserService, useValue: { getAll: () => of({ data: [] }) } },
        { provide: AuthService, useValue: { user: () => ({ id: 1 }) } },
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

    it('convierte el precio cotizado (sin IGV) al precio de venta con IGV', () => {
      component.onSelectCotizacion({
        ...cotizacion,
        details: [
          { id: 1, quotationId: 10, productId: 3, productName: 'Arroz', productCode: 'ARR', productUnit: 'KG',
            productUnitId: 2, productWeight: null, productTaxAffectation: '10', unitPrice: 100, quantity: 2,
            discount: 0, total: 200, description: null },
          { id: 2, quotationId: 10, productId: 4, productName: 'Libro', productCode: 'LIB', productUnit: 'UND',
            productUnitId: 1, productWeight: null, productTaxAffectation: '20', unitPrice: 50, quantity: 1,
            discount: 0, total: 50, description: null },
        ],
      });

      const precios = component.detailsArray.getRawValue().map((l: any) => l.precio_unitario);
      expect(precios).toEqual([118, 50]);
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

    // Forma real de GET /guias-remision/{id}: modelo crudo con `id`, `cotizacion_id` y líneas
    // con producto_id/unidad_id (antes el spec usaba guia_id/prod_id, que el backend no envía).
    const guia = Object.assign(new GetShippingGuideModel(), {
      id: 20,
      cotizacion_id: 5,
      nro_cotizacion: 'COT01-00000005',
      cliente: clienteDto,
      detalles: [
        { id: 1, producto_id: 3, unidad_id: 2, prod_nom: 'Arroz', cantidad: 4, precio_unitario: '114.00',
          descuento: '0', producto: { codigo_interno: 'ARR-001' }, unidad: { nombre: 'Kilogramo' } },
        { id: 2, producto_id: 4, unidad_id: 1, prod_nom: 'Aceite', cantidad: 1, precio_unitario: null,
          descuento: '0', producto: { codigo_interno: 'ACE-001' }, unidad: { nombre: 'Unidad' } },
      ],
    } as any);

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

    it('trae las líneas reales de la guía, fija la cantidad y hereda la cotización', () => {
      component.onSelectGuia(guia);

      const lineas = component.detailsArray.getRawValue();
      expect(lineas.map((l: any) => l.prod_id)).toEqual([3, 4]);
      expect(lineas[0]).toEqual(jasmine.objectContaining({
        // 114 sin IGV en la cotización -> 134.52 con IGV en la venta.
        cantidad: 4, prod_nom: 'Arroz', prod_cod_interno: 'ARR-001', unidad: 'Kilogramo', precio_unitario: 134.52,
      }));
      expect(component.detailsArray.at(0).get('cantidad')!.disabled).toBeTrue();
      // Sin precio en la guía: el vendedor debe poder escribirlo.
      expect(component.detailsArray.at(1).get('precio_unitario')!.enabled).toBeTrue();
      expect(component.form.getRawValue().cot_id).toBe(5);
    });

    it('getClientInitialValue reads the mapped business name, not the non-existent cli_nom', () => {
      component.linkedGuia.set(guia);

      expect(component.getClientInitialValue('cli_id')).toBe('Maria Lopez');
    });
  });

  describe('nota de crédito', () => {
    const sale = {
      id: 7, numero_completo: 'B001-00000015', fecha_emision: '2026-10-29', total: 118, estado_id: 2, estado_nombre: 'Completado',
      documento_codigo: '03', documento_nombre: 'BOLETA DE VENTA ELECTRÓNICA', cliente_nombre: 'CLIENTES VARIOS', cliente_documento: null,
    } as SaleListItemModel;

    it('solo se ofrece en boletas que no fueron anuladas con nota', () => {
      expect(component.canIssueCreditNote(sale)).toBeTrue();
      expect(component.canIssueCreditNote({ ...sale, estado_id: 4 })).toBeFalse();
      expect(component.canIssueCreditNote({ ...sale, documento_codigo: '99' })).toBeFalse();
    });

    it('al cerrar el modal refresca solo si se creó una nota', () => {
      component.creditNoteSale.set(sale);

      component.onCreditNoteClosed(false);
      expect(component.creditNoteSale()).toBeNull();
      expect(saleService.search).not.toHaveBeenCalled();

      component.onCreditNoteClosed(true);
      expect(saleService.search).toHaveBeenCalled();
    });
  });
});
