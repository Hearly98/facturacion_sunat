export interface User {
  id: number | null;
  firstName: string;
  lastName: string;
  email: string;
  dni: string;
  phone: string;
  roleId: number;
  active: boolean;
  image?: string;
  idSucursales: number[];
}
