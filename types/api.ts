/**
 * TypeScript type definitions for Insight Journey API
 * Based on the backend API documentation and endpoints
 */

// =============================================================================
// AUTHENTICATION TYPES
// =============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
  created_at: string;
  disabled: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: 'bearer';
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  username: string; // API uses username field for email
  password: string;
}

export interface PasswordUpdateData {
  current_password: string;
  new_password: string;
}

export interface ApiKey {
  api_key: string;
  expires_at: string;
}

export interface Credential {
  type: 'password' | 'api_key';
  value: string;
  expires_at: string | null;
}

// =============================================================================
// SESSION TYPES
// =============================================================================

export interface Session {
  id: string;
  title: string;
  description?: string;
  transcript?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  status: 'pending' | 'completed' | 'failed';
  analysis_status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface SessionCreateData {
  title: string;
  description?: string;
  transcript?: string;
}

export interface SessionUpdateData {
  title?: string;
  description?: string;
  transcript?: string;
}

// =============================================================================
// ANALYSIS TYPES
// =============================================================================

export interface AnalysisRequest {
  session_id: string;
}

export interface AnalysisJob {
  session_id: string;
  status: 'processing' | 'completed' | 'failed';
  created_at: string;
}

export interface Emotion {
  name: string;
  intensity: number;
  timestamp?: string;
}

export interface Insight {
  text: string;
  topic?: string;
  timestamp?: string;
}

export interface Belief {
  text: string;
  impact?: string;
  topic?: string;
  timestamp?: string;
}

export interface ActionItem {
  description: string;
  priority?: 'High' | 'Medium' | 'Low';
  status?: 'Pending' | 'In Progress' | 'Completed';
  timestamp?: string;
}

export interface Theme {
  name: string;
  confidence: number;
}

export interface Challenge {
  name: string;
  impact?: string;
  topic?: string;
  timestamp?: string;
}

export interface AnalysisResults {
  emotions: Emotion[];
  insights: Insight[];
  beliefs: Belief[];
  action_items: ActionItem[];
  themes: Theme[];
  summary: string;
  timestamp: string;
}

export interface SessionElements {
  emotions: Emotion[];
  insights: Insight[];
  beliefs: Belief[];
  action_items: ActionItem[];
  themes: Theme[];
  challenges: Challenge[];
}

export interface Neo4jQueryRequest {
  query: string;
  parameters: Record<string, any>;
}

export interface Neo4jQueryResponse {
  results: any[];
  query: string;
  execution_time: number;
}

// =============================================================================
// TRANSCRIPTION TYPES
// =============================================================================

export interface TranscriptionOptions {
  language?: string;
  format?: 'text' | 'json' | 'srt' | 'vtt';
  speaker_detection?: boolean;
}

export interface TranscriptionJob {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  estimated_completion_time?: string;
  duration_seconds?: number;
}

export interface TranscriptSegment {
  speaker?: string;
  text: string;
  start_time: number;
  end_time: number;
  confidence: number;
}

export interface TranscriptionResult {
  id: string;
  status: 'completed' | 'failed';
  transcript?: string;
  segments?: TranscriptSegment[];
  duration_seconds: number;
  completed_at: string;
}

export interface TranscriptionLinkRequest {
  session_id: string;
}

// =============================================================================
// INSIGHTS TYPES
// =============================================================================

export interface TurningPoint {
  emotion: string;
  turning_point_session: string;
  before_intensity: number;
  after_intensity: number;
  improvement: number;
  session_date: string;
}

export interface Correlation {
  emotion: string;
  topic: string;
  correlation_strength: number;
  occurrences: number;
}

export interface CascadeMap {
  nodes: CascadeNode[];
  edges: CascadeEdge[];
}

export interface CascadeNode {
  id: string;
  type: 'emotion' | 'topic' | 'insight';
  label: string;
  intensity?: number;
}

export interface CascadeEdge {
  source: string;
  target: string;
  strength: number;
  type: 'triggers' | 'influences' | 'leads_to';
}

export interface FuturePrediction {
  predictions: Prediction[];
  confidence_score: number;
}

export interface Prediction {
  type: 'emotion' | 'challenge' | 'improvement';
  description: string;
  probability: number;
  timeframe: string;
}

export interface ChallengePersistence {
  challenge: string;
  persistence_level: 'low' | 'medium' | 'high';
  sessions_count: number;
  first_occurrence: string;
  last_occurrence: string;
}

export interface TherapistSnapshot {
  client_overview: {
    primary_emotions: string[];
    progress_trend: 'improving' | 'stable' | 'declining';
    session_count: number;
  };
  recommendations: string[];
  key_insights: string[];
}

export interface ReflectionRequest {
  reflection: string;
}

export interface AllInsights {
  turning_point: TurningPoint;
  correlations: Correlation[];
  cascade_map: CascadeMap;
  future_prediction: FuturePrediction;
  challenges: ChallengePersistence[];
}

// =============================================================================
// SYSTEM TYPES
// =============================================================================

export interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  api_version?: string;
}

export interface RootStatus {
  status: 'ok';
  message: string;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export interface ApiError {
  error: string;
  details?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

// =============================================================================
// REQUEST/RESPONSE WRAPPERS
// =============================================================================

export interface AuthResponse extends ApiResponse<User> {}
export interface TokenApiResponse extends ApiResponse<TokenResponse> {}
export interface SessionResponse extends ApiResponse<Session> {}
export interface SessionsResponse extends ApiResponse<Session[]> {}
export interface AnalysisResponse extends ApiResponse<AnalysisResults> {}
export interface ElementsResponse extends ApiResponse<SessionElements> {}
export interface TranscriptionResponse extends ApiResponse<TranscriptionJob> {}
export interface InsightsResponse extends ApiResponse<AllInsights> {}

// =============================================================================
// UI STATE TYPES
// =============================================================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface RequestState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface AsyncState<T = any> extends RequestState<T> {
  lastFetched?: Date;
  refetch: () => Promise<void>;
}

// =============================================================================
// FORM TYPES
// =============================================================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SessionFormData {
  title: string;
  description: string;
  transcript?: string;
}

export interface ReflectionFormData {
  reflection: string;
}

export interface PasswordUpdateFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// =============================================================================
// CHART/VISUALIZATION TYPES
// =============================================================================

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
  emotion?: string;
}

export interface EmotionDistribution {
  emotion: string;
  intensity: number;
  sessions: number;
  percentage: number;
}

export interface ProgressMetric {
  name: string;
  current: number;
  target: number;
  trend: 'improving' | 'stable' | 'declining';
  changePercent: number;
}

// =============================================================================
// NAVIGATION TYPES
// =============================================================================

export interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
  badge?: number;
  children?: NavigationItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

// =============================================================================
// SETTINGS TYPES
// =============================================================================

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    analysis_complete: boolean;
    session_reminders: boolean;
  };
  privacy: {
    share_analytics: boolean;
    data_retention_days: number;
  };
  display: {
    timezone: string;
    date_format: string;
    language: string;
  };
}

export interface AdminSettings {
  max_sessions: number;
  max_duration: number;
  allowed_file_types: string[];
  analysis_elements: AnalysisElement[];
}

export interface AnalysisElement {
  name: string;
  enabled: boolean;
  description: string;
  categories: string[];
  format_template: string;
  system_instructions?: string;
  analysis_instructions?: string;
}

// =============================================================================
// EXPORT ALL TYPES
// =============================================================================

export type {
  // Re-export for convenience
  User as AuthUser,
  Session as TherapySession,
  AnalysisResults as SessionAnalysis,
  TranscriptionResult as AudioTranscription,
  AllInsights as AdvancedInsights,
}; 