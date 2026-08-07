import { RolModel } from "./rol.model";

export type CreateRol = Omit<RolModel, 'id'>;