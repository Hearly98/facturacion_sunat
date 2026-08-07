export const userStructure = [
  {
    label: 'Nombre',
    formControlName: 'firstName',
    type: 'text',
    col: 12,
  },
  {
    label: 'Apellidos',
    formControlName: 'lastName',
    type: 'text',
    col: 12,
  },
  {
    label: 'Email',
    formControlName: 'email',
    type: 'email',
    col: 12,
  },
  {
    label: 'Contraseña',
    formControlName: 'password',
    type: 'password',
    col: 12,
  },
  {
    label: 'Documento',
    formControlName: 'dni',
    type: 'text',
    col: 6,
  },
  {
    label: 'Teléfono',
    formControlName: 'phone',
    type: 'text',
    col: 6,
  },
  {
    label: 'Rol',
    formControlName: 'roleId',
    type: 'select',
    col: 6,
    options: []
  },
];
