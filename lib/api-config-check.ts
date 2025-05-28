/**
 * API Configuration Checker
 * Verifies that the frontend is properly configured to use the real backend API
 */

// Backend API endpoints
export const API_ENDPOINTS = {
  PRODUCTION: "https://insight-journey-a47jf6g6sa-uc.a.run.app/api/v1",
  LOCAL: "http://localhost:8080/api/v1",
  PROXY: "/api/proxy"
};

// Configuration checker
export class APIConfigChecker {
  static getApiUrl(): string {
    // Check environment variables first
    if (typeof window !== 'undefined') {
      const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (envApiUrl) {
        console.log(`🔧 Using API URL from environment: ${envApiUrl}`);
        return envApiUrl;
      }
    }

    // Default to production for server-side or when no env var is set
    if (typeof window === 'undefined') {
      console.log(`🔧 Server-side rendering, using production API: ${API_ENDPOINTS.PRODUCTION}`);
      return API_ENDPOINTS.PRODUCTION;
    }

    // Client-side logic
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (isDevelopment && isLocalhost) {
      console.log(`🔧 Development mode detected, using proxy: ${API_ENDPOINTS.PROXY}`);
      return API_ENDPOINTS.PROXY;
    } else {
      console.log(`🔧 Production mode, using production API: ${API_ENDPOINTS.PRODUCTION}`);
      return API_ENDPOINTS.PRODUCTION;
    }
  }

  static isUsingMockData(): boolean {
    // Always return false - we never want to use mock data in production
    return false;
  }

  static validateConfiguration(): {
    isValid: boolean;
    apiUrl: string;
    usingMockData: boolean;
    warnings: string[];
    recommendations: string[];
  } {
    const apiUrl = this.getApiUrl();
    const usingMockData = this.isUsingMockData();
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check if using production API
    const isUsingProductionAPI = apiUrl.includes('insight-journey-a47jf6g6sa-uc.a.run.app');
    const isUsingProxy = apiUrl.includes('/api/proxy');

    if (usingMockData) {
      warnings.push("⚠️ Using mock data instead of real API");
      recommendations.push("Set USE_MOCK_DATA to false in api-client.ts");
    }

    if (!isUsingProductionAPI && !isUsingProxy) {
      warnings.push("⚠️ Not using production API or proxy");
      recommendations.push("Verify API_BASE_URL configuration");
    }

    // Verify all required endpoints are available
    const requiredEndpoints = [
      '/auth/login',
      '/auth/register',
      '/sessions',
      '/insights/turning-point',
      '/insights/correlations',
      '/insights/cascade-map',
      '/insights/future-prediction',
      '/transcription/upload'
    ];

    if (apiUrl === API_ENDPOINTS.PROXY) {
      recommendations.push("Using proxy for CORS handling - verify proxy forwards to production API");
    }

    const isValid = warnings.length === 0;

    return {
      isValid,
      apiUrl,
      usingMockData,
      warnings,
      recommendations
    };
  }

  static async testAPIConnection(): Promise<{
    connected: boolean;
    apiUrl: string;
    responseTime: number;
    error?: string;
  }> {
    const apiUrl = this.getApiUrl();
    const startTime = Date.now();

    try {
      const testUrl = apiUrl.includes('/api/proxy') 
        ? `${apiUrl}/health` 
        : `${apiUrl}/health`;

      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const responseTime = Date.now() - startTime;
      const connected = response.ok;

      return {
        connected,
        apiUrl,
        responseTime,
        error: connected ? undefined : `HTTP ${response.status}: ${response.statusText}`
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        connected: false,
        apiUrl,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static logConfiguration(): void {
    console.log('\n🔍 API Configuration Check');
    console.log('========================');
    
    const config = this.validateConfiguration();
    
    console.log(`📡 API URL: ${config.apiUrl}`);
    console.log(`🎭 Using Mock Data: ${config.usingMockData ? 'YES' : 'NO'}`);
    console.log(`✅ Configuration Valid: ${config.isValid ? 'YES' : 'NO'}`);
    
    if (config.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      config.warnings.forEach(warning => console.log(`  ${warning}`));
    }
    
    if (config.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      config.recommendations.forEach(rec => console.log(`  ${rec}`));
    }

    // Test connection
    this.testAPIConnection().then(result => {
      console.log('\n🌐 Connection Test:');
      console.log(`  Connected: ${result.connected ? 'YES' : 'NO'}`);
      console.log(`  Response Time: ${result.responseTime}ms`);
      if (result.error) {
        console.log(`  Error: ${result.error}`);
      }
    });
  }
}

// Auto-run configuration check in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    APIConfigChecker.logConfiguration();
  }, 1000);
}

export default APIConfigChecker; 