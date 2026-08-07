export type UpdateOrganizationDto = {
  id: number;
  nombre: string;
  ruc: string;
  email?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  pagina_web?: string | null;
  logo?: string | null;
  est?: boolean;
};
