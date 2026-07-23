import { BancoFilterForm } from '../core/types';

export function bancoMapFilterParams(formValue: Partial<BancoFilterForm>): Record<string, any> {
  const params: Record<string, any> = {};

  if (formValue.name?.trim()) {
    params['nombre'] = formValue.name.trim();
  }

  if (formValue.accountNumber?.trim()) {
    params['numero_cuenta'] = formValue.accountNumber.trim();
  }

  return params;
}

export function bancoFilterSort(): Array<{ property: string; direction: string }> {
  return [
    {
      property: 'nombre',
      direction: 'asc',
    },
  ];
}
