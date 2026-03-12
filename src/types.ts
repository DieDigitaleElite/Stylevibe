export interface Product {
  id: string;
  name: string;
  brand: string;
  price: string;
  image: string;
  affiliateUrl: string;
  category: string;
}

export interface StylingResult {
  imageUrl: string;
  description: string;
  recommendations: Product[];
}

export type StyleType = 'Streetwear' | 'Business Casual' | 'Boho Chic' | 'Minimalist' | 'Cyberpunk' | 'Old Money';
