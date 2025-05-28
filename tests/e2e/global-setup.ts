import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🔧 Setting up E2E test environment...');
  
  // Create a browser instance for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for the application to be ready
    await page.goto(config.projects[0].use.baseURL || 'http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Create test user and authenticate
    const testUser = {
      email: `e2e_test_${Date.now()}@example.com`,
      password: 'TestPassword123!',
      name: 'E2E Test User'
    };
    
    // Store test user data for tests
    process.env.E2E_TEST_USER_EMAIL = testUser.email;
    process.env.E2E_TEST_USER_PASSWORD = testUser.password;
    process.env.E2E_TEST_USER_NAME = testUser.name;
    
    console.log('✅ E2E test environment ready');
    
  } catch (error) {
    console.error('❌ Failed to setup E2E test environment:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup; 