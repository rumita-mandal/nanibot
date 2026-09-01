'use client';

import { useState, useEffect, useRef } from 'react';
import { Archive, Plus, Trash2, Mic, MicOff, Volume2, Image as ImageIcon, Heart, Music } from 'lucide-react';
import { archiveApi, authApi } from '@/lib/api';
import { FamilyArchiveItem, User } from '@/types';

export default function ArchivePage() {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<FamilyArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    tip: '',
    story: '',
    person_name: '',
    relationship: 'Grandmother',
    year_era: '',
    region: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const currentUser = authApi.getCurrentUserFromStorage();
    setUser(currentUser);
    if (currentUser) {
      loadArchive();
    } else {
      setLoading(false);
    }
  }, []);

  const loadArchive = async () => {
    setLoading(true);
    try {
      const data = await archiveApi.getArchive();
      setItems(data || []);
    } catch (err) {
      console.error('Error loading family archive:', err);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert('Could not access microphone for audio recording!');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.tip.trim()) {
      alert('Please enter a title and tip!');
      return;
    }

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (v) data.append(k, v);
      });

      if (imageFile) data.append('image', imageFile);
      if (audioBlob) {
        data.append('audio', audioBlob, 'nani_voice.webm');
      }

      await archiveApi.create(data);
      setShowAddForm(false);
      setAudioBlob(null);
      setImageFile(null);
      setFormData({
        title: '',
        tip: '',
        story: '',
        person_name: '',
        relationship: 'Grandmother',
        year_era: '',
        region: '',
      });
      loadArchive();
    } catch (err) {
      console.error('Error creating archive item:', err);
      alert('Failed to save to family notebook!');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this memory from your notebook?')) return;
    try {
      await archiveApi.deleteItem(id);
      loadArchive();
    } catch (err) {
      console.error('Error deleting archive item:', err);
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <Archive className="w-12 h-12 text-terracotta-500 mx-auto" />
        <h2 className="font-serif font-bold text-2xl text-charcoal">My Nani's Notebook</h2>
        <p className="text-xs text-charcoal/70">
          Create a private family archive for your grandmother's recipes, mother's cleaning tricks, audio recordings, and childhood memories.
        </p>
        <a
          href="/login"
          className="inline-block bg-terracotta-600 hover:bg-terracotta-700 text-white text-xs font-semibold px-6 py-3 rounded-xl transition-all shadow-sm"
        >
          Sign In to Access Your Notebook
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-parchment-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-terracotta-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <Archive className="w-4 h-4" />
            <span>Private Family Collection</span>
          </div>
          <h1 className="font-serif font-bold text-3xl text-charcoal">
            My Nani's Notebook
          </h1>
          <p className="text-xs text-charcoal/70 mt-1">
            Your personal digital album for family recipes, voice recordings, and intergenerational memories.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-turmeric-500 to-terracotta-500 text-white font-medium text-xs px-5 py-2.5 rounded-xl hover:opacity-95 transition-all shadow-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Memory to Notebook</span>
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-parchment-100 border border-parchment-300 rounded-3xl p-6 sm:p-8 shadow-warm space-y-5">
          <h3 className="font-serif font-bold text-lg text-charcoal">
            New Memory Entry
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold uppercase text-charcoal">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Dadi's Special Mango Pickle, Mother's Silk Sarees Storage"
                className="w-full bg-white border border-parchment-300 rounded-xl px-3.5 py-2 text-xs text-charcoal focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-charcoal">Person's Name</label>
              <input
                type="text"
                value={formData.person_name}
                onChange={(e) => setFormData({ ...formData, person_name: e.target.value })}
                placeholder="e.g. Kamala Devi, Nani"
                className="w-full bg-white border border-parchment-300 rounded-xl px-3.5 py-2 text-xs text-charcoal focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-charcoal">Relationship</label>
              <select
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="w-full bg-white border border-parchment-300 rounded-xl px-3.5 py-2 text-xs text-charcoal focus:outline-none cursor-pointer"
              >
                <option value="Grandmother">Grandmother</option>
                <option value="Mother">Mother</option>
                <option value="Aunt">Aunt</option>
                <option value="Great Grandmother">Great Grandmother</option>
                <option value="Other Family Member">Other</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold uppercase text-charcoal">The Tip / Recipe / Practice *</label>
              <textarea
                required
                rows={3}
                value={formData.tip}
                onChange={(e) => setFormData({ ...formData, tip: e.target.value })}
                placeholder="Describe the practice or secret..."
                className="w-full bg-white border border-parchment-300 rounded-xl p-3 text-xs text-charcoal focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold uppercase text-charcoal">Childhood Story / Context</label>
              <textarea
                rows={2}
                value={formData.story}
                onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                placeholder="Where or when did she do this? What memory comes to mind?"
                className="w-full bg-white border border-parchment-300 rounded-xl p-3 text-xs text-charcoal focus:outline-none"
              />
            </div>

            {/* Audio Recording Feature */}
            <div className="sm:col-span-2 bg-white p-4 rounded-xl border border-parchment-300 space-y-2">
              <label className="text-xs font-bold uppercase text-charcoal flex items-center gap-1.5">
                <Music className="w-4 h-4 text-terracotta-600" />
                Record Grandmother's Voice Explanation
              </label>

              <div className="flex items-center gap-4 pt-1">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    Start Voice Recording
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="bg-rose-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold animate-pulse flex items-center gap-1.5"
                  >
                    <MicOff className="w-3.5 h-3.5" />
                    Stop Recording
                  </button>
                )}

                {audioBlob && (
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    ✓ Audio Recorded! ({Math.round(audioBlob.size / 1024)} KB)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal/70 hover:bg-parchment-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-terracotta-600 hover:bg-terracotta-700 text-white text-xs font-semibold px-5 py-2 rounded-xl shadow-sm"
            >
              Save Memory
            </button>
          </div>
        </form>
      )}

      {/* Grid of Saved Memories */}
      {loading ? (
        <div className="text-center py-12 text-xs text-charcoal/60">Loading your family notebook...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-parchment-50 border border-dashed border-parchment-300 rounded-3xl space-y-3">
          <span className="text-3xl">📔</span>
          <h3 className="font-serif font-bold text-xl text-charcoal">Your Notebook is Empty</h3>
          <p className="text-xs text-charcoal/60 max-w-sm mx-auto">
            Click "Add Memory to Notebook" above to record your family's personal traditions and audio stories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-parchment-50 rounded-2xl border border-parchment-200 p-6 shadow-sm space-y-3 relative group">
              <button
                onClick={() => handleDelete(item.id)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-charcoal/40 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete memory"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 text-xs text-terracotta-600 font-semibold">
                <Heart className="w-3.5 h-3.5" />
                <span>{item.relationship || 'Family Member'}</span>
                {item.person_name && <span>• {item.person_name}</span>}
              </div>

              <h3 className="font-serif font-bold text-xl text-charcoal">
                {item.title}
              </h3>

              <p className="text-xs text-charcoal/80 leading-relaxed font-sans bg-white p-3 rounded-xl border border-parchment-200">
                "{item.tip}"
              </p>

              {item.story && (
                <p className="text-xs text-charcoal/70 italic bg-parchment-100 p-3 rounded-xl border-l-2 border-turmeric-500">
                  "{item.story}"
                </p>
              )}

              {/* Audio playback if recorded */}
              {item.audio_url && (
                <div className="pt-2">
                  <audio controls src={item.audio_url} className="w-full h-8" />
                </div>
              )}

              <div className="text-[11px] text-charcoal/40 pt-2 border-t border-parchment-200">
                Added {new Date(item.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
