# 🧪 Testing Strategy - Insight Journey Frontend

## 📋 Overview

This document outlines the comprehensive testing strategy for the Insight Journey frontend application, covering unit tests, integration tests, end-to-end tests, and API testing.

## 🎯 Testing Philosophy

### Goals
- **Quality Assurance**: Ensure code reliability and prevent regressions
- **Developer Confidence**: Enable safe refactoring and feature development
- **User Experience**: Validate critical user journeys work correctly
- **API Integration**: Verify backend connectivity and data flow

### Principles
- **Test Pyramid**: More unit tests, fewer integration tests, minimal E2E tests
- **Fast Feedback**: Quick test execution for rapid development cycles
- **Maintainable**: Tests should be easy to understand and update
- **Realistic**: Tests should reflect real user scenarios

## 🏗️ Testing Architecture

```
                    🔺 E2E Tests (Playwright)
                   /   Critical user journeys
                  /    Cross-browser testing
                 /     Real backend integration
                /
               🔷 Integration Tests (Jest + RTL)
              /   Component integration
             /    API client testing
            /     Context providers
           /
          🔶 Unit Tests (Jest + RTL)
         /   Individual components
        /    Custom hooks
       /     Utility functions
      /      Business logic
     /
    🔹 API Tests (Node.js)
   /   Backend connectivity
  /    Endpoint validation
 /     Authentication flow
/
```

## 🛠️ Testing Stack

### Core Testing Tools
- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **Playwright**: End-to-end browser testing
- **MSW (Mock Service Worker)**: API mocking
- **Jest Fetch Mock**: HTTP request mocking

### Supporting Tools
- **@testing-library/user-event**: User interaction simulation
- **@testing-library/jest-dom**: Custom Jest matchers
- **jest-environment-jsdom**: DOM environment for tests

## 📊 Test Categories

### 1. Unit Tests (`tests/unit/`)

**Purpose**: Test individual components, hooks, and utilities in isolation

**Coverage**:
- ✅ React components (rendering, props, state)
- ✅ Custom hooks (state management, side effects)
- ✅ Utility functions (data transformation, validation)
- ✅ Business logic (calculations, formatting)

**Example Structure**:
```
tests/unit/
├── components/
│   ├── auth/
│   │   ├── auth-provider.test.tsx
│   │   └── login-form.test.tsx
│   ├── dashboard/
│   │   ├── session-card.test.tsx
│   │   └── insights-overview.test.tsx
│   └── ui/
│       ├── button.test.tsx
│       └── modal.test.tsx
├── hooks/
│   ├── use-auth.test.ts
│   ├── use-api.test.ts
│   └── use-mobile.test.ts
└── lib/
    ├── utils.test.ts
    ├── auth-utils.test.ts
    └── api-client.test.ts
```

**Best Practices**:
- Test component behavior, not implementation details
- Use semantic queries (getByRole, getByLabelText)
- Mock external dependencies
- Test error states and edge cases

### 2. Integration Tests (`tests/integration/`)

**Purpose**: Test component interactions and data flow

**Coverage**:
- ✅ Component integration with context providers
- ✅ Form submission and validation
- ✅ API client with real/mocked responses
- ✅ Route navigation and state management

**Example Structure**:
```
tests/integration/
├── auth-flow.test.tsx
├── session-management.test.tsx
├── insights-dashboard.test.tsx
└── api-integration.test.tsx
```

**Best Practices**:
- Test realistic user workflows
- Use MSW for API mocking
- Test loading and error states
- Verify data persistence

### 3. End-to-End Tests (`tests/e2e/`)

**Purpose**: Test complete user journeys across the application

**Coverage**:
- ✅ Authentication flow (login, logout, registration)
- ✅ Session creation and management
- ✅ Audio upload and transcription
- ✅ Insights generation and visualization
- ✅ Mobile responsiveness

**Example Structure**:
```
tests/e2e/
├── auth.spec.ts
├── sessions.spec.ts
├── insights.spec.ts
├── mobile.spec.ts
└── accessibility.spec.ts
```

**Best Practices**:
- Focus on critical user paths
- Test across different browsers
- Use page object model for maintainability
- Include accessibility testing

### 4. API Tests (`tests/api/`)

**Purpose**: Validate backend API connectivity and responses

**Coverage**:
- ✅ All API endpoints (33/33 endpoints)
- ✅ Authentication flow
- ✅ Error handling
- ✅ Response validation

**Example Structure**:
```
tests/api/
├── api-integration.test.js
├── auth-endpoints.test.js
├── sessions-endpoints.test.js
└── insights-endpoints.test.js
```

## 🚀 Running Tests

### Development Workflow

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run API integration tests
npm run test:api

# Type checking
npm run type-check
```

### CI/CD Pipeline

```bash
# CI test command
npm run test:ci

# Includes:
# - Unit tests with coverage
# - Integration tests
# - Type checking
# - Linting
```

## 📈 Coverage Goals

### Coverage Targets
- **Overall**: 80%+ line coverage
- **Components**: 85%+ line coverage
- **Utilities**: 90%+ line coverage
- **API Client**: 95%+ line coverage

### Coverage Reports
- **HTML Report**: `coverage/lcov-report/index.html`
- **LCOV**: `coverage/lcov.info`
- **JSON**: `coverage/coverage-final.json`

## 🔧 Configuration

### Jest Configuration (`jest.config.js`)
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}
```

### Playwright Configuration (`playwright.config.ts`)
```typescript
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
})
```

## 🎨 Testing Patterns

### Component Testing Pattern
```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SessionCard } from '@/components/sessions/session-card'

describe('SessionCard', () => {
  const mockSession = {
    id: '1',
    title: 'Test Session',
    date: '2024-01-01',
    status: 'completed'
  }

  it('should render session information', () => {
    render(<SessionCard session={mockSession} />)
    
    expect(screen.getByText('Test Session')).toBeInTheDocument()
    expect(screen.getByText('2024-01-01')).toBeInTheDocument()
  })

  it('should handle click events', async () => {
    const user = userEvent.setup()
    const onClickMock = jest.fn()
    
    render(<SessionCard session={mockSession} onClick={onClickMock} />)
    
    await user.click(screen.getByRole('button'))
    
    expect(onClickMock).toHaveBeenCalledWith(mockSession)
  })
})
```

### Hook Testing Pattern
```typescript
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '@/hooks/use-auth'

describe('useAuth', () => {
  it('should handle login', async () => {
    const { result } = renderHook(() => useAuth())
    
    await act(async () => {
      await result.current.login('test@example.com', 'password')
    })
    
    expect(result.current.user).toBeTruthy()
    expect(result.current.isAuthenticated).toBe(true)
  })
})
```

### E2E Testing Pattern
```typescript
import { test, expect } from '@playwright/test'

test('user can create a new session', async ({ page }) => {
  // Login
  await page.goto('/login')
  await page.fill('[data-testid="email"]', 'test@example.com')
  await page.fill('[data-testid="password"]', 'password')
  await page.click('[data-testid="login-button"]')
  
  // Navigate to sessions
  await page.goto('/sessions')
  
  // Create new session
  await page.click('[data-testid="new-session-button"]')
  await page.fill('[data-testid="session-title"]', 'Test Session')
  await page.click('[data-testid="create-button"]')
  
  // Verify session created
  await expect(page.locator('[data-testid="session-card"]')).toContainText('Test Session')
})
```

## 🔍 Testing Best Practices

### General Principles
1. **Write tests first** (TDD approach when possible)
2. **Test behavior, not implementation**
3. **Use descriptive test names**
4. **Keep tests simple and focused**
5. **Mock external dependencies**

### Component Testing
1. **Use semantic queries** (getByRole, getByLabelText)
2. **Test user interactions** (clicks, form submissions)
3. **Verify accessibility** (ARIA labels, keyboard navigation)
4. **Test error states** (loading, error boundaries)

### API Testing
1. **Test all endpoints** (happy path and error cases)
2. **Validate response schemas**
3. **Test authentication flows**
4. **Mock external services**

### E2E Testing
1. **Focus on critical paths** (user registration, core features)
2. **Use page object model** for maintainability
3. **Test across browsers** and devices
4. **Include visual regression testing**

## 📚 Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [MSW Documentation](https://mswjs.io/docs/)

### Testing Utilities
- [Testing Library Queries](https://testing-library.com/docs/queries/about/)
- [Jest Matchers](https://jestjs.io/docs/expect)
- [Playwright Assertions](https://playwright.dev/docs/test-assertions)

## 🎯 Next Steps

### Immediate Actions
1. **Install testing dependencies**: `npm install` (dependencies already added)
2. **Run initial tests**: `npm test`
3. **Set up CI/CD integration**
4. **Write first component tests**

### Future Enhancements
1. **Visual regression testing** with Playwright
2. **Performance testing** with Lighthouse CI
3. **Accessibility testing** automation
4. **Test data management** improvements

---

**Status**: ✅ **Testing infrastructure ready for implementation**

This testing strategy provides a solid foundation for maintaining code quality and ensuring reliable functionality across the Insight Journey frontend application. 