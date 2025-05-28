# 🎯 Frontend Organization Guide - Insight Journey

## 📋 Overview
This document outlines the organized structure for the Insight Journey frontend application, a Next.js application that integrates with the backend API for therapy session analysis.

## 🏗️ Current Structure Analysis
The frontend is a Next.js 15 application with:
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context + Custom hooks
- **Authentication**: JWT-based with refresh tokens
- **API Integration**: Custom API client with mock fallback
- **Charts**: Recharts for data visualization

## 🎯 Organized Directory Structure

```
insight-journey-frontend/
├── 📁 app/                          # Next.js App Router pages
│   ├── 📁 (auth)/                   # Auth layout group
│   │   ├── 📁 login/                # Login page
│   │   ├── 📁 register/             # Registration page
│   │   └── 📁 auth-test/            # Auth testing page
│   ├── 📁 (dashboard)/              # Dashboard layout group
│   │   ├── 📁 dashboard/            # Main dashboard
│   │   ├── 📁 sessions/             # Session management
│   │   │   ├── page.tsx             # Sessions list
│   │   │   ├── 📁 [id]/             # Session details
│   │   │   ├── 📁 create/           # Create session
│   │   │   └── 📁 analysis/         # Session analysis
│   │   ├── 📁 insights/             # Advanced insights
│   │   │   ├── page.tsx             # Insights overview
│   │   │   ├── 📁 turning-point/    # Turning point analysis
│   │   │   ├── 📁 correlations/     # Emotion-topic correlations
│   │   │   ├── 📁 cascade-map/      # Cascade mapping
│   │   │   ├── 📁 future-prediction/ # Future predictions
│   │   │   └── 📁 therapist-snapshot/ # Therapist dashboard
│   │   ├── 📁 transcription/        # Audio transcription
│   │   │   ├── page.tsx             # Transcription dashboard
│   │   │   ├── 📁 upload/           # Upload audio
│   │   │   └── 📁 [id]/             # Transcription details
│   │   ├── 📁 progress/             # Progress tracking
│   │   ├── 📁 action-items/         # Action items management
│   │   └── 📁 settings/             # User settings
│   ├── 📁 (admin)/                  # Admin layout group
│   │   ├── 📁 admin/                # Admin dashboard
│   │   ├── 📁 admin-settings/       # System settings
│   │   └── 📁 users/                # User management
│   ├── 📁 api/                      # API routes (proxy)
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Home page
│   └── globals.css                  # Global styles
├── 📁 components/                   # Reusable components
│   ├── 📁 auth/                     # Authentication components
│   │   ├── auth-provider.tsx        # Auth context provider
│   │   ├── login-form.tsx           # Login form
│   │   ├── register-form.tsx        # Registration form
│   │   └── logout-button.tsx        # Logout button
│   ├── 📁 dashboard/                # Dashboard components
│   │   ├── stats-overview.tsx       # Statistics overview
│   │   ├── recent-sessions.tsx      # Recent sessions list
│   │   └── quick-actions.tsx        # Quick action buttons
│   ├── 📁 sessions/                 # Session-related components
│   │   ├── session-list.tsx         # Sessions list
│   │   ├── session-card.tsx         # Session card
│   │   ├── session-form.tsx         # Create/edit session
│   │   ├── session-details.tsx      # Session details view
│   │   └── session-analysis.tsx     # Analysis results
│   ├── 📁 analysis/                 # Analysis components
│   │   ├── analysis-overview.tsx    # Analysis overview
│   │   ├── emotion-analytics.tsx    # Emotion analytics
│   │   ├── insights-display.tsx     # Insights display
│   │   ├── elements-dashboard.tsx   # Session elements
│   │   └── neo4j-query.tsx          # Neo4j query interface
│   ├── 📁 insights/                 # Advanced insights components
│   │   ├── turning-point-chart.tsx  # Turning point visualization
│   │   ├── correlation-matrix.tsx   # Correlation visualization
│   │   ├── cascade-map.tsx          # Cascade map component
│   │   ├── prediction-chart.tsx     # Future prediction charts
│   │   ├── challenge-persistence.tsx # Challenge tracking
│   │   └── therapist-snapshot.tsx   # Therapist dashboard
│   ├── 📁 transcription/            # Transcription components
│   │   ├── audio-upload.tsx         # Audio file upload
│   │   ├── transcription-status.tsx # Transcription progress
│   │   ├── transcript-display.tsx   # Transcript viewer
│   │   ├── audio-player.tsx         # Audio playback
│   │   └── speaker-detection.tsx    # Speaker identification
│   ├── 📁 charts/                   # Chart components
│   │   ├── emotion-pie-chart.tsx    # Emotion distribution
│   │   ├── emotion-trends-chart.tsx # Emotion trends
│   │   ├── progress-chart.tsx       # Progress visualization
│   │   └── timeline-chart.tsx       # Timeline charts
│   ├── 📁 forms/                    # Form components
│   │   ├── action-item-form.tsx     # Action item forms
│   │   ├── reflection-form.tsx      # Reflection forms
│   │   └── settings-form.tsx        # Settings forms
│   ├── 📁 layout/                   # Layout components
│   │   ├── base-layout.tsx          # Base layout
│   │   ├── mobile-layout.tsx        # Mobile layout
│   │   ├── sidebar.tsx              # Sidebar navigation
│   │   ├── header.tsx               # Header component
│   │   └── bottom-navigation.tsx    # Mobile navigation
│   ├── 📁 ui/                       # shadcn/ui components
│   │   ├── button.tsx               # Button component
│   │   ├── input.tsx                # Input component
│   │   ├── card.tsx                 # Card component
│   │   ├── dialog.tsx               # Dialog component
│   │   ├── toast.tsx                # Toast notifications
│   │   └── ...                      # Other UI components
│   └── 📁 common/                   # Common components
│       ├── loading-spinner.tsx      # Loading indicators
│       ├── error-boundary.tsx       # Error handling
│       ├── not-found.tsx            # 404 component
│       └── theme-provider.tsx       # Theme provider
├── 📁 hooks/                        # Custom React hooks
│   ├── use-auth.tsx                 # Authentication hook
│   ├── use-api.tsx                  # API client hook
│   ├── use-sessions.tsx             # Session management
│   ├── use-analysis.tsx             # Analysis operations
│   ├── use-insights.tsx             # Insights data
│   ├── use-transcription.tsx        # Transcription operations
│   ├── use-mobile.tsx               # Mobile detection
│   ├── use-toast.tsx                # Toast notifications
│   ├── use-debounce.tsx             # Debounce utility
│   └── use-websocket.tsx            # WebSocket connections
├── 📁 lib/                          # Utility libraries
│   ├── 📁 api/                      # API-related modules
│   │   ├── client.ts                # Main API client
│   │   ├── auth.ts                  # Authentication API
│   │   ├── sessions.ts              # Sessions API
│   │   ├── analysis.ts              # Analysis API
│   │   ├── insights.ts              # Insights API
│   │   ├── transcription.ts         # Transcription API
│   │   └── types.ts                 # API type definitions
│   ├── 📁 auth/                     # Authentication utilities
│   │   ├── auth-context.tsx         # Auth context
│   │   ├── auth-utils.ts            # Auth utilities
│   │   ├── token-manager.ts         # Token management
│   │   └── permissions.ts           # Permission checking
│   ├── 📁 mock/                     # Mock data for development
│   │   ├── auth-mock.ts             # Auth mock data
│   │   ├── sessions-mock.ts         # Sessions mock data
│   │   ├── analysis-mock.ts         # Analysis mock data
│   │   ├── insights-mock.ts         # Insights mock data
│   │   └── admin-mock.ts            # Admin mock data
│   ├── 📁 utils/                    # General utilities
│   │   ├── utils.ts                 # General utilities
│   │   ├── date-utils.ts            # Date formatting
│   │   ├── validation.ts            # Form validation
│   │   ├── storage.ts               # Local storage utils
│   │   ├── format.ts                # Data formatting
│   │   └── constants.ts             # App constants
│   └── 📁 config/                   # Configuration
│       ├── api-config.ts            # API configuration
│       ├── auth-config.ts           # Auth configuration
│       └── app-config.ts            # App configuration
├── 📁 types/                        # TypeScript type definitions
│   ├── auth.ts                      # Authentication types
│   ├── session.ts                   # Session types
│   ├── analysis.ts                  # Analysis types
│   ├── insights.ts                  # Insights types
│   ├── transcription.ts             # Transcription types
│   ├── user.ts                      # User types
│   ├── api.ts                       # API response types
│   ├── ui.ts                        # UI component types
│   └── environment.d.ts             # Environment variables
├── 📁 styles/                       # Styling files
│   ├── globals.css                  # Global styles
│   ├── components.css               # Component styles
│   └── utilities.css                # Utility classes
├── 📁 public/                       # Static assets
│   ├── 📁 icons/                    # Icons and favicons
│   ├── 📁 images/                   # Images
│   └── 📁 audio/                    # Sample audio files
├── 📁 middleware/                   # Next.js middleware
│   └── middleware.ts                # Auth middleware
├── 📁 tests/                        # Test files
│   ├── 📁 __mocks__/                # Test mocks
│   ├── 📁 components/               # Component tests
│   ├── 📁 hooks/                    # Hook tests
│   ├── 📁 api/                      # API tests
│   └── 📁 integration/              # Integration tests
├── 📁 docs/                         # Documentation
│   ├── API_README.md                # API documentation
│   ├── frontend_integration.md      # Integration guide
│   ├── DEVELOPMENT.md               # Development guide
│   └── DEPLOYMENT.md                # Deployment guide
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── tailwind.config.ts               # Tailwind config
├── next.config.mjs                  # Next.js config
├── postcss.config.mjs               # PostCSS config
├── components.json                  # shadcn/ui config
├── .gitignore                       # Git ignore rules
├── .env.local                       # Environment variables
├── .env.example                     # Environment template
└── README.md                        # Project readme
```

## 🔄 API Integration Strategy

### 1. API Client Architecture
```typescript
// lib/api/client.ts - Main API client
class InsightJourneyAPI {
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.auth = new AuthManager(baseUrl);
  }

  // Centralized request handling
  async request(endpoint: string, options: RequestInit = {}) {
    // Handle authentication, errors, retries
  }
}

// lib/api/auth.ts - Authentication API
export class AuthAPI {
  async login(email: string, password: string): Promise<TokenResponse>
  async register(userData: RegisterData): Promise<User>
  async logout(): Promise<void>
  async getCurrentUser(): Promise<User>
  async updatePassword(current: string, new: string): Promise<void>
  async generateApiKey(): Promise<ApiKey>
  async revokeApiKey(): Promise<void>
}

// lib/api/sessions.ts - Sessions API
export class SessionsAPI {
  async createSession(data: SessionData): Promise<Session>
  async getSessions(): Promise<Session[]>
  async getSession(id: string): Promise<Session>
  async updateSession(id: string, data: Partial<SessionData>): Promise<Session>
  async deleteSession(id: string): Promise<void>
}

// lib/api/analysis.ts - Analysis API
export class AnalysisAPI {
  async analyzeSession(sessionId: string): Promise<AnalysisJob>
  async getAnalysisResults(sessionId: string): Promise<AnalysisResults>
  async getAnalysisElements(sessionId: string): Promise<SessionElements>
  async runNeo4jQuery(query: string, params: object): Promise<QueryResults>
}

// lib/api/insights.ts - Insights API
export class InsightsAPI {
  async getTurningPoint(emotion?: string): Promise<TurningPoint>
  async getCorrelations(limit?: number): Promise<Correlation[]>
  async getCascadeMap(): Promise<CascadeMap>
  async getFuturePrediction(): Promise<Prediction>
  async getChallengePersistence(): Promise<Challenge[]>
  async getTherapistSnapshot(): Promise<TherapistSnapshot>
  async addReflection(reflection: string): Promise<void>
  async getAllInsights(): Promise<AllInsights>
}

// lib/api/transcription.ts - Transcription API
export class TranscriptionAPI {
  async uploadAudio(file: File, options: TranscriptOptions): Promise<TranscriptionJob>
  async getTranscriptionStatus(id: string): Promise<TranscriptionStatus>
  async getTranscriptionResult(id: string): Promise<TranscriptionResult>
  async linkToSession(transcriptionId: string, sessionId: string): Promise<void>
}
```

### 2. Custom Hooks Architecture
```typescript
// hooks/use-auth.tsx - Authentication state
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    // Handle login logic
  }, []);

  const logout = useCallback(() => {
    // Handle logout logic
  }, []);

  return { user, loading, error, login, logout, isAuthenticated: !!user };
}

// hooks/use-sessions.tsx - Session management
export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = useCallback(async (data: SessionData) => {
    // Handle session creation
  }, []);

  const deleteSession = useCallback(async (id: string) => {
    // Handle session deletion
  }, []);

  return { sessions, loading, error, createSession, deleteSession, refetch };
}

// hooks/use-analysis.tsx - Analysis operations
export function useAnalysis(sessionId: string) {
  const [analysis, setAnalysis] = useState<AnalysisResults | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [progress, setProgress] = useState(0);

  const startAnalysis = useCallback(async () => {
    // Handle analysis initiation and polling
  }, [sessionId]);

  return { analysis, status, progress, startAnalysis };
}

// hooks/use-insights.tsx - Insights data
export function useInsights() {
  const [insights, setInsights] = useState<AllInsights | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshInsights = useCallback(async () => {
    // Fetch all insights data
  }, []);

  return { insights, loading, refreshInsights };
}
```

### 3. Component Architecture
```typescript
// components/sessions/session-list.tsx
export function SessionList() {
  const { sessions, loading, error, deleteSession } = useSessions();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return <AuthRequired />;
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="grid gap-4">
      {sessions.map(session => (
        <SessionCard 
          key={session.id} 
          session={session} 
          onDelete={deleteSession}
        />
      ))}
    </div>
  );
}

// components/analysis/analysis-dashboard.tsx
export function AnalysisDashboard({ sessionId }: { sessionId: string }) {
  const { analysis, status, startAnalysis } = useAnalysis(sessionId);

  return (
    <div className="space-y-6">
      <AnalysisHeader status={status} onStart={startAnalysis} />
      {analysis && (
        <>
          <EmotionAnalytics emotions={analysis.emotions} />
          <InsightsDisplay insights={analysis.insights} />
          <ElementsDashboard elements={analysis.elements} />
        </>
      )}
    </div>
  );
}
```

## 🎨 UI/UX Architecture

### 1. Design System
- **Base**: shadcn/ui components with Tailwind CSS
- **Colors**: Consistent color palette for therapy/wellness theme
- **Typography**: Clear hierarchy for readability
- **Icons**: Lucide React icons
- **Charts**: Recharts for data visualization

### 2. Responsive Design
- **Mobile-first**: Optimized for mobile therapy sessions
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Navigation**: Drawer for mobile, sidebar for desktop
- **Charts**: Responsive and touch-friendly

### 3. Accessibility
- **ARIA labels**: Proper accessibility attributes
- **Keyboard navigation**: Full keyboard support
- **Screen readers**: Semantic HTML structure
- **Color contrast**: WCAG AA compliance

## 🔒 Security & Privacy

### 1. Authentication
- **JWT tokens**: Secure token-based auth
- **Token refresh**: Automatic token renewal
- **Session management**: Proper session handling
- **Route protection**: Auth-required routes

### 2. Data Protection
- **HTTPS only**: Secure data transmission
- **Input validation**: Client-side validation
- **Sanitization**: XSS protection
- **Sensitive data**: Minimal client-side storage

### 3. Privacy
- **Data anonymization**: User data protection
- **Session confidentiality**: Therapy session privacy
- **HIPAA considerations**: Healthcare data compliance

## 🚀 Performance Optimization

### 1. Code Splitting
- **Route-based**: Automatic Next.js code splitting
- **Component-based**: Dynamic imports for heavy components
- **Lazy loading**: Load components when needed

### 2. Caching Strategy
- **API responses**: React Query for caching
- **Images**: Next.js image optimization
- **Static assets**: CDN caching

### 3. Bundle Optimization
- **Tree shaking**: Remove unused code
- **Compression**: Gzip/Brotli compression
- **Minification**: Production builds

## 🧪 Testing Strategy

### 1. Unit Tests
- **Components**: React Testing Library
- **Hooks**: Custom hook testing
- **Utilities**: Function testing

### 2. Integration Tests
- **API integration**: Mock API responses
- **User flows**: E2E testing scenarios
- **Authentication**: Auth flow testing

### 3. E2E Tests
- **Critical paths**: Key user journeys
- **Cross-browser**: Multiple browser testing
- **Mobile testing**: Mobile-specific scenarios

## 📱 Mobile Optimization

### 1. Progressive Web App (PWA)
- **Service worker**: Offline functionality
- **App manifest**: Mobile app installation
- **Push notifications**: Therapy reminders

### 2. Mobile UX
- **Touch targets**: 44px minimum touch targets
- **Gestures**: Swipe navigation
- **Performance**: Fast loading on mobile networks

## 📊 Analytics & Monitoring

### 1. User Analytics
- **Usage tracking**: Feature usage analytics
- **Performance monitoring**: Core Web Vitals
- **Error tracking**: Error monitoring and reporting

### 2. Therapy Analytics
- **Session metrics**: Therapy session insights
- **Progress tracking**: Patient progress analytics
- **Outcome measures**: Therapy effectiveness metrics

## 🔧 Development Tools

### 1. Development Environment
- **Hot reload**: Fast development feedback
- **TypeScript**: Type safety
- **ESLint/Prettier**: Code formatting
- **Husky**: Git hooks

### 2. Build Tools
- **Next.js**: React framework
- **Webpack**: Module bundling
- **PostCSS**: CSS processing
- **TypeScript**: Type checking

## 📝 Documentation

### 1. Code Documentation
- **TSDoc**: TypeScript documentation
- **Component docs**: Storybook for UI components
- **API docs**: OpenAPI/Swagger integration

### 2. User Documentation
- **User guides**: Feature documentation
- **API guides**: Integration documentation
- **Deployment**: Deployment instructions

This organization provides a scalable, maintainable structure that aligns with the backend API and follows modern React/Next.js best practices. 