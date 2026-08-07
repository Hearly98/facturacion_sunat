import { User, CreateUser, UpdateUser } from '../models';
import { UserDto, CreateUserDto, UpdateUserDto } from '../dto/user.dto';

export class UserMapper {
  static fromApi(dto: UserDto): User {
    return {
      id: dto.id,
      firstName: dto.nombre,
      lastName: dto.apellido,
      email: dto.email,
      dni: dto.dni,
      phone: dto.telefono,
      roleId: dto.rol_id,
      active: dto.est,
      image: dto.imagen_perfil,
      idSucursales: (dto.sucursales ?? []).map(s => s.id),
    };
  }

  static toApiCreate(model: CreateUser): CreateUserDto {
    return {
      nombre: model.firstName,
      apellido: model.lastName,
      email: model.email,
      password: model.password,
      dni: model.dni,
      telefono: model.phone,
      idRol: model.roleId,
      imagenPerfil: model.image,
      idSucursales: model.idSucursales,
    };
  }

  static toApiUpdate(model: UpdateUser): UpdateUserDto {
    return {
      id: model.id,
      nombre: model.firstName,
      apellido: model.lastName,
      email: model.email,
      password: model.password,
      dni: model.dni,
      telefono: model.phone,
      idRol: model.roleId,
      imagenPerfil: model.image,
      idSucursales: model.idSucursales,
    };
  }

  static toApi(model: User): UserDto {
    return {
      id: model.id ?? 0,
      nombre: model.firstName,
      apellido: model.lastName,
      email: model.email,
      dni: model.dni,
      telefono: model.phone,
      rol_id: model.roleId,
      est: model.active,
      imagen_perfil: model.image,
    };
  }
}
