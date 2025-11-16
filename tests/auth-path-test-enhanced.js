/**
 * Enhanced Authentication Path Testing
 * Adds tests for Demo, POC, and Landing page login flows
 */

// Add to testSuites object in auth-path-test.js

async specialAccessPaths() {
  logSection('Testing Special Access Paths');
  
  const specialPaths = [
    { 
      path: '/', 
      description: 'Landing page (with login modal)',
      expectedStatus: [200, 301, 302]
    },
    { 
      path: '/demo', 
      description: 'Demo landing page',
      expectedStatus: [200, 301, 302]
    },
    { 
      path: '/demo/register', 
      description: 'Demo registration',
      expectedStatus: [200]
    },
    { 
      path: '/poc', 
      description: 'POC landing page',
      expectedStatus: [200, 301, 302]
    },
    { 
      path: '/poc/request', 
      description: 'POC request form',
      expectedStatus: [200]
    },
    { 
      path: '/partner', 
      description: 'Partner landing page',
      expectedStatus: [200, 301, 302]
    }
  ];

  for (const pathTest of specialPaths) {
    const url = `${BASE_URLS.web}${pathTest.path}`;
    const { response, duration, error } = await makeRequest({
      method: 'GET',
      url,
      maxRedirects: 5 // Allow redirects for special paths
    });

    if (error) {
      if (error.code === 'ECONNREFUSED') {
        logTest(pathTest.description, 'SKIP', `Frontend not running at ${BASE_URLS.web}`);
        testResults.skipped++;
      } else {
        logTest(pathTest.description, 'FAIL', `Error: ${error.message}`);
        recordTest(pathTest.description, false, error.message, pathTest.expectedStatus.join('/'), 'ERROR', duration);
      }
    } else {
      const status = response.status;
      const passed = pathTest.expectedStatus.includes(status);
      logTest(
        pathTest.description, 
        passed ? 'PASS' : 'FAIL', 
        `Status: ${status} - ${url} (${duration}ms)`
      );
      recordTest(pathTest.description, passed, url, pathTest.expectedStatus.join('/'), status, duration);
    }
  }
}

// Add this to the main runTests() function
// await testSuites.specialAccessPaths();
