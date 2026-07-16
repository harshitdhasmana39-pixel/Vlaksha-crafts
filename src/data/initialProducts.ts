import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Royal Indigo Lippan Wall Plate',
    description: 'A spectacular hand-painted circular clay board adorned with traditional Lippan mud-mirror art. Features complex radial geometric patterns, fine white outline work, real glass mirrors of various shapes (rhombus, circular, teardrop), and a shimmering metallic gold trim. Perfect as a center statement piece for living rooms or entryways.',
    category: 'mandala-wall-plates',
    price: 1850,
    images: [
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop', // Blue/indigo art base
      'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600&auto=format&fit=crop'
    ],
    sizes: ['10 inches', '12 inches', '16 inches'],
    colors: [
      { name: 'Royal Indigo', value: '#1E3A8A' },
      { name: 'Sky Blue', value: '#38BDF8' },
      { name: 'Teal Gold', value: '#0D9488' }
    ],
    isPersonalizable: false,
    leadTimeDays: 7,
    materials: ['Premium MDF Board Base', 'Craft Clay (Traditional Mud Mix)', 'Acrylic Jewel Paints', 'Precision Hand-cut Glass Mirrors', 'Varnish Sealant Coat'],
    rating: 4.9,
    reviewsCount: 24,
    isReadyMade: false,
    featured: true
  },
  {
    id: 'p2',
    name: 'Symphony Mandala Wall Clock',
    description: 'Make time beautiful with this custom wall clock featuring an intricate hand-painted mandala face. Painted in luxurious deep violet, magenta, and fuchsia with white dotting accents and delicate circular mirrors that catch the light at every angle. Equipped with a silent high-quality sweeping clock movement and gold hands.',
    category: 'wall-clocks',
    price: 2450,
    images: [
      'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?q=80&w=600&auto=format&fit=crop', // Purple abstract clock-face feel
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop'
    ],
    sizes: ['12 inches', '14 inches'],
    colors: [
      { name: 'Magenta Fuchsia', value: '#D946EF' },
      { name: 'Royal Violet', value: '#7C3AED' },
      { name: 'Emerald Gold', value: '#059669' },
      { name: 'Indigo Gold', value: '#1E3A8A' }
    ],
    isPersonalizable: false,
    leadTimeDays: 10,
    materials: ['MDF Engineered Wood', 'Super-Silent Quartz Sweep Mechanism', 'Metallic Gold Hands', 'Multi-layer Fine Acrylic Dotting', 'Shimmering Mirror-Inlays'],
    rating: 4.8,
    reviewsCount: 16,
    isReadyMade: false,
    featured: true
  },
  {
    id: 'p3',
    name: 'Custom Calligraphy Name Plate with Tassels',
    description: 'A deeply personal wall hanging featuring custom Sanskrit, Hindi, or English calligraphy hand-painted by Laksha. Designed with rich saffron yellow and deep maroon red, and decorated with photo insets (optional), traditional wool tassels, and pearl bead strands that hang elegantly from the bottom. An auspicious and welcoming addition to your home threshold.',
    category: 'personalized-name-plates',
    price: 2950,
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop', // Saffron/warm decorative vibe
      'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=600&auto=format&fit=crop'
    ],
    sizes: ['14 x 6 inches (Standard)', '18 x 8 inches (Large)'],
    colors: [
      { name: 'Warm Saffron & Maroon', value: '#EA580C' },
      { name: 'Golden Mustard & Teal', value: '#CA8A04' }
    ],
    isPersonalizable: true,
    leadTimeDays: 12,
    materials: ['Sustainably Sourced Pine Ply Wood', 'Traditional Devanagari Calligraphy Inks', 'Cotton & Silk Tassel Pompoms', 'Faux Pearl Beads & Brass Rings', 'Photo Frame Protective Film'],
    rating: 5.0,
    reviewsCount: 42,
    isReadyMade: false,
    featured: true
  },
  {
    id: 'p4',
    name: 'Auspicious Shree Ganesha Lippan Panel',
    description: 'This religious wall art panel combines a majestic central Ganesha motif with a traditional Kutchi lippan background. Saturated in warm marigold red, tangerine orange, and leaf green, accented with gold line work and dozens of tiny circular and diamond mirrors. Perfect for temple rooms, festive decoration, or housewarming gifts.',
    category: 'religious-festive-art',
    price: 3200,
    images: [
      'https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?q=80&w=600&auto=format&fit=crop', // Saturated ethnic painting
      'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop'
    ],
    sizes: ['12 x 12 inches (Square)', '16 x 16 inches (Square)'],
    colors: [
      { name: 'Marigold & Saffron', value: '#DC2626' },
      { name: 'Teal Emerald Gold', value: '#0F766E' }
    ],
    isPersonalizable: false,
    leadTimeDays: 8,
    materials: ['Thick MDF Backing Plate', 'Clay Embossed Relief Ganesha Motif', 'Rich Saturated Gouache & Acrylics', 'Mirror-chips', 'Wall Hanging Hooks Mounted'],
    rating: 4.9,
    reviewsCount: 31,
    isReadyMade: false,
    featured: false
  },
  {
    id: 'p5',
    name: 'Sacred Om & Shree Lotus Medallion Set',
    description: 'A pair of elegant mini lotus-shaped medallions designed to hang together or on either side of an entrance. One features the "Om" symbol and the other features "Shree", beautifully rendered in gold leaf over a deep crimson red background with surrounding floral mirror arrangements.',
    category: 'religious-festive-art',
    price: 1250,
    images: [
      'https://images.unsplash.com/photo-1507643179773-3e9b74002f26?q=80&w=600&auto=format&fit=crop' // Red/gold warm tone
    ],
    sizes: ['6 inches (Diameter per Medallion)'],
    colors: [
      { name: 'Crimson Gold', value: '#991B1B' },
      { name: 'Emerald Gold', value: '#065F46' }
    ],
    isPersonalizable: false,
    leadTimeDays: 5,
    materials: ['Engraved Wooden Panels', 'Gold Foil Leaf accents', 'High-gloss Lacquer finish', 'Premium Tassel hanger', 'Authentic Indian Mirror-shreds'],
    rating: 4.7,
    reviewsCount: 19,
    isReadyMade: true,
    featured: false
  },
  {
    id: 'p6',
    name: 'Teal Lotus Medallion Hanging',
    description: 'A beautiful smaller accent piece that can bring charm to any corner. A hand-molded clay lotus sits in the center of a sky blue and teal mandala, adorned with delicate pearl hangings and single tassel at the bottom. Great for windows, car dashboard hangings, or gifts.',
    category: 'decor-accents',
    price: 750,
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop' // Teal accents
    ],
    sizes: ['5 inches'],
    colors: [
      { name: 'Teal & Sky Blue', value: '#0891B2' },
      { name: 'Rose & Violet', value: '#BE185D' }
    ],
    isPersonalizable: false,
    leadTimeDays: 4,
    materials: ['Craft Clay base', 'Vibrant Acrylic Colors', 'Soft Cotton Thread Tassel', 'Durable Hanging Hook'],
    rating: 4.8,
    reviewsCount: 12,
    isReadyMade: true,
    featured: false
  },
  {
    id: 'p7',
    name: 'Custom Devanagari Slogan Plaque',
    description: 'Decorate your office space or study room with a powerful Sanskrit shloka or Hindi inspirational phrase (e.g. \"योगः कर्मसु कौशलम्\" or \"वसुधैव कुटुम्बकम्\") beautifully lettered by Laksha Kandpal, surrounded by elegant gold-threaded borders, clay floral elements, and small mirrors.',
    category: 'personalized-name-plates',
    price: 2200,
    images: [
      'https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=600&auto=format&fit=crop' // Artistic graphic brush feel
    ],
    sizes: ['12 x 8 inches', '16 x 10 inches'],
    colors: [
      { name: 'Saffron & Gold', value: '#EA580C' },
      { name: 'Teal & Silver', value: '#0D9488' }
    ],
    isPersonalizable: true,
    leadTimeDays: 10,
    materials: ['MDF Engineered Wood', 'Traditional Calligraphy Nibs & Ink', 'Mud Relief Floral Borders', 'Varnish Sealant'],
    rating: 5.0,
    reviewsCount: 8,
    isReadyMade: false,
    featured: false
  }
];
