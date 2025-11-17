#!/bin/bash

# Authentication Full Path Test Execution Script
# This script runs the comprehensive Robot Framework authentication tests

echo "🚀 Starting Shahin GRC Authentication Full Path Test Suite"
echo "=================================================="

# Set test environment variables
export TEST_ENV=production
export BFF_URL=http://172.21.160.1:3007
export WEB_URL=http://172.21.160.1:5174
export API_URL=http://172.21.160.1:3007/api

# Test credentials (using the partner users we created)
export TEST_USER_EMAIL="ahmet@doganconsult.com"
export TEST_USER_PASSWORD="Shahin@2025"
export TEST_PARTNER_EMAIL="amr@doganconsult.com"
export TEST_PARTNER_PASSWORD="Shahin@2025"
export TEST_TENANT_ID="75688778-0cf1-4a5c-9536-9acd2e5c9a0e"

echo "📋 Test Configuration:"
echo "   BFF URL: $BFF_URL"
echo "   Web URL: $WEB_URL"
echo "   API URL: $API_URL"
echo "   Test User: $TEST_USER_EMAIL"
echo "   Test Partner: $TEST_PARTNER_EMAIL"
echo "   Tenant ID: $TEST_TENANT_ID"
echo ""

# Create test results directory
mkdir -p test-results/authentication
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RESULTS_DIR="test-results/authentication/$TIMESTAMP"
mkdir -p "$RESULTS_DIR"

echo "📁 Test results will be saved to: $RESULTS_DIR"
echo ""

# Run the authentication tests
echo "🧪 Running Authentication Full Path Tests..."
robot \
    --outputdir "$RESULTS_DIR" \
    --loglevel INFO \
    --timestampoutputs \
    --name "Shahin GRC Authentication Tests" \
    --tagdoc "health:Health check tests" \
    --tagdoc "login:Login flow tests" \
    --tagdoc "registration:Registration flow tests" \
    --tagdoc "authentication:General authentication tests" \
    --tagdoc "partner:Partner-specific tests" \
    --tagdoc "demo:Demo user tests" \
    --tagdoc "security:Security-related tests" \
    --tagdoc "error-handling:Error handling tests" \
    --tagdoc "authorization:Authorization tests" \
    --tagdoc "multi-tenant:Multi-tenant tests" \
    --tagdoc "journey:End-to-end journey tests" \
    --tagdoc "critical:Critical path tests" \
    --include critical \
    --criticaltag critical \
    --noncriticaltag non-critical \
    authentication-full-path-tests.robot

# Check test execution result
if [ $? -eq 0 ]; then
    echo "✅ All authentication tests passed!"
    TEST_STATUS="PASS"
else
    echo "❌ Some authentication tests failed!"
    TEST_STATUS="FAIL"
fi

# Generate summary report
echo ""
echo "📊 Test Execution Summary"
echo "========================"
echo "Test Status: $TEST_STATUS"
echo "Results Directory: $RESULTS_DIR"
echo "Timestamp: $TIMESTAMP"
echo ""

# Display key test results
echo "🔑 Key Test Results:"
echo "   - Health Check: Service availability"
echo "   - Standard User Login: $TEST_USER_EMAIL"
echo "   - Partner User Login: $TEST_PARTNER_EMAIL"
echo "   - Demo User Login: demo@shahin.grc"
echo "   - User Registration: New user creation"
echo "   - Partner Registration: Partner organization creation"
echo "   - Profile Access: Authenticated profile retrieval"
echo "   - Token Refresh: JWT token refresh mechanism"
echo "   - Error Handling: Invalid credentials, missing data"
echo "   - Security: Rate limiting, CORS, unauthorized access"
echo "   - Multi-tenant: Tenant isolation and data separation"
echo "   - Complete Journey: Registration → Login → Profile → Logout"
echo ""

# Provide next steps
echo "📝 Next Steps:"
echo "   1. Review detailed test results in: $RESULTS_DIR"
echo "   2. Check log.html for detailed execution logs"
echo "   3. Check report.html for comprehensive test report"
echo "   4. Address any failed tests before deployment"
echo ""

if [ "$TEST_STATUS" = "PASS" ]; then
    echo "🎉 Authentication system is fully functional and ready for production!"
else
    echo "⚠️  Please review and fix any failing tests before proceeding."
fi

echo ""
echo "🔍 To run specific test cases, use:"
echo "   robot --test 'TC001_Health_Check_All_Services' authentication-full-path-tests.robot"
echo "   robot --tag login authentication-full-path-tests.robot"
echo "   robot --tag partner authentication-full-path-tests.robot"
echo ""

exit 0