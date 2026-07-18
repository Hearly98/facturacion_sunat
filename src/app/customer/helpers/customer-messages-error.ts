export const customerErrorMessages = () => {
  return {
    firstName: {
      required: 'El nombre es obligatorio',
      minLength: 'El nombre debe tener un mínimo de 3 caracteres',
    },
    lastName: {
      required: 'El apellido es obligatorio',
      minLength: 'El apellido debe tener un mínimo de 3 caracteres',
    },
    documentTypeId: {
      required: 'El tipo de documento es obligatorio',
    },
    document: {
      required: 'El documento es obligatorio',
    },
    phone: {
      required: 'El telefono es obligatorio'
    },
    email: {
      required: 'El correo es obligatorio',
      email: 'No es un email válido'
    },
  };
};
