export interface UpdateUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  dni: string;
  phone: string;
  roleId: number;
  image?: string;
}
