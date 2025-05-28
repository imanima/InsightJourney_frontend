# 🧠 Insight Journey - Frontend

A modern Next.js application for therapy session analysis and insights visualization.

## 📋 Overview

Insight Journey Frontend is a comprehensive web application built with Next.js 15 that provides therapists and clients with powerful tools for analyzing therapy sessions, tracking emotional progress, and gaining actionable insights from conversational data.

### 🎯 Key Features

- **Session Management**: Create, manage, and organize therapy sessions
- **Audio Transcription**: Upload and transcribe audio recordings with speaker detection
- **AI Analysis**: Advanced analysis of session transcripts using OpenAI
- **Emotional Analytics**: Track emotions, intensity, and trends over time
- **Advanced Insights**: Turning points, correlations, cascade maps, and future predictions
- **Progress Tracking**: Visualize client progress and therapeutic outcomes
- **Therapist Dashboard**: Comprehensive snapshot for therapy professionals
- **Action Items**: Track and manage therapy homework and commitments
- **Responsive Design**: Mobile-first design optimized for all devices

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context + Custom hooks
- **Authentication**: JWT-based with refresh tokens
- **Charts**: Recharts for data visualization
- **API Integration**: Custom API client with automatic retry and error handling
- **Testing**: Jest + React Testing Library

### Project Structure

```
insight-journey-frontend/
├── 📁 app/                          # Next.js App Router pages
│   ├── 📁 (auth)/                   # Authentication routes
│   ├── 📁 (dashboard)/              # Main application routes
│   ├── 📁 (admin)/                  # Admin-only routes
│   └── 📁 api/                      # API proxy routes
├── 📁 components/                   # Reusable React components
│   ├── 📁 auth/                     # Authentication components
│   ├── 📁 sessions/                 # Session management components
│   ├── 📁 analysis/                 # Analysis result components
│   ├── 📁 insights/                 # Advanced insights components
│   ├── 📁 transcription/            # Audio transcription components
│   ├── 📁 charts/                   # Chart and visualization components
│   ├── 📁 forms/                    # Form components
│   ├── 📁 layout/                   # Layout and navigation components
│   ├── 📁 ui/                       # shadcn/ui base components
│   └── 📁 common/                   # Common utility components
├── 📁 hooks/                        # Custom React hooks
├── 📁 lib/                          # Utility libraries
│   ├── 📁 api/                      # API client modules
│   ├── 📁 auth/                     # Authentication utilities
│   ├── 📁 utils/                    # General utilities
│   └── 📁 config/                   # Configuration files
├── 📁 types/                        # TypeScript type definitions
├── 📁 styles/                       # Global styles and themes
├── 📁 public/                       # Static assets
└── 📁 docs/                         # Documentation
```

## 📋 Recent Updates

### Project Cleanup (Latest)
- ✅ Removed temporary test files and scripts
- ✅ Updated `.gitignore` with comprehensive Next.js patterns
- ✅ Organized documentation into dedicated `/docs` folder
- ✅ Cleaned build artifacts and system files
- ✅ Updated project name to `insight-journey-frontend`
- ✅ Removed conflicting lock files (keeping npm-based workflow)

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- pnpm (recommended) or npm
- Access to the Insight Journey backend API

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd insight-journey-frontend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
   NEXT_PUBLIC_PRODUCTION_API_URL=https://insight-journey-a47jf6g6sa-uc.a.run.app/api/v1
   
   # Authentication
   NEXT_PUBLIC_JWT_SECRET=your-jwt-secret-key
   
   # Features
   NEXT_PUBLIC_ENABLE_MOCK_DATA=false
   NEXT_PUBLIC_DEBUG_API=false
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Development

### Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript checks

# Testing
pnpm test         # Run tests
pnpm test:watch   # Run tests in watch mode
pnpm test:e2e     # Run end-to-end tests

# Organization
node reorganize-frontend.js --dry-run    # Preview reorganization
node reorganize-frontend.js --force      # Execute reorganization
```

### Code Style

- **TypeScript**: Strict mode enabled with comprehensive type safety
- **ESLint**: Configured with Next.js and React best practices
- **Prettier**: Automatic code formatting
- **Conventional Commits**: Standardized commit messages

### Component Guidelines

1. **Functional Components**: Use React function components with hooks
2. **TypeScript**: All components must be fully typed
3. **Props Interface**: Define clear interfaces for component props
4. **Error Boundaries**: Wrap components that might fail
5. **Loading States**: Always handle loading and error states
6. **Accessibility**: Follow WCAG 2.1 AA guidelines

### API Integration

The application uses a centralized API client with the following features:

- **Automatic Authentication**: JWT tokens managed automatically
- **Error Handling**: Centralized error handling with user-friendly messages
- **Retry Logic**: Automatic retry for failed requests
- **Request/Response Interceptors**: Logging and transformation
- **Mock Data Support**: Development mode with mock responses

```typescript
// Example API usage
import { useAuth, useAPI } from '@/hooks';

function SessionsList() {
  const { isAuthenticated } = useAuth();
  const { data: sessions, loading, error } = useAPI('/sessions');

  if (!isAuthenticated) return <LoginPrompt />;
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {sessions.map(session => (
        <SessionCard key={session.id} session={session} />
      ))}
    </div>
  );
}
```

## 🎨 UI/UX Design

### Design System

The application uses a consistent design system built on:

- **shadcn/ui**: High-quality, accessible React components
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Consistent iconography
- **Inter Font**: Modern, readable typography

### Color Palette

```css
/* Primary Colors - Calming therapy theme */
--primary: 200 100% 28%;        /* Deep teal */
--primary-foreground: 0 0% 98%; /* Light text */

/* Secondary Colors */
--secondary: 200 30% 95%;       /* Light gray-blue */
--secondary-foreground: 200 30% 10%; /* Dark text */

/* Accent Colors */
--accent: 150 60% 50%;          /* Soft green */
--destructive: 0 65% 55%;       /* Warm red */
```

### Responsive Design

- **Mobile-first**: Optimized for mobile therapy sessions
- **Breakpoints**: 
  - sm: 640px (mobile)
  - md: 768px (tablet)
  - lg: 1024px (desktop)
  - xl: 1280px (large desktop)

### Accessibility

- **ARIA Labels**: Complete accessibility attributes
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Semantic HTML structure
- **Color Contrast**: WCAG AA compliance
- **Focus Management**: Proper focus handling

## 🔐 Authentication & Security

### Authentication Flow

1. **Login**: JWT token obtained from backend
2. **Storage**: Token stored securely (httpOnly cookie in production)
3. **Automatic Renewal**: Token refresh before expiration
4. **Route Protection**: Protected routes require authentication
5. **Logout**: Token invalidation and cleanup

### Security Features

- **XSS Protection**: Input sanitization and validation
- **CSRF Protection**: CSRF tokens for state-changing operations
- **Content Security Policy**: Strict CSP headers
- **Secure Headers**: HSTS, X-Frame-Options, etc.
- **Input Validation**: Client and server-side validation

## 📊 Data Visualization

### Chart Components

The application includes comprehensive chart components for therapy data:

- **Emotion Analytics**: Pie charts, bar charts, trend lines
- **Progress Tracking**: Timeline charts, progress bars
- **Correlation Matrices**: Heatmaps for emotion-topic correlations
- **Cascade Maps**: Interactive network visualizations
- **Prediction Charts**: Future trend predictions

### Chart Libraries

- **Recharts**: Primary charting library for standard charts
- **D3.js**: Custom visualizations for complex data
- **React Flow**: Interactive node-based diagrams

## 🧪 Testing Strategy

### Unit Tests

```bash
# Component testing
src/components/**/*.test.tsx

# Hook testing  
src/hooks/**/*.test.ts

# Utility testing
src/lib/**/*.test.ts
```

### Integration Tests

```bash
# API integration
src/tests/api/**/*.test.ts

# Authentication flow
src/tests/auth/**/*.test.ts

# User workflows
src/tests/integration/**/*.test.ts
```

### E2E Tests

```bash
# Critical user journeys
tests/e2e/user-flows/**/*.spec.ts

# Cross-browser testing
tests/e2e/browser-compatibility/**/*.spec.ts
```

## 📱 Mobile Optimization

### Progressive Web App (PWA)

- **Service Worker**: Offline functionality
- **App Manifest**: Home screen installation
- **Push Notifications**: Therapy session reminders
- **Background Sync**: Sync data when back online

### Mobile Features

- **Touch Gestures**: Swipe navigation and interactions
- **Responsive Charts**: Touch-friendly data visualization
- **Camera Integration**: Photo capture for session notes
- **Voice Recording**: Built-in audio recording

## 🚀 Deployment

### Build Process

```bash
# Production build
pnpm build

# Build analysis
pnpm build:analyze

# Start production server
pnpm start
```

### Environment Configuration

Create environment-specific configuration:

```bash
# Development
.env.local

# Staging
.env.staging

# Production
.env.production
```

### Deployment Platforms

- **Vercel**: Recommended for Next.js applications
- **Netlify**: Alternative with good performance
- **Docker**: Containerized deployment option
- **AWS/GCP**: Cloud platform deployment

## 📈 Performance Optimization

### Code Splitting

- **Route-based**: Automatic Next.js code splitting
- **Component-based**: Dynamic imports for heavy components
- **Library splitting**: Vendor bundle optimization

### Caching Strategy

- **Static Generation**: Pre-generated pages where possible
- **Incremental Static Regeneration**: Dynamic content caching
- **API Response Caching**: Client-side response caching
- **Image Optimization**: Next.js automatic image optimization

### Bundle Analysis

```bash
# Analyze bundle size
pnpm build:analyze

# Lighthouse audit
pnpm audit:lighthouse

# Performance testing
pnpm test:performance
```

## 🔧 Configuration

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/types/*": ["./src/types/*"]
    }
  }
}
```

### ESLint Configuration

```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "plugin:accessibility/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/exhaustive-deps": "error"
  }
}
```

## 📚 API Integration

### Backend API

The frontend integrates with the Insight Journey backend API:

- **Base URL**: `https://insight-journey-a47jf6g6sa-uc.a.run.app/api/v1`
- **Documentation**: [API_README.md](./API_README.md)
- **Integration Guide**: [frontend_integration.md](./frontend_integration.md)

### API Client Features

- **Automatic Authentication**: JWT token handling
- **Request Interceptors**: Add auth headers automatically
- **Response Interceptors**: Handle errors consistently
- **Retry Logic**: Automatic retry for transient failures
- **Offline Support**: Cache responses for offline use

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow coding standards
4. **Add tests**: Ensure good test coverage
5. **Commit changes**: Use conventional commits
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**: Describe your changes

### Coding Standards

- **TypeScript**: Use strict typing
- **Components**: Follow component guidelines
- **Hooks**: Create reusable custom hooks
- **Testing**: Write tests for all new features
- **Documentation**: Update documentation as needed

### Code Review Process

1. **Automated Checks**: ESLint, TypeScript, tests must pass
2. **Manual Review**: At least one reviewer approval required
3. **Testing**: Manual testing of new features
4. **Documentation**: Ensure documentation is updated

## 📞 Support

### Documentation

- **API Documentation**: [API_README.md](./API_README.md)
- **Integration Guide**: [frontend_integration.md](./frontend_integration.md)
- **Organization Guide**: [FRONTEND_ORGANIZATION.md](./FRONTEND_ORGANIZATION.md)

### Getting Help

- **Issues**: Create GitHub issues for bugs or feature requests
- **Discussions**: Use GitHub discussions for questions
- **Email**: Contact the development team

### Useful Links

- **Backend Repository**: [Insight Journey Backend](../insight-journey-backend)
- **API Documentation**: [Live API Docs](https://insight-journey-a47jf6g6sa-uc.a.run.app/api/v1/docs)
- **Design System**: [shadcn/ui Documentation](https://ui.shadcn.com/)
- **Next.js Documentation**: [Next.js Docs](https://nextjs.org/docs)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI**: For providing the analysis capabilities
- **Neo4j**: For graph database insights
- **Vercel**: For the Next.js framework and hosting
- **shadcn**: For the beautiful UI components
- **Tailwind CSS**: For the utility-first CSS framework

---

**Built with ❤️ for better mental health outcomes** 