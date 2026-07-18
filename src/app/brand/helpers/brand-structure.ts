export const brandStructure = [
  {
    label: 'Nombre',
    formControlName: 'name',
    type: 'text',
    col: '12',
    required: true,
    maxLength: 100,
  },
  {
    label: 'Código',
    formControlName: 'code',
    type: 'text',
    col: '12',
    required: true,
    maxLength: 50,
    pattern: '^[A-Za-z0-9\-_]+$',
  },
  {
    label: 'Activo',
    formControlName: 'active',
    type: 'checkbox',
    col: '12',
  },
];
