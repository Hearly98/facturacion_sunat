export const documentTypeErrorMessages = () => {
  return {
    nombre: {
      required: 'El nombre es obligatorio',
      minLength: 'El nombre debe tener un mínimo de 3 caracteres',
    },
    codigo: {
      required: 'El código es obligatorio',
    },
  };
};
