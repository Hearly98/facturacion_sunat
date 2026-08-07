export const currencyErrorMessages = () => {
  return {
    name: {
      required: 'El nombre es obligatorio.',
      minLength: 'Debe ser mínimo de 3 caracteres.',
    },
    code: {
      required: 'El código es obligatorio.',
      minLength: 'Debe ser mínimo de 2 caracteres.',
    },
    symbol: {
      required: 'El símbolo es obligatorio.',
    },
  };
};
