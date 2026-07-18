export interface UserDto {
  usu_id: number;
  usu_nom: string;
  usu_ape: string;
  email: string;
  password?: string;
  usu_dni: string;
  usu_telf: string;
  rol_id: number;
  est: boolean;
  usu_img?: string;
}

export interface CreateUserDto {
  usu_nom: string;
  usu_ape: string;
  email: string;
  password: string;
  usu_dni: string;
  usu_telf: string;
  rol_id: number;
  usu_img?: string;
}

export interface UpdateUserDto {
  usu_nom: string;
  usu_ape: string;
  email: string;
  password?: string;
  usu_dni: string;
  usu_telf: string;
  rol_id: number;
  usu_img?: string;
}
