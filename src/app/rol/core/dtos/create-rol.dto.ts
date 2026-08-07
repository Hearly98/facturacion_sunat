import { RolDto } from './rol.dto';

export type CreateRolDto = Omit<RolDto, 'id'>;
