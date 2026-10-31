export const organizationStructure: { label: string; formControlName: string; type: string; col: string; list?: string }[] = [
  { label: 'Nombre', formControlName: 'name', type: 'text', col: '12' },
  { label: 'RUC', formControlName: 'ruc', type: 'text', col: '12' },
  { label: 'Correo', formControlName: 'email', type: 'email', col: '12' },
  { label: 'Dirección', formControlName: 'address', type: 'text', col: '12' },
  { label: 'Teléfono', formControlName: 'phone', type: 'text', col: '6' },
  { label: 'Página', formControlName: 'website', type: 'text', col: '6' },
  { label: 'Ubigeo del domicilio fiscal', formControlName: 'ubigeo', type: 'text', col: '12', list: 'ubigeos' },
  { label: 'Logo', formControlName: 'logo', type: 'file', col: '12' },
];
