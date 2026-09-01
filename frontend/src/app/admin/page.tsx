'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Trash2, 
  Users, 
  BookOpen, 
  MessageSquare, 
  Activity 
} from 'lucide-react';
import EvidenceBadge from '@/components/EvidenceBadge';
import { adminApi, authApi } from '@/lib/api';
import { AdminStats, WisdomEntry, User } from '@/types';

export default function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pending, setPending] = useState<WisdomEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'analytics'>('pending');

  useEffect(() => {
    const currentUser = authApi.getCurrentUserFromStorage();
    setUser(currentUser);

    if (currentUser?.is_admin) {
      loadData();
    } else {
      setLoading(false);
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, pendingRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getPending(),
      ]);
      setStats(statsRes);
      setPending(pendingRes.items || []);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await adminApi.approve(id);
      loadData();
    } catch (err) {
      alert('Failed to approve wisdom entry');
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Enter rejection / moderation reason (optional):');
    try {
      await adminApi.reject(id, reason || undefined);
      loadData();
    } catch (err) {
      alert('Failed to reject wisdom entry');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Permanently delete this entry?')) return;
    try {
      await adminApi.deleteWisdom(id);
      loadData();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  if (!user || !user.is_admin) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-terracotta-600 mx-auto" />
        <h2 className="font-serif font-bold text-2xl text-charcoal">Admin Access Required</h2>
        <p className="text-xs text-charcoal/70">
          You must be logged in as an administrator to access the moderation dashboard.
        </p>
        <a
          href="/login"
          className="inline-block bg-terracotta-600 text-white text-xs font-semibold px-6 py-2.5 rounded-xl"
        >
          Sign In as Admin
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-parchment-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-terracotta-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Moderation & Control Center</span>
          </div>
          <h1 className="font-serif font-bold text-3xl text-charcoal">
            NaniBot Admin Dashboard
          </h1>
          <p className="text-xs text-charcoal/70 mt-1">
            Manage user submissions, AI safety classifications, and platform analytics.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-parchment-100 p-1 rounded-xl border border-parchment-300">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'pending'
                ? 'bg-white text-terracotta-700 shadow-xs'
                : 'text-charcoal/70 hover:text-charcoal'
            }`}
          >
            Pending Review ({pending.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'analytics'
                ? 'bg-white text-terracotta-700 shadow-xs'
                : 'text-charcoal/70 hover:text-charcoal'
            }`}
          >
            Analytics & Distribution
          </button>
        </div>
      </div>

      {/* Overview Stat Counters */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-parchment-50 p-4 rounded-2xl border border-parchment-200">
            <span className="text-xs font-semibold text-charcoal/60 uppercase">Total Wisdom</span>
            <div className="text-2xl font-bold font-serif text-charcoal mt-1">{stats.total_wisdom}</div>
          </div>
          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200">
            <span className="text-xs font-semibold text-emerald-800 uppercase">Approved</span>
            <div className="text-2xl font-bold font-serif text-emerald-900 mt-1">{stats.approved_wisdom}</div>
          </div>
          <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200">
            <span className="text-xs font-semibold text-amber-800 uppercase">Pending</span>
            <div className="text-2xl font-bold font-serif text-amber-900 mt-1">{stats.pending_wisdom}</div>
          </div>
          <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200">
            <span className="text-xs font-semibold text-rose-800 uppercase">Flagged</span>
            <div className="text-2xl font-bold font-serif text-rose-900 mt-1">{stats.flagged_wisdom}</div>
          </div>
          <div className="bg-parchment-50 p-4 rounded-2xl border border-parchment-200">
            <span className="text-xs font-semibold text-charcoal/60 uppercase">Contributors</span>
            <div className="text-2xl font-bold font-serif text-charcoal mt-1">{stats.total_contributors}</div>
          </div>
          <div className="bg-parchment-50 p-4 rounded-2xl border border-parchment-200">
            <span className="text-xs font-semibold text-charcoal/60 uppercase">AI Queries</span>
            <div className="text-2xl font-bold font-serif text-charcoal mt-1">{stats.total_chats}</div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {activeTab === 'pending' ? (
        <div className="space-y-4">
          <h2 className="font-serif font-bold text-xl text-charcoal">
            Submissions Awaiting Approval ({pending.length})
          </h2>

          {loading ? (
            <div className="text-xs text-charcoal/60 py-8 text-center">Loading pending items...</div>
          ) : pending.length === 0 ? (
            <div className="bg-parchment-50 border border-dashed border-parchment-300 rounded-3xl p-12 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-serif font-bold text-lg text-charcoal">All caught up!</h3>
              <p className="text-xs text-charcoal/60">No pending user contributions require review right now.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map((item) => (
                <div key={item.id} className="bg-parchment-50 border border-parchment-300 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-parchment-200 pb-3">
                    <div>
                      <span className="text-xs font-semibold text-terracotta-600 bg-terracotta-50 px-2 py-0.5 rounded border border-terracotta-100 mr-2">
                        {item.category}
                      </span>
                      <span className="font-serif font-bold text-lg text-charcoal">{item.title}</span>
                    </div>
                    <EvidenceBadge label={item.evidence_label} size="sm" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-charcoal/80">
                    <div className="bg-white p-3 rounded-xl border border-parchment-200">
                      <strong>Tip:</strong> "{item.tip}"
                    </div>
                    {item.story && (
                      <div className="bg-parchment-100 p-3 rounded-xl border-l-2 border-turmeric-500 italic">
                        <strong>Story:</strong> "{item.story}"
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-charcoal/50">
                      Submitted: {new Date(item.created_at).toLocaleDateString()} • Region: {item.region || 'Unspecified'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve & Index RAG
                      </button>
                      <button
                        onClick={() => handleReject(item.id)}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Analytics Tab */
        stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Evidence Distribution */}
            <div className="bg-parchment-50 rounded-2xl border border-parchment-200 p-6 space-y-4">
              <h3 className="font-serif font-bold text-lg text-charcoal flex items-center gap-2">
                <Activity className="w-4 h-4 text-terracotta-600" />
                Evidence Status Breakdown
              </h3>
              <div className="space-y-3 text-xs">
                {Object.entries(stats.evidence_distribution).map(([label, count]) => (
                  <div key={label} className="flex items-center justify-between bg-white p-3 rounded-xl border border-parchment-200">
                    <EvidenceBadge label={label as any} size="sm" />
                    <span className="font-bold text-charcoal">{count} entries</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-parchment-50 rounded-2xl border border-parchment-200 p-6 space-y-4">
              <h3 className="font-serif font-bold text-lg text-charcoal flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-terracotta-600" />
                Entries by Knowledge Domain
              </h3>
              <div className="space-y-2 text-xs">
                {Object.entries(stats.categories).map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-parchment-200">
                    <span className="font-medium text-charcoal">{cat}</span>
                    <span className="font-bold text-terracotta-700 bg-terracotta-50 px-2 py-0.5 rounded">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
