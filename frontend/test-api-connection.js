#!/usr/bin/env node

/**
 * API Communication Test Script
 * 
 * This script tests the communication between frontend and backend
 * by making actual HTTP requests to the API endpoints.
 */

require('dotenv').config();
const axios = require('axios');

class APICommunicationTest {
  constructor() {
    this.backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
    this.timeout = 10000; // 10 seconds
  }

  /**
   * Test basic backend connectivity
   */
  async testBackendConnectivity() {
    try {
      console.log(`🔗 Testing backend connectivity: ${this.backendUrl}`);
      
      const response = await axios.get(`${this.backendUrl}/`, {
        timeout: this.timeout,
        validateStatus: () => true // Accept any status code
      });

      return {
        success: true,
        message: "✅ Backend is reachable",
        details: {
          url: this.backendUrl,
          status: response.status,
          statusText: response.statusText,
          responseTime: response.headers['x-response-time'] || 'N/A'
        }
      };
    } catch (error) {
      let errorType = 'UNKNOWN_ERROR';
      let suggestion = 'Check backend configuration';

      if (error.code === 'ECONNREFUSED') {
        errorType = 'CONNECTION_REFUSED';
        suggestion = 'Backend server is not running. Start it with: npm run dev:server';
      } else if (error.code === 'ENOTFOUND') {
        errorType = 'DNS_ERROR';
        suggestion = 'Check REACT_APP_BACKEND_URL in frontend/.env';
      } else if (error.code === 'ETIMEDOUT') {
        errorType = 'TIMEOUT';
        suggestion = 'Backend is taking too long to respond';
      }

      return {
        success: false,
        message: "❌ Backend is not reachable",
        details: {
          url: this.backendUrl,
          error: error.message,
          errorType,
          suggestion
        }
      };
    }
  }

  /**
   * Test login endpoint specifically
   */
  async testLoginEndpoint() {
    try {
      console.log(`🔐 Testing login endpoint: ${this.backendUrl}/auth/login`);
      
      // Test with invalid credentials first (should return 401)
      const response = await axios.post(`${this.backendUrl}/auth/login`, {
        email: 'test@test.com',
        password: 'invalid'
      }, {
        timeout: this.timeout,
        validateStatus: () => true, // Accept any status code
        withCredentials: true
      });

      if (response.status === 401) {
        return {
          success: true,
          message: "✅ Login endpoint is working (returns 401 for invalid credentials)",
          details: {
            url: `${this.backendUrl}/auth/login`,
            status: response.status,
            expectedBehavior: 'Returns 401 for invalid credentials'
          }
        };
      } else {
        return {
          success: false,
          message: "⚠️ Login endpoint responds but with unexpected status",
          details: {
            url: `${this.backendUrl}/auth/login`,
            status: response.status,
            expectedStatus: 401,
            response: response.data
          }
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "❌ Login endpoint is not accessible",
        details: {
          url: `${this.backendUrl}/auth/login`,
          error: error.message,
          suggestion: 'Check if backend routes are properly configured'
        }
      };
    }
  }

  /**
   * Test actual login with default credentials
   */
  async testDefaultLogin() {
    try {
      console.log(`🔑 Testing login with default credentials`);
      
      const response = await axios.post(`${this.backendUrl}/auth/login`, {
        email: 'admin@admin.com',
        password: '123456'
      }, {
        timeout: this.timeout,
        validateStatus: () => true,
        withCredentials: true
      });

      if (response.status === 200 && response.data.token) {
        return {
          success: true,
          message: "✅ Default login successful",
          details: {
            email: 'admin@admin.com',
            status: response.status,
            hasToken: !!response.data.token,
            hasUser: !!response.data.user,
            userId: response.data.user?.id,
            userProfile: response.data.user?.profile
          }
        };
      } else if (response.status === 401) {
        return {
          success: false,
          message: "❌ Default login failed - invalid credentials",
          details: {
            email: 'admin@admin.com',
            status: response.status,
            error: response.data,
            suggestion: 'Check if default user exists in database'
          }
        };
      } else {
        return {
          success: false,
          message: "❌ Default login failed - unexpected response",
          details: {
            email: 'admin@admin.com',
            status: response.status,
            response: response.data
          }
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "❌ Default login request failed",
        details: {
          email: 'admin@admin.com',
          error: error.message,
          suggestion: 'Check network connectivity and backend status'
        }
      };
    }
  }

  /**
   * Test CORS configuration
   */
  async testCORS() {
    try {
      console.log(`🌐 Testing CORS configuration`);
      
      // Make a preflight request
      const response = await axios.options(`${this.backendUrl}/auth/login`, {
        timeout: this.timeout,
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        },
        validateStatus: () => true
      });

      const corsHeaders = {
        'access-control-allow-origin': response.headers['access-control-allow-origin'],
        'access-control-allow-methods': response.headers['access-control-allow-methods'],
        'access-control-allow-credentials': response.headers['access-control-allow-credentials']
      };

      const hasCORS = Object.values(corsHeaders).some(header => header !== undefined);

      if (hasCORS) {
        return {
          success: true,
          message: "✅ CORS is configured",
          details: {
            corsHeaders,
            allowsCredentials: corsHeaders['access-control-allow-credentials'] === 'true'
          }
        };
      } else {
        return {
          success: false,
          message: "❌ CORS may not be properly configured",
          details: {
            corsHeaders,
            suggestion: 'Check CORS configuration in backend'
          }
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "❌ CORS test failed",
        details: {
          error: error.message,
          suggestion: 'Backend may not be running or CORS is misconfigured'
        }
      };
    }
  }

  /**
   * Check environment configuration
   */
  checkEnvironment() {
    const requiredVars = ['REACT_APP_BACKEND_URL'];
    const missing = requiredVars.filter(varName => !process.env[varName]);
    const present = requiredVars.filter(varName => process.env[varName]);

    if (missing.length > 0) {
      return {
        success: false,
        message: "❌ Missing required environment variables",
        details: {
          missing,
          present,
          suggestion: "Create frontend/.env file with REACT_APP_BACKEND_URL"
        }
      };
    }

    return {
      success: true,
      message: "✅ Frontend environment variables are set",
      details: {
        backendUrl: process.env.REACT_APP_BACKEND_URL,
        variables: present
      }
    };
  }

  /**
   * Run complete API communication test
   */
  async runFullTest() {
    console.log("🔍 Starting API Communication Test...\n");

    const results = [];

    // Environment check
    console.log("1. Frontend Environment Configuration:");
    const envResult = this.checkEnvironment();
    console.log(`   ${envResult.message}`);
    if (envResult.details) {
      console.log(`   Details:`, JSON.stringify(envResult.details, null, 2));
    }
    console.log();
    results.push(envResult);

    if (!envResult.success) {
      console.log("❌ Cannot proceed without proper environment configuration");
      return;
    }

    // Backend connectivity
    console.log("2. Backend Connectivity:");
    const connectivityResult = await this.testBackendConnectivity();
    console.log(`   ${connectivityResult.message}`);
    if (connectivityResult.details) {
      console.log(`   Details:`, JSON.stringify(connectivityResult.details, null, 2));
    }
    console.log();
    results.push(connectivityResult);

    if (!connectivityResult.success) {
      console.log("❌ Cannot proceed without backend connectivity");
      return;
    }

    // Login endpoint test
    console.log("3. Login Endpoint Test:");
    const loginEndpointResult = await this.testLoginEndpoint();
    console.log(`   ${loginEndpointResult.message}`);
    if (loginEndpointResult.details) {
      console.log(`   Details:`, JSON.stringify(loginEndpointResult.details, null, 2));
    }
    console.log();
    results.push(loginEndpointResult);

    // CORS test
    console.log("4. CORS Configuration:");
    const corsResult = await this.testCORS();
    console.log(`   ${corsResult.message}`);
    if (corsResult.details) {
      console.log(`   Details:`, JSON.stringify(corsResult.details, null, 2));
    }
    console.log();
    results.push(corsResult);

    // Default login test
    console.log("5. Default Login Test:");
    const defaultLoginResult = await this.testDefaultLogin();
    console.log(`   ${defaultLoginResult.message}`);
    if (defaultLoginResult.details) {
      console.log(`   Details:`, JSON.stringify(defaultLoginResult.details, null, 2));
    }
    console.log();
    results.push(defaultLoginResult);

    // Summary
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    console.log("📊 API Communication Test Summary:");
    console.log(`   Passed: ${successCount}/${totalCount} tests`);
    
    if (successCount === totalCount) {
      console.log("   🎉 All tests passed! Frontend should be able to communicate with backend.");
      console.log("   📧 Try logging in with: admin@admin.com");
      console.log("   🔑 Password: 123456");
    } else {
      console.log("   ⚠️  Issues found. Recommendations:");
      
      results.forEach((result, index) => {
        if (!result.success && result.details?.suggestion) {
          console.log(`   • Test ${index + 1}: ${result.details.suggestion}`);
        }
      });
    }
  }
}

// CLI execution
if (require.main === module) {
  const tester = new APICommunicationTest();
  tester.runFullTest().catch(error => {
    console.error('❌ API test failed:', error.message);
    process.exit(1);
  });
}

module.exports = APICommunicationTest;