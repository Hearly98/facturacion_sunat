export type CreateOrganizationDto = {
  nombre: string;
  ruc: string;
  email?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  pagina_web?: string | null;
  codigo_ubigeo?: string | null;
  logo?: string | null;
  est?: boolean;
};
