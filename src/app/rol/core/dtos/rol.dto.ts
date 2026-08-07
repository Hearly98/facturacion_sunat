export class RolDto {
  id: number = 0;
  nombre: string = '';
  /** Solo en la respuesta de lectura — la Entity emite `activo`, no `est`. */
  activo: boolean = true;
  /** Solo en el body de escritura — RolController::update() valida `est`, no `activo`. */
  est: boolean = true;
}
