export interface UserForm {
  id: number | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  password: string | null;
  dni: string | null;
  phone: string | null;
  roleId: number | null;
  active: boolean | null;
  image: string | null;
  idSucursales: number[] | null;
}
