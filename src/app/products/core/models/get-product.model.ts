import { Product } from "./product.model";

export interface GetProduct extends Product {
  category?: any | null;
  imageUrl?: string;
}