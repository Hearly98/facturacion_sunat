export interface UserDto {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  password?: string;
  dni: string;
  telefono: string;
  rol_id: number;
  est: boolean;
  imagen_perfil?: string;
  sucursales?: { id: number }[];
}

export interface CreateUserDto {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  dni: string;
  telefono: string;
  idRol: number;
  imagenPerfil?: string;
  idSucursales?: number[];
}

export interface UpdateUserDto {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  password?: string;
  dni: string;
  telefono: string;
  idRol: number;
  imagenPerfil?: string;
  idSucursales?: number[];
}
