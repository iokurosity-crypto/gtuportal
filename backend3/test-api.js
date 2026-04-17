/**
 * API DIAGNOSTIC & TEST SUITE
 * Tests all backend endpoints end-to-end
 * Usage: node test-api.js
 */

const axios = require('axios');

const API_BASE = 'http://localhost:4000/api';

// Test data
const tests = {
  health: {
    name: 'Health Check',
    method: 'GET',
    url: 'http://localhost:4000/health'
  },
  listUsers: {
    name: 'List All Users',
    method: 'GET',
    url: `${API_BASE}/users`,
    requiresAuth: true
  },
  listAlumni: {
    name: 'List Alumni',
    method: 'GET',
    url: `${API_BASE}/alumni`
  },
  listOpportunities: {
    name: 'List Opportunities',
    method: 'GET',
    url: `${API_BASE}/opportunities`
  },
  listChallenges: {
    name: 'List Challenges',
    method: 'GET',
    url: `${API_BASE}/challenges`
  },
  listEvents: {
    name: 'List Events',
    method: 'GET',
    url: `${API_BASE}/events`
  },
  listStartups: {
    name: 'List Startups',
    method: 'GET',
    url: `${API_BASE}/startups`
  }
};

// Colors for console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset}  ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset}  ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset}  ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset}  ${msg}`)
};

// Test endpoints
const testEndpoint = async (name, method, url, options = {}) => {
  try {
    const config = {
      method,
      url,
      timeout: 5000,
      validateStatus: () => true // Don't throw on any status
    };
    
    if (options.headers) config.headers = options.headers;
    if (options.data) config.data = options.data;
    
    const startTime = Date.now();
    const response = await axios(config);
    const duration = Date.now() - startTime;
    
    const statusOk = response.status >= 200 && response.status < 300;
    
    if (statusOk) {
      const itemCount = Array.isArray(response.data) ? response.data.length : 
                       (response.data?.data?.length || 0);
      log.success(`${name} (${response.status}) ${itemCount > 0 ? `- ${itemCount} items` : ''} [${duration}ms]`);
      return { success: true, data: response.data };
    } else if (response.status === 404) {
      log.warn(`${name} (${response.status}) - Not Found [${duration}ms]`);
      return { success: false, error: 'Not Found' };
    } else if (response.status === 401) {
      log.warn(`${name} (${response.status}) - Unauthorized [${duration}ms]`);
      return { success: false, error: 'Unauthorized' };
    } else {
      log.error(`${name} (${response.status}) - ${response.data?.message || 'Unknown error'} [${duration}ms]`);
      return { success: false, error: response.data?.message };
    }
  } catch (error) {
    log.error(`${name} - ${error.message}`);
    return { success: false, error: error.message };
  }
};

// Main test runner
const runTests = async () => {
  console.log(`\n${colors.blue}╔════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║${colors.reset}  API ENDPOINT DIAGNOSTIC TEST SUITE                 ${colors.blue}║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════════════════════╝\n${colors.reset}`);
  
  log.info(`Testing ${Object.keys(tests).length} endpoints...`);
  console.log();
  
  const results = {};
  let successCount = 0;
  let failureCount = 0;
  
  // Test each endpoint
  for (const [key, test] of Object.entries(tests)) {
    const result = await testEndpoint(test.name, test.method, test.url);
    results[key] = result;
    
    if (result.success) successCount++;
    else failureCount++;
  }
  
  // Summary
  console.log(`\n${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}Successful: ${successCount}${colors.reset} | ${colors.red}Failed: ${failureCount}${colors.reset}\n`);
  
  // Detailed results
  if (failureCount > 0) {
    log.warn('Issues Found:');
    for (const [key, test] of Object.entries(tests)) {
      if (!results[key].success) {
        console.log(`  • ${test.name}: ${results[key].error}`);
      }
    }
    console.log();
  }
  
  // Recommendations
  console.log(`${colors.cyan}Recommendations:${colors.reset}`);
  console.log('  1. Ensure MongoDB is connected and accessible');
  console.log('  2. Check that database has sample data');
  console.log('  3. Verify .env file configuration');
  console.log('  4. Check backend logs for detailed errors');
  console.log();
};

// Run tests
runTests().catch(err => {
  log.error(`Test runner failed: ${err.message}`);
  process.exit(1);
});
