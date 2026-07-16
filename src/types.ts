export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  photoUrl?: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  sizes: string[]; // e.g. ["8 inches", "12 inches", "16 inches"]
  colors: { name: string; value: string }[]; // e.g. [{name: 'Indigo Gold', value: '#1E3A8A'}, {name: 'Emerald Gold', value: '#065F46'}]
  isPersonalizable: boolean;
  leadTimeDays: number; // custom made-to-order lead time
  materials: string[];
  rating: number;
  reviewsCount: number;
  isReadyMade: boolean;
  featured?: boolean;
}

export interface CartItem {
  id: string; // unique cart item id (product id + custom options hash)
  product: Product;
  quantity: number;
  size: string;
  color: { name: string; value: string };
  personalization?: {
    text: string;
    language: 'Hindi' | 'English' | 'Sanskrit';
    photoUrl?: string;
  };
}

export interface Order {
  id: string;
  items: CartItem[];
  customerName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: 'UPI' | 'Card' | 'Netbanking' | 'Razorpay_Test';
  paymentStatus: 'pending' | 'completed' | 'failed';
  orderStatus: 'received' | 'in_progress' | 'shipped' | 'delivered';
  totalAmount: number;
  createdAt: string;
  customNotes?: string;
  whatsappLink?: string;
  trackingNotes?: string;
}

export interface AdminAnalytics {
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: {
    received: number;
    in_progress: number;
    shipped: number;
    delivered: number;
  };
  bestSellers: {
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  password?: string;
}

export interface ArtCategory {
  id: string;
  label: string;
  desc: string;
  imageUrl?: string;
  imageUrls?: string[];
  icon?: string;
  color?: string;
  index?: string;
  iconColor?: string;
}

export interface StudioSettings {
  announcementText: string;
  heroSubtitle: string;
  heroTitle: string;
  heroDescription: string;
  heroButtonText: string;
  heroImageUrl: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  founderImageUrl: string;
  additionalAdmins?: string;
  themePreset?: string;
  primaryColor?: string;
  accentColor?: string;
  bgColor?: string;
  bgAltColor?: string;
  announcementBg?: string;
  announcementTextColor?: string;
  enableGlowEffects?: boolean;
  categories?: ArtCategory[];
  studioTourVideoUrl?: string;
  studioTourThumbnailUrl?: string;
  studioTourTitle?: string;
  studioTourDescription?: string;
}

