import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: '#',
    loadComponent: () => import('./landing/landing.component').then((m) => m.LandingComponent),
    data: {
      title: 'FactuLink - Facturación para tu PyME',
    },
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout').then((m) => m.DefaultLayoutComponent),
    data: {
      title: 'Home',
    },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/pages/dashboard/dashboard').then((m) => m.Dashboard),
        data: {
          title: 'Dashboard',
        },
      },
      {
        path: 'categorias',
        loadComponent: () => import('./category/pages/category/category').then((m) => m.Category),
        data: {
          title: 'Categoria',
        },
      },
      {
        path: 'marcas',
        loadComponent: () => import('./brand/pages/brand/brand').then((m) => m.BrandComponent),
        data: {
          title: 'Marcas',
        },
      },
      {
        path: 'empresa',
        loadComponent: () =>
          import('./organization/pages/organization-profile.component').then((m) => m.OrganizationProfileComponent),
        data: {
          title: 'Mi Empresa',
        },
      },
      {
        path: 'tipo-documento',
        loadComponent: () =>
          import('./document-type/pages/document-type/document-type.component').then(
            (m) => m.DocumentTypeComponent,
          ),
        data: {
          title: 'Tipo Documentos',
        },
      },
      {
        path: 'documentos',
        loadComponent: () => import('./document/pages/document.page').then((m) => m.DocumentPage),
        data: {
          title: 'Documento',
        },
      },
      {
        path: 'monedas',
        loadComponent: () => import('./currency/pages/currency.page').then((m) => m.CurrencyPage),
        data: {
          title: 'Moneda',
        },
      },
      {
        path: 'productos',
        loadComponent: () => import('./products/pages/products/products').then((m) => m.Products),
        data: {
          title: 'Producto',
        },
      },
      {
        path: 'sucursales',
        loadComponent: () => import('./sucursal/pages/sucursal/sucursal').then((m) => m.Sucursal),
        data: {
          title: 'Sucursal',
        },
      },
      {
        path: 'unidad-medida',
        loadComponent: () =>
          import('./unit-of-measure/pages/view/unit-of-measure.component').then(
            (m) => m.UnitOfMeasurePage,
          ),
        data: {
          title: 'Unidad de Medida',
        },
      },
      {
        path: 'usuario',
        loadComponent: () => import('./user/pages/user/user.page').then((m) => m.UserPage),
        data: {
          title: 'Usuario',
        },
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./user/pages/user-profile/user-profile.component').then((m) => m.UserProfileComponent),
        data: {
          title: 'Mi Perfil',
        },
      },
      {
        path: 'rol',
        loadComponent: () => import('./rol/pages/rol/rol').then((m) => m.Rol),
        data: {
          title: 'Rol',
        },
      },
      {
        path: 'proveedores',
        loadComponent: () => import('./supplier/pages/supplier.page').then((m) => m.SupplierPage),
        data: {
          title: 'Proveedor',
        },
      },
      {
        path: 'clientes',
        loadComponent: () => import('./customer/pages/customer.page').then((m) => m.CustomerPage),
        data: {
          title: 'Cliente',
        },
      },
      {
        path: 'metodo-pago',
        loadComponent: () =>
          import('./payment-method/pages/payment-method-search/payment-method.component').then(
            (m) => m.PaymentMethodComponent,
          ),
        data: {
          title: 'Metodo de Pago',
        },
      },
      {
        path: 'compras',
        loadComponent: () =>
          import('./purchase/pages/purchase-main/purchase-main.page').then(
            (m) => m.PurchaseMainPage,
          ),
        data: {
          title: 'Compras',
        },
      },
      {
        path: 'ventas',
        loadComponent: () =>
          import('./sales/pages/sales-main/sales-main.page').then((m) => m.SalesMainPage),
        data: {
          title: 'Ventas',
        },
      },
      {
        path: 'ver-venta/:id',
        redirectTo: 'ventas',
      },
      {
        path: 'cotizaciones',
        loadComponent: () =>
          import('./quotation/pages/quotation-main/quotation-main.page').then((m) => m.QuotationMainPage),
        data: {
          title: 'Cotizaciones',
        },
      },
      {
        path: 'editar-cotizacion/:id',
        redirectTo: 'cotizaciones',
      },
      {
        path: 'guias-remision',
        loadComponent: () =>
          import('./shipping-guide/pages/shipping-guide-main.page').then(
            (m) => m.ShippingGuideMainPage,
          ),
        data: {
          title: 'Guías de Remisión',
        },
      },
      {
        path: 'historial-guias-remision',
        redirectTo: 'guias-remision',
      },
      {
        path: 'series',
        loadComponent: () => import('./series/pages/series.page').then((m) => m.SeriesPage),
        data: {
          title: 'Series',
        },
      },
      {
        path: 'almacenes',
        loadComponent: () =>
          import('./almacen/pages/almacen/almacen').then((m) => m.AlmacenComponent),
        data: {
          title: 'Almacenes',
        },
      },
      {
        path: 'almacen-stock/:id',
        loadComponent: () =>
          import('./almacen/pages/almacen-stock/almacen-stock').then(
            (m) => m.AlmacenStockComponent,
          ),
        data: {
          title: 'Stock del Almacén',
        },
      },
      {
        path: 'kardex',
        loadComponent: () =>
          import('./kardex/pages/kardex-report/kardex-report').then((m) => m.KardexReportComponent),
        data: {
          title: 'Kardex de Inventario',
        },
      },
      {
        path: 'movimientos',
        loadComponent: () =>
          import('./movimiento/pages/movimiento-main/movimiento-main.page').then(
            (m) => m.MovimientoMainPage,
          ),
        data: {
          title: 'Movimientos',
        },
      },
    ],
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
    data: {
      title: 'Login Page',
    },
  },
  { path: '**', redirectTo: 'app/dashboard' },
];
