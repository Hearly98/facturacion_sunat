export const brandErrorMessages = () => {
  return {
    codigo: {
      required: 'El código es obligatorio.',
      minLength: 'El código debe tener un mínimo de 2 caracteres.',
    },
    nombre: {
      required: 'El nombre es obligatorio.',
      minLength: 'El nombre debe tener un mínimo de 3 caracteres.',
    },
  };
};
