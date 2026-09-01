'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, Sparkles, BookOpen, MapPin, X } from 'lucide-react';
import WisdomCard from '@/components/WisdomCard';
import EvidenceBadge from '@/components/EvidenceBadge';
import { wisdomApi } from '@/lib/api';
import { WisdomEntry, EvidenceLabel } from '@/types';

const CATEGORIES = [
  'All',
  'Health & Traditional Remedies',
  'Kitchen Wisdom',
  'Cleaning',
  'Clothing & Fabric',
  'Beauty & Self-Care',
  'Gardening',
  'Household',
  'Food & Preservation',
];

const EVIDENCE_OPTIONS: { label: string; value: EvidenceLabel | 'all' }[] = [
  { label: 'All Evidence Levels', value: 'all' },
  { label: '🟢 Well Supported', value: 'well_supported' },
  { label: '🟡 Some Evidence', value: 'some_evidence' },
  { label: '🟠 Traditional Practice', value: 'limited_evidence' },
  { label: '🔴 Caution Advised', value: 'potentially_unsafe' },
];

function ExplorePageInner() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get('category');
  const idParam = searchParams.get('id');

  const [selectedCategory, setSelectedCategory] = useState<string>(catParam || 'All');
  const [selectedEvidence, setSelectedEvidence] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [wisdomList, setWisdomList] = useState<WisdomEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState<WisdomEntry | null>(null);

  useEffect(() => {
    fetchWisdom();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedEvidence, page]);

  useEffect(() => {
    if (idParam) {
      wisdomApi.getById(parseInt(idParam)).then(setSelectedEntry).catch(console.error);
    }
  }, [idParam]);

  const fetchWisdom = async () => {
    setLoading(true);
    try {
      const res = await wisdomApi.list({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        evidence_label: selectedEvidence === 'all' ? undefined : selectedEvidence,
        search: searchQuery.trim() || undefined,
        page,
        per_page: 12,
      });
      setWisdomList(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Error fetching wisdom:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchWisdom();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-terracotta-600 text-xs font-semibold uppercase tracking-wider mb-1">
          <BookOpen className="w-4 h-4" />
          <span>Knowledge Base</span>
        </div>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-charcoal">
          Explore Traditional Household Wisdom
        </h1>
        <p className="text-sm text-charcoal/70 mt-1 max-w-2xl">
          Search and filter hundreds of verified household practices, home remedies, kitchen hacks, and family traditions.
        </p>
      </div>

      {/* Search Bar & Filters */}
      <div className="bg-parchment-100/70 border border-parchment-200 rounded-2xl p-4 sm:p-6 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-charcoal/40 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword, ingredient, or symptom (e.g. turmeric, turmeric milk, bloating, stains)..."
              className="w-full bg-white border border-parchment-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-terracotta-500 font-sans"
            />
          </div>
          <button
            type="submit"
            className="bg-terracotta-600 hover:bg-terracotta-700 text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>Search</span>
            <Sparkles className="w-4 h-4" />
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-parchment-200/60">
          {/* Category Horizontal Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none max-w-full">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-terracotta-600 text-white shadow-xs'
                    : 'bg-white text-charcoal/80 hover:bg-parchment-200 border border-parchment-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Evidence level dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-3.5 h-3.5 text-charcoal/50" />
            <select
              value={selectedEvidence}
              onChange={(e) => {
                setSelectedEvidence(e.target.value);
                setPage(1);
              }}
              className="bg-white border border-parchment-300 rounded-lg px-2.5 py-1 text-xs font-medium text-charcoal focus:outline-none cursor-pointer"
            >
              {EVIDENCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-charcoal/60">
        <span>
          Showing <strong>{wisdomList.length}</strong> of <strong>{total}</strong> traditional practices
        </span>
        {selectedCategory !== 'All' && (
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedEvidence('all');
              setSearchQuery('');
            }}
            className="text-terracotta-600 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-parchment-100 rounded-2xl p-6 h-48 animate-pulse" />
          ))}
        </div>
      ) : wisdomList.length === 0 ? (
        <div className="text-center py-16 bg-parchment-50 border border-dashed border-parchment-300 rounded-3xl space-y-3">
          <span className="text-4xl">🌿</span>
          <h3 className="font-serif font-bold text-xl text-charcoal">No wisdom entries found</h3>
          <p className="text-xs text-charcoal/60 max-w-md mx-auto">
            Try adjusting your search terms or category filter. Or contribute your family&apos;s wisdom!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wisdomList.map((item) => (
            <WisdomCard key={item.id} wisdom={item} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 12 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 rounded-lg bg-white border border-parchment-300 text-xs font-medium disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-xs text-charcoal/70 px-2">Page {page}</span>
          <button
            disabled={page * 12 >= total}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 rounded-lg bg-white border border-parchment-300 text-xs font-medium disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal for detailed entry view */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-parchment-50 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-parchment-300 relative space-y-6">
            <button
              onClick={() => setSelectedEntry(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-parchment-200 text-charcoal/60"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase text-terracotta-600 bg-terracotta-50 px-2.5 py-0.5 rounded-md border border-terracotta-100">
                  {selectedEntry.category}
                </span>
                <EvidenceBadge label={selectedEntry.evidence_label} size="sm" />
              </div>
              <h2 className="font-serif font-bold text-2xl text-charcoal">
                {selectedEntry.title}
              </h2>
              {selectedEntry.region && (
                <p className="text-xs text-charcoal/60 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-terracotta-500" />
                  Region: {selectedEntry.region} ({selectedEntry.culture || 'Indian Traditional'})
                </p>
              )}
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-charcoal/90 leading-relaxed font-sans">
              <div>
                <h4 className="font-serif font-bold text-charcoal text-base mb-1">Traditional Practice</h4>
                <p className="bg-white p-4 rounded-xl border border-parchment-200">
                  {selectedEntry.tip}
                </p>
              </div>

              {selectedEntry.story && (
                <div>
                  <h4 className="font-serif font-bold text-charcoal text-base mb-1">Family Story</h4>
                  <p className="bg-parchment-100/80 italic p-4 rounded-xl border-l-4 border-turmeric-500">
                    &quot;{selectedEntry.story}&quot;
                  </p>
                </div>
              )}

              {selectedEntry.ingredients && (
                <div>
                  <h4 className="font-serif font-bold text-charcoal text-base mb-1">Ingredients / Materials</h4>
                  <p className="bg-white p-3 rounded-xl border border-parchment-200">
                    {selectedEntry.ingredients}
                  </p>
                </div>
              )}

              {selectedEntry.steps && (
                <div>
                  <h4 className="font-serif font-bold text-charcoal text-base mb-1">Steps</h4>
                  <p className="bg-white p-3 rounded-xl border border-parchment-200 whitespace-pre-wrap">
                    {selectedEntry.steps}
                  </p>
                </div>
              )}

              {selectedEntry.ai_summary && (
                <div>
                  <h4 className="font-serif font-bold text-charcoal text-base mb-1">🔬 Scientific Assessment</h4>
                  <p className="bg-emerald-50 text-emerald-900 p-4 rounded-xl border border-emerald-200">
                    {selectedEntry.ai_summary}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse text-charcoal/50">Loading wisdom archive...</div>
      </div>
    }>
      <ExplorePageInner />
    </Suspense>
  );
}
