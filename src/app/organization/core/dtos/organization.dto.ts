export type OrganizationDto = {
  id: number;
  compania_id: number | null;
  nombre: string;
  ruc: string;
  email: string | null;
  direccion: string | null;
  telefono: string | null;
  pagina_web: string | null;
  logo: string | null;
  logo_url: string | null;
  est: boolean;
};
