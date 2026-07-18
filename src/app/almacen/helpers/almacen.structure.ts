import { Sucursal } from 'src/app/sucursal/core/models';

export const AlmacenStructure = (sucursales?: Sucursal[]) => {
  let sucursalOptions: { label: string; value: number }[] = [];
  if (sucursales) {
    sucursalOptions = sucursales.map((s) => ({ label: s.name, value: s.id }));
  }
  return [
    {
      label: 'Código',
      formControlName: 'codigo',
      type: 'text',
      col: '12',
    },
    {
      label: 'Nombre de Almacén',
      formControlName: 'nombre',
      type: 'text',
      col: '12',
    },
    {
      label: 'Descripción',
      formControlName: 'descripcion',
      type: 'text',
      col: '12',
    },
    {
      label: 'Sucursal',
      formControlName: 'sucursalId',
      type: 'select',
      col: '12',
      options: sucursalOptions,
    },
  ];
};
