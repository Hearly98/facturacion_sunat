export const SucursalStructure = [
  {
    label: 'Código',
    formControlName: 'code',
    type: 'text',
    col: '12',
  },
  {
    label: 'Nombre',
    formControlName: 'name',
    type: 'text',
    col: '12',
  },
  {
    label: 'Dirección',
    formControlName: 'address',
    type: 'text',
    col: '12',
  },
  {
    // Departamento, provincia y distrito se completan solos al elegir el ubigeo.
    label: 'Ubigeo (departamento / provincia / distrito)',
    formControlName: 'zip',
    type: 'ubigeo',
    col: '12',
  },
];
