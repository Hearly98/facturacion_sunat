export const documentTypeErrorMessages = () => {
  return {
    name: {
      required: 'El nombre es obligatorio',
      minLength: 'El nombre debe tener un mínimo de 3 caracteres',
    },
    code: {
      required: 'El código es obligatorio',
    },
  };
};
