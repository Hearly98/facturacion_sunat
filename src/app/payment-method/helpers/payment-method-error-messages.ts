export const paymentMethodErrorMessages = () => {
  return {
    code: {
      required: 'El código es obligatorio.',
      minLength: 'Debe ser un mínimo de 1 carácter.',
    },
    name: {
      required: 'El nombre es obligatorio.',
      minLength: 'Debe ser un mínimo de 3 caracteres.',
    },
  };
};
