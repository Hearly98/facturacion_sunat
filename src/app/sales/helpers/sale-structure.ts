import { SelectOption } from '@shared/types';
import { NewSalePage } from '../pages/new-sale/new-sale.page';
import { SaleForm } from '../core/types';

export type Control<SM extends Record<string, any>> =
  | SelectControl
  | SearchSelectControl<SM>
  | TextControl
  | CheckboxControl;

interface ControlBase {
  label: string;
  type: string;
  col: string;
  formControlName: keyof SaleForm;
}

interface SelectControl extends ControlBase {
  type: 'select';
  options: SelectOption[];
}

export interface SearchSelectControl<SM extends Record<string, any>> extends ControlBase {
  type: 'search-select';
  bindLabel: string;
  bindValue: string;
  serviceFnName: keyof SM;
}

interface TextControl extends ControlBase {
  type: 'text' | 'date' | 'number';
  placeholder: string;
}

interface CheckboxControl extends ControlBase {
  type: 'checkbox';
}

export interface SaleStructure<SM extends Record<string, any>> {
  title: string;
  controls: Control<SM>[];
}

export const saleStructure = (
  CurrencySelectOptions: SelectOption[] = [],
  PaymentTypeOptions: SelectOption[] = [],
  DocumentsOptions: SelectOption[] = [],
  DocumentTypesOptions: SelectOption[] = [],
  SucursalOptions: SelectOption[] = [],
  CompanyOptions: SelectOption[] = [],
  AlmacenOptions: SelectOption[] = [],
  showFechaVencimiento: boolean = false
): SaleStructure<NewSalePage['serviceMap']>[] => {
  const baseStructure: SaleStructure<NewSalePage['serviceMap']>[] = [
    {
      title: 'Información de la Venta',
      controls: [
        {
          label: 'Empresa',
          type: 'select',
          col: '3',
          formControlName: 'emp_id',
          options: CompanyOptions,
        },
        {
          label: 'Tipo Documento',
          type: 'select',
          col: '3',
          formControlName: 'doc_id',
          options: DocumentsOptions,
        },
        {
          label: 'Sucursal',
          type: 'select',
          col: '3',
          formControlName: 'suc_id',
          options: SucursalOptions,
        },
        {
          label: 'Almacén',
          type: 'select',
          col: '3',
          formControlName: 'almacen_id',
          options: AlmacenOptions,
        },
        {
          label: 'Fecha Emisión',
          type: 'date',
          col: '3',
          formControlName: 'fecha_emision',
          placeholder: '',
        },
        {
          label: 'Tipo de Pago',
          type: 'select',
          col: '3',
          formControlName: 'mp_cod',
          options: PaymentTypeOptions,
        },
        {
          label: 'Moneda',
          type: 'select',
          col: '3',
          formControlName: 'mon_id',
          options: CurrencySelectOptions,
        },
        {
          label: 'Vendedor',
          type: 'number',
          col: '3',
          formControlName: 'vendedor_id',
          placeholder: 'ID Vendedor',
        },
        {
          label: 'Afecta Stock',
          col: '3',
          type: 'checkbox',
          formControlName: 'afecta_stock',
        },
      ],
    },
    {
      title: 'Documento Origen',
      controls: [
        {
          label: 'Cotización',
          col: '6',
          type: 'search-select',
          formControlName: 'cot_id',
          bindLabel: 'numero_completo',
          bindValue: 'cot_id',
          serviceFnName: 'cotizacionSearch',
        },
        {
          label: 'Guía de Remisión',
          col: '6',
          type: 'search-select',
          formControlName: 'guia_id',
          bindLabel: 'numero_completo',
          bindValue: 'guia_id',
          serviceFnName: 'guiaSearch',
        },
      ],
    },
    {
      title: 'Cliente',
      controls: [
        {
          label: 'Buscar Cliente',
          col: '4',
          type: 'search-select',
          formControlName: 'cli_id',
          bindLabel: 'cli_nom',
          bindValue: 'cli_id',
          serviceFnName: 'customerSearch',
        },
        {
          label: 'Tipo Documento',
          col: '4',
          type: 'select',
          formControlName: 'tip_id',
          options: DocumentTypesOptions,
        },
        {
          label: 'Documento',
          col: '4',
          type: 'text',
          placeholder: 'Documento',
          formControlName: 'cli_documento',
        },
        {
          label: 'Dirección',
          col: '5',
          placeholder: 'Dirección',
          type: 'text',
          formControlName: 'cli_direcc',
        },
        {
          label: 'Correo',
          col: '4',
          type: 'text',
          placeholder: 'Correo electrónico',
          formControlName: 'cli_correo',
        },
        {
          label: 'Teléfono',
          col: '3',
          type: 'text',
          placeholder: 'Teléfono',
          formControlName: 'cli_telf',
        },
      ],
    },
    {
      title: 'Agregar Producto',
      controls: [
        {
          label: 'Producto',
          col: '8',
          type: 'search-select',
          formControlName: 'prod_id',
          bindLabel: 'label',
          bindValue: 'prod_id',
          serviceFnName: 'productSearch',
        },
      ],
    },
  ];

  // Agregar fecha de vencimiento si el método de pago es crédito
  if (showFechaVencimiento) {
    baseStructure[0].controls.push({
      label: 'Fecha Vencimiento',
      type: 'date',
      col: '3',
      formControlName: 'fecha_vencimiento',
      placeholder: '',
    });
  }

  return baseStructure;
};
