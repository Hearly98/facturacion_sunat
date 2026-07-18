import { User, CreateUser, UpdateUser } from '../models';
import { UserDto, CreateUserDto, UpdateUserDto } from '../dto/user.dto';

export class UserMapper {
  static fromApi(dto: UserDto): User {
    return {
      id: dto.usu_id,
      firstName: dto.usu_nom,
      lastName: dto.usu_ape,
      email: dto.email,
      dni: dto.usu_dni,
      phone: dto.usu_telf,
      roleId: dto.rol_id,
      active: dto.est,
      image: dto.usu_img,
    };
  }

  static toApiCreate(model: CreateUser): CreateUserDto {
    return {
      usu_nom: model.firstName,
      usu_ape: model.lastName,
      email: model.email,
      password: model.password,
      usu_dni: model.dni,
      usu_telf: model.phone,
      rol_id: model.roleId,
      usu_img: model.image,
    };
  }

  static toApiUpdate(model: UpdateUser): UpdateUserDto {
    return {
      usu_nom: model.firstName,
      usu_ape: model.lastName,
      email: model.email,
      password: model.password,
      usu_dni: model.dni,
      usu_telf: model.phone,
      rol_id: model.roleId,
      usu_img: model.image,
    };
  }

  static toApi(model: User): UserDto {
    return {
      usu_id: model.id ?? 0,
      usu_nom: model.firstName,
      usu_ape: model.lastName,
      email: model.email,
      usu_dni: model.dni,
      usu_telf: model.phone,
      rol_id: model.roleId,
      est: model.active,
      usu_img: model.image,
    };
  }
}
