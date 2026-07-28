import { ColorVariant } from '../types';

/**
 * Curated preset list of handcrafted artisan colorways with matching hex codes and high-res craft images.
 */
export const ARTISAN_PRESET_COLORWAYS: ColorVariant[] = [
  {
    name: 'Royal Indigo & Shimmering Gold',
    value: '#1E3A8A',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=85&w=800&auto=format&fit=crop'
  },
  {
    name: 'Terracotta Clay & Sacred Saffron',
    value: '#C2410C',
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=85&w=800&auto=format&fit=crop'
  },
  {
    name: 'Turquoise Peacock & Emerald',
    value: '#0D9488',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=85&w=800&auto=format&fit=crop'
  },
  {
    name: 'Sacred Crimson & Vermillion',
    value: '#991B1B',
    image: 'https://images.unsplash.com/photo-1609137144813-2d2bc00938b8?q=85&w=800&auto=format&fit=crop'
  },
  {
    name: 'Peacock Sapphire & Silver',
    value: '#0369A1',
    image: 'https://images.unsplash.com/photo-1507643179773-3e9b74002f26?q=85&w=800&auto=format&fit=crop'
  }
];

/**
 * Auto-generates colorways for a craft product based on its category or name.
 */
export function generateAutoColorways(categoryName?: string): ColorVariant[] {
  if (categoryName?.includes('clock')) {
    return [
      { name: 'Magenta Fuchsia & Gold', value: '#C026D3', image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?q=85&w=800&auto=format&fit=crop' },
      { name: 'Royal Violet & Pearl White', value: '#6D28D9', image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=85&w=800&auto=format&fit=crop' },
      { name: 'Emerald Green & Brass', value: '#047857', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=85&w=800&auto=format&fit=crop' },
      { name: 'Sunset Amber & Gold', value: '#B45309', image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=85&w=800&auto=format&fit=crop' },
      { name: 'Deep Midnight Navy', value: '#0F172A', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=85&w=800&auto=format&fit=crop' }
    ];
  }

  if (categoryName?.includes('name') || categoryName?.includes('personalized')) {
    return [
      { name: 'Warm Saffron & Crimson', value: '#D97706', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=85&w=800&auto=format&fit=crop' },
      { name: 'Golden Ochre & Royal Teal', value: '#CA8A04', image: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=85&w=800&auto=format&fit=crop' },
      { name: 'Traditional Clay & Vermillion', value: '#B45309', image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=85&w=800&auto=format&fit=crop' },
      { name: 'Peacock Emerald & Gold', value: '#0F766E', image: 'https://images.unsplash.com/photo-1609137144813-2d2bc00938b8?q=85&w=800&auto=format&fit=crop' }
    ];
  }

  return ARTISAN_PRESET_COLORWAYS;
}

/**
 * Calculates a CSS hue-rotate / saturate filter string based on a color hex
 * so if a product color does not have a unique image uploaded, it naturally transforms the base artwork image.
 */
export function getHueRotateFilterForColor(colorValue: string): string {
  if (!colorValue || !colorValue.startsWith('#')) return 'none';
  
  // Convert Hex to RGB
  const hex = colorValue.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;

  // Convert RGB to HSL hue angle (0 to 360)
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;

  if (max !== min) {
    const d = max - min;
    if (max === rNorm) {
      h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / d + 2;
    } else {
      h = (rNorm - gNorm) / d + 4;
    }
    h /= 6;
  }

  const hueDegrees = Math.round(h * 360);
  return `hue-rotate(${hueDegrees}deg) saturate(1.2)`;
}
