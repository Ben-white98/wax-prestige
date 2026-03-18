export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  imageUrl: string;
  thumbnails?: string[];
  isPromo?: boolean;
  promoPrice?: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt?: any;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt?: any;
}
