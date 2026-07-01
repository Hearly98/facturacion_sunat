export const customerErrorMessages = () => {
  return {
    nombre: {
      required: 'El nombre es obligatorio',
      minLength: 'El nombre debe tener un mínimo de 3 caracteres',
    },
    apellido: {
      required: 'El apellido es obligatorio',
      minLength: 'El apellido debe tener un mínimo de 3 caracteres',
    },
    tipoDocumentoId: {
      required: 'El tipo de documento es obligatorio',
    },
    documento: {
      required: 'El documento es obligatorio',
    },
    telefono: {
      required: 'El telefono es obligatorio'
    },
    email: {
      required: 'El correo es obligatorio',
      email: 'No es un email válido'
    },
  };
};
