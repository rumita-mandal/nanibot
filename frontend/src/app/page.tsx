'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, BookOpen, PlusCircle, ShieldCheck, Heart, Search, MapPin } from 'lucide-react';
import CategoryCard from '@/components/CategoryCard';
import WisdomCard from '@/components/WisdomCard';
import { wisdomApi } from '@/lib/api';
import { WisdomEntry, CategoryInfo } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [featuredWisdom, setFeaturedWisdom] = useState<WisdomEntry[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [wisdomRes, catRes] = await Promise.all([
          wisdomApi.list({ per_page: 6 }),
          wisdomApi.getCategories(),
        ]);
        setFeaturedWisdom(wisdomRes.items || []);
        setCategories(catRes || []);
      } catch (err) {
        console.error('Error loading landing page data:', err);
      }
    }
    loadData();
  }, []);

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/chat?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const samplePrompts = [
    "How did Nani handle stomach discomfort?",
    "Traditional tips for period cramps",
    "How do I remove turmeric stains?",
    "Traditional kitchen hacks",
    "How did grandmother preserve food?",
    "Natural remedies for winter cold",
  ];

  const regions = [
    { name: 'West Bengal', desc: 'Panta Bhat, rice water toner, and neem washes' },
    { name: 'Punjab & North', desc: 'Warm mustard oil massage, ajwain water, and til ladoos' },
    { name: 'Kerala & South', desc: 'Virgin coconut oiling, tamarind metal shine, and curry leaf hair tonic' },
    { name: 'Goa & Konkan', desc: 'Cooling Kokum sherbet for summer heat relief' },
    { name: 'Rajasthan', desc: 'Natural Henna conditioning and dry spice preservation' },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-parchment-100 via-parchment-50 to-parchment-50 pt-16 pb-24 border-b border-parchment-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-terracotta-50 border border-terracotta-200 text-terracotta-700 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
            <span>🌿</span>
            <span>Digital Archive of Intergenerational Household Knowledge</span>
          </div>

          {/* Main Title */}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-charcoal tracking-tight leading-tight mb-6">
            "The wisdom that was <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-terracotta-600 via-turmeric-500 to-terracotta-700 italic">
              never written down."
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-charcoal/80 max-w-2xl mx-auto font-sans leading-relaxed mb-10">
            Discover, preserve, and explore generations of everyday household wisdom, remedies, kitchen hacks, and home practices passed from mothers and grandmothers.
          </p>

          {/* Chatbot Search Box */}
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-3 shadow-warm border border-parchment-300">
            <form onSubmit={handlePromptSubmit} className="flex items-center gap-2">
              <Search className="w-5 h-5 text-terracotta-500 ml-2 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask Nani anything... (e.g., How did Nani handle stomach discomfort?)"
                className="w-full bg-transparent px-2 py-2 text-sm text-charcoal focus:outline-none placeholder:text-charcoal/40 font-sans"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-turmeric-500 to-terracotta-500 text-white font-medium text-sm px-5 py-2.5 rounded-xl hover:opacity-95 transition-all shrink-0 flex items-center gap-1.5 shadow-sm"
              >
                <span>Ask Nani</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </form>

            {/* Example Prompt Chips */}
            <div className="mt-4 pt-3 border-t border-parchment-100 flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] font-semibold uppercase text-charcoal/50 mr-1">
                Try asking:
              </span>
              {samplePrompts.slice(0, 4).map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => router.push(`/chat?q=${encodeURIComponent(prompt)}`)}
                  className="text-xs bg-parchment-100 hover:bg-terracotta-50 text-charcoal/80 hover:text-terracotta-700 px-3 py-1 rounded-full border border-parchment-200 transition-colors"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Wisdom Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal">
              Timeless Household Wisdom
            </h2>
            <p className="text-sm text-charcoal/70 mt-1">
              Curated practical tips passed through generations, categorized and evidence-labeled.
            </p>
          </div>
          <Link
            href="/explore"
            className="flex items-center gap-1 text-sm font-semibold text-terracotta-600 hover:text-terracotta-700 transition-colors"
          >
            Explore All ({featuredWisdom.length}+)
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredWisdom.slice(0, 6).map((item) => (
            <WisdomCard key={item.id} wisdom={item} />
          ))}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal">
            Browse by Knowledge Domain
          </h2>
          <p className="text-sm text-charcoal/70 mt-1">
            8 searchable categories covering health, cooking, cleaning, fabric care, and gardening.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat) => (
            <CategoryCard key={cat.category} category={cat.category} count={cat.count} />
          ))}
        </div>
      </section>

      {/* Wisdom From Around India — Regional Section */}
      <section className="bg-parchment-100/70 border-y border-parchment-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase text-terracotta-600 tracking-wider">
              Cultural Heritage
            </span>
            <h2 className="font-serif font-bold text-3xl text-charcoal mt-1">
              Wisdom From Around India
            </h2>
            <p className="text-sm text-charcoal/70 mt-2">
              Every region has its unique climate-tested home practices, food preservation techniques, and self-care traditions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {regions.map((reg) => (
              <Link
                key={reg.name}
                href={`/wisdom/${encodeURIComponent(reg.name)}`}
                className="bg-parchment-50 p-5 rounded-2xl border border-parchment-200 hover:border-turmeric-400 hover:shadow-warm transition-all group"
              >
                <div className="flex items-center gap-1.5 text-terracotta-600 text-xs font-semibold mb-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Region</span>
                </div>
                <h3 className="font-serif font-bold text-lg text-charcoal group-hover:text-terracotta-600 transition-colors mb-1">
                  {reg.name}
                </h3>
                <p className="text-xs text-charcoal/70 leading-relaxed">
                  {reg.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Product Principle Callout */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-parchment-900 to-emerald-900 text-parchment-50 rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-semibold mb-4 border border-emerald-700">
              <ShieldCheck className="w-4 h-4" />
              <span>Evidence-Aware Responsible AI</span>
            </div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-parchment-50 mb-4">
              Preserving Culture with Medical Transparency
            </h2>
            <p className="text-sm text-parchment-200 leading-relaxed mb-6">
              NaniBot is **not an AI doctor**. It is a digital archive that preserves traditional practices while clearly labeling scientific evidence status — from well-supported remedies (like warm compresses for cramps) to practices requiring caution.
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-medium text-parchment-300">
              <span className="flex items-center gap-1">🟢 Well Supported</span>
              <span className="flex items-center gap-1">🟡 Some Evidence</span>
              <span className="flex items-center gap-1">🟠 Traditional Practice</span>
              <span className="flex items-center gap-1">🔴 Caution Advised</span>
            </div>
          </div>
        </div>
      </section>

      {/* Community Contribution CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-parchment-50 border-2 border-dashed border-terracotta-200 rounded-3xl p-8 sm:p-12">
          <Heart className="w-10 h-10 text-terracotta-500 mx-auto mb-4" />
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal mb-2">
            Share Your Family's Wisdom
          </h2>
          <p className="text-sm text-charcoal/70 max-w-xl mx-auto mb-6">
            Did your mother or grandmother pass down a unique kitchen hack, stain removal trick, or traditional practice? Add it to the archive so it is never forgotten.
          </p>
          <Link
            href="/contribute"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-turmeric-500 to-terracotta-500 text-white font-medium text-sm px-6 py-3 rounded-xl hover:opacity-95 shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Add Nani's Wisdom
          </Link>
        </div>
      </section>
    </div>
  );
}
