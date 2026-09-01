'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Sparkles, Heart, CheckCircle2, Image as ImageIcon, Info } from 'lucide-react';
import { contributeApi } from '@/lib/api';
import EvidenceBadge from '@/components/EvidenceBadge';
import { WisdomEntry } from '@/types';

const CATEGORIES = [
  'Health & Traditional Remedies',
  'Kitchen Wisdom',
  'Cleaning',
  'Clothing & Fabric',
  'Beauty & Self-Care',
  'Gardening',
  'Household',
  'Food & Preservation',
];

export default function ContributePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submittedEntry, setSubmittedEntry] = useState<WisdomEntry | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Health & Traditional Remedies',
    subcategory: '',
    tip: '',
    story: '',
    who_taught: '',
    region: '',
    culture: '',
    ingredients: '',
    steps: '',
    when_used: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.tip.trim()) {
      alert('Please provide a Title and Traditional Tip!');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });
      if (imageFile) {
        data.append('image', imageFile);
      }

      const res = await contributeApi.submit(data);
      setSubmittedEntry(res);
    } catch (err) {
      console.error('Submission error:', err);
      alert('Failed to submit wisdom. Please try again!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta-50 text-terracotta-700 text-xs font-semibold uppercase tracking-wider">
          <Heart className="w-3.5 h-3.5" />
          <span>Intergenerational Archive</span>
        </div>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-charcoal">
          Add Nani's Wisdom
        </h1>
        <p className="text-sm text-charcoal/70">
          Preserve your family's traditional remedies, kitchen secrets, and household practices so future generations can discover them.
        </p>
      </div>

      {submittedEntry ? (
        /* Success & AI Classification Result Card */
        <div className="bg-parchment-50 border-2 border-emerald-300 rounded-3xl p-8 space-y-6 shadow-warm text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif font-bold text-2xl text-charcoal">
              Wisdom Submitted Successfully!
            </h2>
            <p className="text-xs text-charcoal/70 max-w-md mx-auto">
              Your submission has been received and automatically classified by NaniBot AI. It is currently under review by community moderators.
            </p>
          </div>

          {/* AI Classification Card */}
          <div className="bg-white p-6 rounded-2xl border border-parchment-200 text-left max-w-xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-terracotta-600">
                AI Classification Status
              </span>
              <EvidenceBadge label={submittedEntry.evidence_label} size="md" />
            </div>
            <h3 className="font-serif font-bold text-lg text-charcoal">
              {submittedEntry.title}
            </h3>
            <p className="text-xs text-charcoal/80">
              "{submittedEntry.tip}"
            </p>
            <div className="text-[11px] text-charcoal/60 pt-2 border-t border-parchment-100 flex justify-between">
              <span>Category: {submittedEntry.category}</span>
              <span>Risk Classification: {submittedEntry.risk_level}</span>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={() => {
                setSubmittedEntry(null);
                setFormData({
                  title: '',
                  category: 'Health & Traditional Remedies',
                  subcategory: '',
                  tip: '',
                  story: '',
                  who_taught: '',
                  region: '',
                  culture: '',
                  ingredients: '',
                  steps: '',
                  when_used: '',
                });
              }}
              className="bg-terracotta-600 hover:bg-terracotta-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all"
            >
              Add Another Wisdom
            </button>
            <button
              onClick={() => router.push('/explore')}
              className="bg-parchment-200 hover:bg-parchment-300 text-charcoal text-xs font-semibold px-5 py-2.5 rounded-xl transition-all"
            >
              Explore Knowledge Base
            </button>
          </div>
        </div>
      ) : (
        /* Submission Form */
        <form onSubmit={handleSubmit} className="bg-parchment-50 border border-parchment-200/90 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Title */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider">
                Title of Wisdom *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Nani's Turmeric Milk, Maa's Stain Remover, Ajwain Water"
                className="w-full bg-white border border-parchment-300 rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-terracotta-500 font-sans"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-white border border-parchment-300 rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-terracotta-500 font-sans cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Who taught you this */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider">
                Who taught you this?
              </label>
              <input
                type="text"
                name="who_taught"
                value={formData.who_taught}
                onChange={handleChange}
                placeholder="e.g. Maternal Grandmother, Mother, Paternal Aunt"
                className="w-full bg-white border border-parchment-300 rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-terracotta-500 font-sans"
              />
            </div>

            {/* Region / Culture */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider">
                Region / Culture
              </label>
              <input
                type="text"
                name="region"
                value={formData.region}
                onChange={handleChange}
                placeholder="e.g. West Bengal, Punjab, Tamil Nadu, Konkan"
                className="w-full bg-white border border-parchment-300 rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-terracotta-500 font-sans"
              />
            </div>

            {/* When it is traditionally used */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider">
                When is it traditionally used?
              </label>
              <input
                type="text"
                name="when_used"
                value={formData.when_used}
                onChange={handleChange}
                placeholder="e.g. Winter evenings, onset of cold, after heavy meals"
                className="w-full bg-white border border-parchment-300 rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-terracotta-500 font-sans"
              />
            </div>

            {/* Traditional Tip */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider">
                Traditional Tip / Practice *
              </label>
              <textarea
                name="tip"
                required
                rows={3}
                value={formData.tip}
                onChange={handleChange}
                placeholder="Describe what the traditional practice is and how it is used..."
                className="w-full bg-white border border-parchment-300 rounded-xl p-4 text-sm text-charcoal focus:outline-none focus:border-terracotta-500 font-sans"
              />
            </div>

            {/* Personal Family Story */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider">
                Personal Story / Memory
              </label>
              <textarea
                name="story"
                rows={2}
                value={formData.story}
                onChange={handleChange}
                placeholder="Share a childhood memory or story of your mother/grandmother preparing this..."
                className="w-full bg-white border border-parchment-300 rounded-xl p-4 text-sm text-charcoal focus:outline-none focus:border-terracotta-500 font-sans"
              />
            </div>

            {/* Ingredients & Steps */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider">
                Ingredients / Materials
              </label>
              <input
                type="text"
                name="ingredients"
                value={formData.ingredients}
                onChange={handleChange}
                placeholder="e.g. 1 tsp turmeric, warm milk, black pepper, honey"
                className="w-full bg-white border border-parchment-300 rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-terracotta-500 font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider">
                Preparation Steps
              </label>
              <input
                type="text"
                name="steps"
                value={formData.steps}
                onChange={handleChange}
                placeholder="e.g. Boil milk, stir in turmeric, cool slightly, add honey"
                className="w-full bg-white border border-parchment-300 rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-terracotta-500 font-sans"
              />
            </div>

            {/* Optional Image */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider">
                Optional Photo
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="text-xs text-charcoal/70 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-parchment-200 file:text-charcoal hover:file:bg-parchment-300 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Product Principle Disclaimer Note */}
          <div className="bg-parchment-100 border border-parchment-300 rounded-xl p-3.5 text-xs text-charcoal/70 flex items-start gap-2">
            <Info className="w-4 h-4 text-terracotta-600 shrink-0 mt-0.5" />
            <div>
              <strong>Cultural Preservation Notice:</strong> Submissions preserve your family story as cultural knowledge. NaniBot's AI safety layer will evaluate scientific evidence status before indexing into the public chatbot archive.
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-turmeric-500 via-terracotta-500 to-terracotta-600 text-white font-semibold text-sm py-3.5 rounded-xl hover:opacity-95 disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Submitting and AI Classifying...</span>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Submit to Wisdom Archive</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
