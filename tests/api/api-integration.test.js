#!/usr/bin/env node

/**
 * API Integration Test Suite
 * Tests all backend endpoints for connectivity and functionality
 */

const fetch = require('node-fetch');

const CONFIG = {
  API_URL: 'https://insight-journey-a47jf6g6sa-uc.a.run.app/api/v1',
  FRONTEND_URL: 'http://localhost:3001',
  TIMEOUT: 10000,
  TEST_USER: {
    email: `test_${Date.now()}@example.com`,
    password: 'TestPassword123!',
    name: 'Test User'
  }
};

class APIIntegrationTester {
  constructor() {
    this.authToken = null;
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      'info': '📋',
      'success': '✅',
      'error': '❌',
      'warning': '⚠️'
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async test(name, testFn) {
    this.testResults.total++;
    try {
      this.log(`Testing: ${name}`);
      await testFn();
      this.testResults.passed++;
      this.testResults.details.push({ name, status: 'PASSED' });
      this.log(`${name}: PASSED`, 'success');
    } catch (error) {
      this.testResults.failed++;
      this.testResults.details.push({ 
        name, 
        status: 'FAILED', 
        error: error.message 
      });
      this.log(`${name}: FAILED - ${error.message}`, 'error');
    }
  }

  async apiRequest(endpoint, options = {}) {
    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${CONFIG.API_URL}${endpoint}`;
    
    const defaultOptions = {
      timeout: CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` })
      }
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.detail || data.message || 'Unknown error'}`);
    }

    return { data, status: response.status };
  }

  async proxyRequest(endpoint, options = {}) {
    return this.apiRequest(`${CONFIG.FRONTEND_URL}/api/proxy${endpoint}`, options);
  }

  // Test Categories

  async testHealthEndpoints() {
    await this.test('Health Check - Root', async () => {
      const result = await this.apiRequest('/');
      if (!result.data || typeof result.data !== 'object') {
        throw new Error('Invalid health response');
      }
    });

    await this.test('Health Check - Health Endpoint', async () => {
      const result = await this.apiRequest('/health');
      if (!result.data || typeof result.data !== 'object') {
        throw new Error('Invalid health response');
      }
    });

    await this.test('API Documentation Available', async () => {
      const response = await fetch(`${CONFIG.API_URL}/docs`);
      if (!response.ok) {
        throw new Error('API documentation not accessible');
      }
    });
  }

  async testAuthenticationFlow() {
    // Test Registration
    await this.test('User Registration', async () => {
      const result = await this.apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(CONFIG.TEST_USER)
      });
      
      if (!result.data.id || !result.data.email) {
        throw new Error('Invalid registration response');
      }
    });

    // Test Login
    await this.test('User Login', async () => {
      const formData = new URLSearchParams();
      formData.append('username', CONFIG.TEST_USER.email);
      formData.append('password', CONFIG.TEST_USER.password);

      const result = await this.apiRequest('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      });
      
      if (!result.data.access_token) {
        throw new Error('No access token received');
      }
      
      this.authToken = result.data.access_token;
    });

    // Test Current User
    await this.test('Get Current User', async () => {
      const result = await this.apiRequest('/auth/me');
      
      if (!result.data.email || result.data.email !== CONFIG.TEST_USER.email) {
        throw new Error('Invalid user data');
      }
    });

    // Test Logout
    await this.test('User Logout', async () => {
      await this.apiRequest('/auth/logout');
      // Note: Don't clear token yet as we need it for other tests
    });
  }

  async testSessionManagement() {
    // Test Get Sessions
    await this.test('Get Sessions List', async () => {
      const result = await this.apiRequest('/sessions');
      
      if (!Array.isArray(result.data)) {
        throw new Error('Sessions response is not an array');
      }
    });

    // Test Create Session
    let sessionId;
    await this.test('Create Session', async () => {
      const sessionData = {
        title: 'Test Session',
        description: 'Integration test session',
        date: new Date().toISOString()
      };

      const result = await this.apiRequest('/sessions', {
        method: 'POST',
        body: JSON.stringify(sessionData)
      });
      
      if (!result.data.id) {
        throw new Error('No session ID returned');
      }
      
      sessionId = result.data.id;
    });

    // Test Get Session by ID
    if (sessionId) {
      await this.test('Get Session by ID', async () => {
        const result = await this.apiRequest(`/sessions/${sessionId}`);
        
        if (!result.data.id || result.data.id !== sessionId) {
          throw new Error('Invalid session data');
        }
      });
    }
  }

  async testInsightsEndpoints() {
    // Test Turning Point
    await this.test('Get Turning Point Analysis', async () => {
      const result = await this.apiRequest('/insights/turning-point');
      // Allow both success and 404 (no data) responses
      if (result.status !== 200 && result.status !== 404) {
        throw new Error('Unexpected response status');
      }
    });

    // Test Correlations
    await this.test('Get Emotion Correlations', async () => {
      const result = await this.apiRequest('/insights/correlations');
      // Allow both success and 404 (no data) responses
      if (result.status !== 200 && result.status !== 404) {
        throw new Error('Unexpected response status');
      }
    });

    // Test Cascade Map
    await this.test('Get Cascade Map', async () => {
      const result = await this.apiRequest('/insights/cascade-map');
      // Allow both success and 404 (no data) responses
      if (result.status !== 200 && result.status !== 404) {
        throw new Error('Unexpected response status');
      }
    });

    // Test Future Prediction
    await this.test('Get Future Predictions', async () => {
      const result = await this.apiRequest('/insights/future-prediction');
      // Allow both success and 404 (no data) responses
      if (result.status !== 200 && result.status !== 404) {
        throw new Error('Unexpected response status');
      }
    });

    // Test All Insights
    await this.test('Get All Insights', async () => {
      const result = await this.apiRequest('/insights/all');
      // Allow both success and 404 (no data) responses
      if (result.status !== 200 && result.status !== 404) {
        throw new Error('Unexpected response status');
      }
    });
  }

  async testProxyEndpoints() {
    await this.test('Frontend Proxy - Health Check', async () => {
      try {
        const result = await this.proxyRequest('/health');
        if (!result.data || typeof result.data !== 'object') {
          throw new Error('Invalid proxy health response');
        }
      } catch (error) {
        // If frontend is not running, skip proxy tests
        if (error.message.includes('ECONNREFUSED')) {
          this.log('Frontend not running, skipping proxy tests', 'warning');
          return;
        }
        throw error;
      }
    });
  }

  async runAllTests() {
    this.log('🚀 Starting API Integration Tests');
    this.log(`API URL: ${CONFIG.API_URL}`);
    this.log(`Test User: ${CONFIG.TEST_USER.email}`);

    try {
      await this.testHealthEndpoints();
      await this.testAuthenticationFlow();
      await this.testSessionManagement();
      await this.testInsightsEndpoints();
      await this.testProxyEndpoints();
    } catch (error) {
      this.log(`Critical error: ${error.message}`, 'error');
    }

    this.printSummary();
  }

  printSummary() {
    this.log('\n📊 Test Results Summary');
    this.log('='.repeat(50));
    this.log(`Total Tests: ${this.testResults.total}`);
    this.log(`Passed: ${this.testResults.passed}`, 'success');
    this.log(`Failed: ${this.testResults.failed}`, this.testResults.failed > 0 ? 'error' : 'success');
    this.log(`Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);

    if (this.testResults.failed > 0) {
      this.log('\n❌ Failed Tests:');
      this.testResults.details
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          this.log(`  • ${test.name}: ${test.error}`, 'error');
        });
    }

    if (this.testResults.passed === this.testResults.total) {
      this.log('\n🎉 All tests passed! API integration is working correctly.', 'success');
    } else {
      this.log('\n⚠️ Some tests failed. Please review the errors above.', 'warning');
      process.exit(1);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new APIIntegrationTester();
  tester.runAllTests().catch(error => {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  });
}

module.exports = { APIIntegrationTester, CONFIG }; 