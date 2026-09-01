'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bookmark, MapPin, UserCheck, Eye, Sparkles } from 'lucide-react';
import { WisdomEntry } from '@/types';
import EvidenceBadge from './EvidenceBadge';
import { wisdomApi, authApi } from '@/lib/api';

interface WisdomCardProps {
  wisdom: WisdomEntry;
  onSavedChange?: (isSaved: boolean) => void;
}

export default function WisdomCard({ wisdom, onSavedChange }: WisdomCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [saveCount, setSaveCount] = useState(wisdom.save_count);
  const [loading, setLoading] = useState(false);

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const currentUser = authApi.getCurrentUserFromStorage();
    if (!currentUser) {
      alert('Please sign in to save wisdom items to your account!');
      return;
    }

    setLoading(true);
    try {
      if (isSaved) {
        await wisdomApi.unsaveWisdom(wisdom.id);
        setIsSaved(false);
        setSaveCount((prev) => Math.max(0, prev - 1));
        if (onSavedChange) onSavedChange(false);
      } else {
        await wisdomApi.saveWisdom(wisdom.id);
        setIsSaved(true);
        setSaveCount((prev) => prev + 1);
        if (onSavedChange) onSavedChange(true);
      }
    } catch {
      // Toggle optimistically or handle already saved
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group bg-parchment-50 rounded-2xl border border-parchment-200/80 p-5 shadow-sm hover:shadow-warm hover:border-parchment-300 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-turmeric-400 via-terracotta-500 to-emerald-700 opacity-80 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Header Tags */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-semibold tracking-wide uppercase text-terracotta-600 bg-terracotta-50 px-2.5 py-0.5 rounded-md border border-terracotta-100">
            {wisdom.category}
          </span>
          <EvidenceBadge label={wisdom.evidence_label} size="sm" />
        </div>

        {/* Title */}
        <h3 className="font-serif font-bold text-lg text-charcoal group-hover:text-terracotta-700 transition-colors leading-snug mb-2">
          <Link href={`/explore?id=${wisdom.id}`}>{wisdom.title}</Link>
        </h3>

        {/* Traditional Tip excerpt */}
        <p className="text-xs text-charcoal/80 line-clamp-3 leading-relaxed mb-4 font-sans">
          "{wisdom.tip}"
        </p>

        {/* Story quote if available */}
        {wisdom.story && (
          <div className="bg-parchment-100/70 border-l-2 border-turmeric-500 p-2.5 rounded-r-lg mb-4 text-[11px] italic text-charcoal/70">
            <span className="font-semibold not-italic text-charcoal">Story:</span> "{wisdom.story}"
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-parchment-200/60 flex items-center justify-between text-xs text-charcoal/60">
        <div className="flex items-center gap-3">
          {wisdom.region && (
            <span className="flex items-center gap-1 text-[11px]">
              <MapPin className="w-3 h-3 text-terracotta-500" />
              {wisdom.region}
            </span>
          )}
          {wisdom.who_taught && (
            <span className="flex items-center gap-1 text-[11px] text-charcoal/70">
              <UserCheck className="w-3 h-3 text-emerald-700" />
              {wisdom.who_taught}
            </span>
          )}
        </div>

        <button
          onClick={handleSaveToggle}
          disabled={loading}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
            isSaved
              ? 'bg-turmeric-400/20 text-terracotta-700'
              : 'hover:bg-parchment-200 text-charcoal/60 hover:text-terracotta-600'
          }`}
          title="Save to your collection"
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-terracotta-600 text-terracotta-600' : ''}`} />
          <span>{saveCount}</span>
        </button>
      </div>
    </div>
  );
}
