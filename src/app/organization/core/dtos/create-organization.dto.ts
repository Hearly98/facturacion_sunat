export type CreateOrganizationDto = Omit<
  {
    com_id: number;
    emp_nom: string;
    emp_ruc: string;
    emp_correo: string;
    emp_direcc: string;
    emp_telf: string;
    emp_pag: string;
    emp_logo: string;
    est: boolean;
  },
  'com_id'
>;
