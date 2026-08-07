import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' },
  },
  {
    title: true,
    name: 'Menu',
  },
  {
    name: 'Mantenimiento',
    iconComponent: { name: 'cil-star' },
    children: [
      {
        name: 'Proveedor',
        url: '/proveedores',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Tipo Documento',
        url: '/tipo-documento',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Cliente',
        url: '/clientes',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Producto',
        url: '/productos',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Metodo de Pago',
        url: '/metodo-pago',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Categoria',
        url: '/categorias',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Marca',
        url: '/marcas',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Banco',
        url: '/bancos',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Sucursal',
        url: '/sucursales',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Moneda',
        url: '/monedas',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Documento',
        url: '/documentos',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Empresa',
        url: '/empresa',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Unidad de Medida',
        url: '/unidad-medida',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Usuario',
        url: '/usuario',
        icon: 'nav-icon-bullet',
      },
      {
        name: 'Rol',
        url: '/rol',
        icon: 'nav-icon-bullet',
      },
    ],
  },
  {
    title: true,
    name: 'Compras',
  },
  {
    name: 'Compras',
    iconComponent: { name: 'cil-cart' },
    children: [
      {
        name: 'Compras',
        url: '/compras',
        icon: 'nav-icon-bullet',
      },
    ],
  },
  {
    title: true,
    name: 'Logistica',
  },
  {
    name: 'Almacenes',
    url: '/almacenes',
    iconComponent: { name: 'cil-layers' },
  },
  {
    name: 'Sucursales Stock',
    url: '/productos-sucursal',
    iconComponent: { name: 'cil-list-numbered' },
  },
  {
    name: 'Kardex',
    url: '/kardex',
    iconComponent: { name: 'cil-spreadsheet' },
  },
  {
    name: 'Movimientos',
    url: '/movimientos',
    iconComponent: { name: 'cil-transfer' },
  },
  {
    title: true,
    name: 'Comercial',
  },
  {
    name: 'Ventas',
    iconComponent: { name: 'cil-cash' },
    children: [
      {
        name: 'Ventas',
        url: '/ventas',
        icon: 'nav-icon-bullet',
      },
    ],
  },
  {
    name: 'Cotizaciones',
    iconComponent: { name: 'cil-file' },
    children: [
      {
        name: 'Cotizaciones',
        url: '/cotizaciones',
        icon: 'nav-icon-bullet',
      }
    ],
  },
  {
    name: 'Guías de Remisión',
    url: '/guias-remision',
    iconComponent: { name: 'cil-truck' },
  },
  {
    title: true,
    name: 'Configuración',
  },
  {
    name: 'Series',
    url: '/series',
    iconComponent: { name: 'cil-list-numbered' },
  },
  {
    title: true,
    name: 'Links',
    class: 'mt-auto',
  },
  {
    name: 'Ayuda',
    url: '/ayuda',
    iconComponent: { name: 'cil-description' },
    attributes: { target: '_blank' },
  },
];
