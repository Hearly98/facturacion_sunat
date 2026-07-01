export const documentErrorMessages = () => {
  return {
    codigo: {
      required: 'El código es obligatorio.',
      minLength: 'Debe tener un mínimo de 2 caracteres.',
    },
    nombre: {
      required: 'El nombre es obligatorio.',
      minLength: 'Debe tener un mínimo de 3 caracteres.',
    },
  };
};
