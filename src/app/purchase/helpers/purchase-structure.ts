import { mapToSelectOption } from '@shared/functions';
import { SelectOption } from '@shared/types';
import { NewPurchaseComponent } from '../pages/new-purchase/new-purchase.component';
import { PurchaseForm } from '../core/purchase.form';
import { Currency } from 'src/app/currency/core/models';
import { PaymentMethod } from 'src/app/payment-method/core/models';
import { DocumentType } from 'src/app/document-type/core/models';

export type Control<SM extends Record<string, any>> =
  | SelectControl
  | SearchSelectControl<SM>
  | TextControl
  | CheckboxControl;

interface ControlBase {
  label: string;
  type: string;
  col: string;
  formControlName: keyof PurchaseForm;
}

interface SelectControl extends ControlBase {
  type: 'select';
  options: SelectOption[];
}

export interface SearchSelectControl<SM extends Record<string, any>> extends ControlBase {
  type: 'search-select';
  bindLabel: string;
  bindValue: string;
  serviceFnName?: string;
}

interface TextControl extends ControlBase {
  type: 'text' | 'date';
  placeholder: string;
}

interface CheckboxControl extends ControlBase {
  type: 'checkbox';
}

export interface PurchaseStructure<SM extends Record<string, any>> {
  title: string;
  controls: Control<SM>[];
}
export const purchaseStructure = (
  CurrencySelectOptions: Currency[] = [],
  PaymentTypeOptions: PaymentMethod[] = [],
  DocumentTypesOptions: DocumentType[] = [],
): PurchaseStructure<NewPurchaseComponent['serviceMap']>[] => {
  return [
    {
      title: 'Tipo de Pago',
      controls: [
        {
          label: 'Tipo Documento',
          type: 'select',
          col: '4',
          formControlName: 'doc_id',
          options: [
            { label: 'FACTURA ELECTRÓNICA', value: 1 },
            {
              label: 'BOLETA ELECTRÓNICA',
              value: 2,
            },
          ],
        },
        {
          label: 'Tipo de Pago',
          type: 'select',
          col: '4',
          formControlName: 'mp_cod',
          // El backend espera un id de metodo_pagos (StoreCompraRequest.idMetodoPago), no el code
          options: mapToSelectOption(PaymentTypeOptions, 'id', 'name'),
        },
        {
          label: 'Moneda',
          type: 'select',
          col: '4',
          formControlName: 'mon_id',
          options: mapToSelectOption(CurrencySelectOptions, 'id', 'name'),
        },
        {
          label: 'Fecha Emisión',
          type: 'date',
          col: '6',
          formControlName: 'fechaEmision',
          placeholder: '',
        },
        {
          label: 'Documento',
          type: 'text',
          col: '6',
          formControlName: 'numero',
          placeholder: 'Número de Documento',
        },
      ],
    },
    {
      title: 'Datos de Proveedor',
      controls: [
        {
          label: 'Proveedor',
          col: '4',
          type: 'search-select',
          formControlName: 'prov_id',
          bindLabel: 'name',
          bindValue: 'id',
          serviceFnName: 'providerSearch',
        },
        {
          label: 'Tipo Documento',
          col: '4',
          type: 'select',
          formControlName: 'tip_id',
          options: mapToSelectOption(DocumentTypesOptions, 'id', 'name'),
        },
        {
          label: 'Documento',
          col: '4',
          type: 'text',
          placeholder: 'Documento',
          formControlName: 'prov_documento',
        },
        {
          label: 'Dirección',
          col: '5',
          placeholder: 'Dirección',
          type: 'text',
          formControlName: 'prov_direcc',
        },
        {
          label: 'Correo',
          col: '4',
          type: 'text',
          placeholder: 'Correo electrónico',
          formControlName: 'prov_correo',
        },
        {
          label: 'Teléfono',
          col: '3',
          type: 'text',
          placeholder: 'Teléfono',
          formControlName: 'prov_telf',
        },
      ],
    },
  ];
};
