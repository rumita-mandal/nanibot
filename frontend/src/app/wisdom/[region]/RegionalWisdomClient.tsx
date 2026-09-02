'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, ArrowLeft } from 'lucide-react';
import WisdomCard from '@/components/WisdomCard';
import { wisdomApi } from '@/lib/api';
import { WisdomEntry } from '@/types';

const REGION_DESCRIPTIONS: Record<string, string> = {
  'West Bengal': 'Home to Panta Bhat (overnight fermented rice), neem water skin cleansers, and rice water hair tonics.',
  'Bengal': 'Home to Panta Bhat (overnight fermented rice), neem water skin cleansers, and rice water hair tonics.',
  'Punjab & North': 'Known for warm mustard oil winter massages, ajwain digestive water, and energy-dense til ladoos.',
  'Punjab': 'Known for warm mustard oil winter massages, ajwain digestive water, and energy-dense til ladoos.',
  'Kerala & South': 'Famous for virgin coconut oil hair rituals, Ayurvedic spice tea, and jackfruit preservation.',
  'Kerala': 'Famous for virgin coconut oil hair rituals, Ayurvedic spice tea, and jackfruit preservation.',
  'Goa & Konkan': 'Renowned for cooling Kokum sherbet, tamarind copper polishes, and coastal fermentation.',
  'Goa': 'Renowned for cooling Kokum sherbet, tamarind copper polishes, and coastal fermentation.',
  'Rajasthan': 'Known for natural Henna hair conditioning, dry spice preservation, and aloe vera burn relief.',
};

export default function RegionalWisdomClient() {
  const params = useParams();
  const rawRegion = (params?.region as string) || 'Bengal';
  const regionName = decodeURIComponent(rawRegion);

  const [wisdomList, setWisdomList] = useState<WisdomEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRegionalData() {
      setLoading(true);
      try {
        const res = await wisdomApi.list({ region: regionName, per_page: 20 });
        setWisdomList(res.items || []);
      } catch (err) {
        console.error('Error loading regional wisdom:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRegionalData();
  }, [regionName]);

  const description = REGION_DESCRIPTIONS[regionName] || 'Traditional household practices and cultural heritage specific to this region of India.';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal/70 hover:text-terracotta-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      {/* Region Header Banner */}
      <div className="bg-gradient-to-r from-parchment-200 via-parchment-100 to-terracotta-50 rounded-3xl p-8 sm:p-10 border border-parchment-300 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-terracotta-600 text-xs font-semibold uppercase tracking-wider">
          <MapPin className="w-4 h-4" />
          <span>Regional Wisdom Archive</span>
        </div>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-charcoal">
          Household Wisdom of {regionName}
        </h1>
        <p className="text-sm text-charcoal/80 max-w-2xl font-sans leading-relaxed">
          {description}
        </p>
      </div>

      {/* Wisdom List */}
      <div>
        <h2 className="font-serif font-bold text-xl text-charcoal mb-4">
          Archived Practices from {regionName} ({wisdomList.length})
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-parchment-100 rounded-2xl p-6 h-48 animate-pulse" />
            ))}
          </div>
        ) : wisdomList.length === 0 ? (
          <div className="text-center py-16 bg-parchment-50 border border-dashed border-parchment-300 rounded-3xl space-y-3">
            <span className="text-3xl">🌿</span>
            <h3 className="font-serif font-bold text-xl text-charcoal">No regional entries yet</h3>
            <p className="text-xs text-charcoal/60 max-w-md mx-auto">
              Be the first to submit traditional wisdom from {regionName}!
            </p>
            <Link
              href="/contribute"
              className="inline-block bg-terracotta-600 text-white text-xs font-semibold px-4 py-2 rounded-xl"
            >
              Add {regionName} Wisdom
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wisdomList.map((item) => (
              <WisdomCard key={item.id} wisdom={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
