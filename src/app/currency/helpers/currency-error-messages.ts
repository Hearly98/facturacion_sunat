export const currencyErrorMessages = () => {
  return {
    nombre: {
      required: 'El nombre es obligatorio.',
      minLength: 'Debe ser mínimo de 3 caracteres.',
    },
    codigo: {
      required: 'El código es obligatorio.',
      minLength: 'Debe ser mínimo de 2 caracteres.',
    },
    simbolo: {
      required: 'El simbolo es obligatorio.',
    },
  };
};
