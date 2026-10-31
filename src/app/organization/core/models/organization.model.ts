export type Organization = {
  id: number;
  name: string;
  ruc: string;
  email: string;
  address: string;
  phone: string;
  website: string;
  // Ubigeo INEI del domicilio fiscal: obligatorio para emitir comprobantes
  ubigeo: string;
  logo: string;
  status: boolean;
};
