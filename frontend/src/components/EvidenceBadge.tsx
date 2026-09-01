import { EvidenceLabel } from '@/types';

interface EvidenceBadgeProps {
  label: EvidenceLabel;
  size?: 'sm' | 'md' | 'lg';
}

const BADGE_CONFIG: Record<EvidenceLabel, { text: string; emoji: string; bg: string; border: string; textColor: string }> = {
  well_supported: {
    text: 'Well Supported',
    emoji: '🟢',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    textColor: 'text-emerald-800',
  },
  some_evidence: {
    text: 'Some Evidence',
    emoji: '🟡',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    textColor: 'text-amber-800',
  },
  limited_evidence: {
    text: 'Traditional Practice',
    emoji: '🟠',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    textColor: 'text-orange-800',
  },
  potentially_unsafe: {
    text: 'Caution Advised',
    emoji: '🔴',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    textColor: 'text-rose-800',
  },
  insufficient_info: {
    text: 'Insufficient Info',
    emoji: '⚪',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    textColor: 'text-gray-700',
  },
};

export default function EvidenceBadge({ label, size = 'sm' }: EvidenceBadgeProps) {
  const config = BADGE_CONFIG[label] || BADGE_CONFIG.insufficient_info;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm font-medium',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.border} ${config.textColor} ${sizeClasses} font-sans shadow-2xs`}
      title={`Scientific evidence status: ${config.text}`}
    >
      <span>{config.emoji}</span>
      <span>{config.text}</span>
    </span>
  );
}
