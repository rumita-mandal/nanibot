import Link from 'next/link';
import { 
  HeartPulse, 
  Utensils, 
  Sparkles, 
  Shirt, 
  Smile, 
  Sprout, 
  Home, 
  PackageCheck 
} from 'lucide-react';

interface CategoryCardProps {
  category: string;
  count?: number;
}

const CATEGORY_ICONS: Record<string, { icon: any; color: string; bg: string; description: string }> = {
  'Health & Traditional Remedies': {
    icon: HeartPulse,
    color: 'text-terracotta-600',
    bg: 'bg-terracotta-50',
    description: 'Cold, digestive relief, soreness & home comfort practices',
  },
  'Kitchen Wisdom': {
    icon: Utensils,
    color: 'text-turmeric-600',
    bg: 'bg-amber-50',
    description: 'Food preservation, cooking hacks, spice storage & zero waste',
  },
  'Cleaning': {
    icon: Sparkles,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    description: 'Stain removal, kitchen cleaning, odor control & natural care',
  },
  'Clothing & Fabric': {
    icon: Shirt,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    description: 'Traditional fabric care, moth prevention, ironing & washing',
  },
  'Beauty & Self-Care': {
    icon: Smile,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    description: 'Natural hair oiling, skincare packs, ubtan & bathing rituals',
  },
  'Gardening': {
    icon: Sprout,
    color: 'text-green-700',
    bg: 'bg-green-50',
    description: 'Plant care, kitchen composting, eggshell calcium & organic soil',
  },
  'Household': {
    icon: Home,
    color: 'text-amber-700',
    bg: 'bg-orange-50',
    description: 'Organization, pest prevention, storage tricks & repairs',
  },
  'Food & Preservation': {
    icon: PackageCheck,
    color: 'text-teal-700',
    bg: 'bg-teal-50',
    description: 'Sun-dried pickles, fermentation, drying & traditional storage',
  },
};

export default function CategoryCard({ category, count }: CategoryCardProps) {
  const config = CATEGORY_ICONS[category] || {
    icon: Sparkles,
    color: 'text-terracotta-600',
    bg: 'bg-parchment-100',
    description: 'Traditional household tips and generational knowledge',
  };

  const Icon = config.icon;

  return (
    <Link
      href={`/explore?category=${encodeURIComponent(category)}`}
      className="group bg-parchment-50 rounded-2xl border border-parchment-200 p-5 shadow-sm hover:shadow-warm hover:border-turmeric-400 transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className={`w-11 h-11 rounded-xl ${config.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <Icon className={`w-6 h-6 ${config.color}`} />
          </div>
          {count !== undefined && (
            <span className="text-xs font-semibold text-charcoal/60 bg-parchment-200/80 px-2.5 py-1 rounded-full">
              {count} {count === 1 ? 'tip' : 'tips'}
            </span>
          )}
        </div>
        <h4 className="font-serif font-bold text-base text-charcoal group-hover:text-terracotta-600 transition-colors mb-1">
          {category}
        </h4>
        <p className="text-xs text-charcoal/70 line-clamp-2 leading-relaxed">
          {config.description}
        </p>
      </div>
    </Link>
  );
}
