export type EvidenceLabel = 
  | 'well_supported'
  | 'some_evidence'
  | 'limited_evidence'
  | 'potentially_unsafe'
  | 'insufficient_info';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: number;
  email: string;
  name: string;
  is_admin: boolean;
  is_active: boolean;
  avatar_url?: string;
  created_at: string;
}

export interface WisdomEntry {
  id: number;
  title: string;
  category: string;
  subcategory?: string;
  tip: string;
  story?: string;
  who_taught?: string;
  region?: string;
  culture?: string;
  ingredients?: string;
  steps?: string;
  when_used?: string;
  image_url?: string;
  evidence_label: EvidenceLabel;
  risk_level: RiskLevel;
  ai_summary?: string;
  tags?: string;
  is_approved: boolean;
  is_flagged: boolean;
  is_seed_data: boolean;
  view_count: number;
  save_count: number;
  helpful_count: number;
  contributor_id?: number;
  created_at: string;
}

export interface StructuredResponse {
  traditional_wisdom: string;
  why_people_use_it: string;
  what_science_says: string;
  safety_note: string;
  when_to_see_doctor?: string;
  evidence_label: EvidenceLabel;
  risk_level: RiskLevel;
}

export interface ChatSource {
  id: number;
  title: string;
  category: string;
  evidence_label: EvidenceLabel;
  region?: string;
  source_type: string;
}

export interface ChatResponse {
  message_id: number;
  session_id: string;
  response_text: string;
  structured?: StructuredResponse;
  sources: ChatSource[];
  source_explanation: string;
  risk_level: RiskLevel;
  is_health_related: boolean;
  language: string;
}

export interface FamilyArchiveItem {
  id: number;
  user_id: number;
  title: string;
  category?: string;
  tip: string;
  story?: string;
  person_name?: string;
  relationship?: string;
  year_era?: string;
  region?: string;
  culture?: string;
  image_url?: string;
  audio_url?: string;
  audio_transcript?: string;
  created_at: string;
}

export interface AdminStats {
  total_wisdom: number;
  approved_wisdom: number;
  pending_wisdom: number;
  flagged_wisdom: number;
  total_users: number;
  total_contributors: number;
  total_chats: number;
  categories: Record<string, number>;
  regions: Record<string, number>;
  evidence_distribution: Record<string, number>;
  risk_distribution: Record<string, number>;
}

export interface CategoryInfo {
  category: string;
  count: number;
}

export interface RegionInfo {
  region: string;
  count: number;
}
