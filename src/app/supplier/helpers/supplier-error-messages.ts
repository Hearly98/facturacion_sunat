export const supplierErrorMessages = () => {
  return {
    name: {
      required: 'El nombre es obligatorio',
      minLength: 'El nombre debe tener un mínimo de 3 caracteres',
    },
    address: {
      required: 'La dirección es obligatoria',
      minLength: 'La dirección tiene un mínimo de 3 caracteres',
    },
    document: {
      required: 'El documento es obligatorio',
    },
    email: {
      required: 'El correo es obligatorio',
      email: 'No es un email válido',
    },
    documentTypeId: {
      required: 'El Tipo Documento es obligatorio',
    },
    phone: {
      pattern: 'El Telefono debe ser válido',
    },
  };
};
