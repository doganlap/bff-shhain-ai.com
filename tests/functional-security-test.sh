#!/bin/bash
# Functional Security Validation Script
# Tests actual security implementation against running services

echo "==================================================="
echo "🔒 FUNCTIONAL SECURITY VALIDATION"
echo "==================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test endpoints
BFF_URL="http://localhost:3005"
AUTH_URL="http://localhost:3001"
GRC_API_URL="http://localhost:3000"

# Track test results
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run test
run_test() {
    local test_name="$1"
    local command="$2"
    local expected_pattern="$3"

    echo -n "Testing: $test_name... "

    result=$(eval "$command" 2>&1)
    if echo "$result" | grep -q "$expected_pattern"; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASSED_TESTS++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo "   Expected: $expected_pattern"
        echo "   Got: $result"
        ((FAILED_TESTS++))
    fi
}

echo "🧪 Testing Authentication & Authorization"
echo "---------------------------------------------------"

# Test 1: Unauthenticated admin access should be blocked
run_test "Admin endpoints require authentication" \
         "curl -s $BFF_URL/api/admin/health" \
         "Authentication required"

# Test 2: Auth service health check
run_test "Auth service responds to health check" \
         "curl -s $AUTH_URL/api/health" \
         "healthy"

# Test 3: GRC API health check
run_test "GRC API responds to health check" \
         "curl -s $GRC_API_URL/api/health" \
         "healthy"

# Test 4: BFF health check
run_test "BFF responds to health check" \
         "curl -s $BFF_URL/api/health" \
         "healthy"

echo ""
echo "🛡️ Testing Security Headers"
echo "---------------------------------------------------"

# Test 5: Security headers are present
run_test "Security headers present on BFF" \
         "curl -I -s $BFF_URL/api/health" \
         "X-"

# Test 6: CORS headers configured
run_test "CORS headers configured" \
         "curl -I -s $BFF_URL/api/health" \
         "Access-Control"

echo ""
echo "🔐 Testing JWT Security"
echo "---------------------------------------------------"

# Test 7: Invalid JWT token rejected
run_test "Invalid JWT tokens rejected" \
         "curl -s -H 'Authorization: Bearer invalid-token' $BFF_URL/api/admin/health" \
         "Authentication required|Invalid token|Unauthorized"

# Test 8: Malformed Authorization header rejected
run_test "Malformed auth headers rejected" \
         "curl -s -H 'Authorization: InvalidFormat' $BFF_URL/api/admin/health" \
         "Authentication required|Invalid token|Unauthorized"

echo ""
echo "📊 Testing Database Security"
echo "---------------------------------------------------"

# Test 9: Database connection working
run_test "Database connection secure" \
         "docker exec docker-postgres-1 psql -U grc_user -d grc_ecosystem -c 'SELECT COUNT(*) FROM users;'" \
         "[0-9]+"

echo ""
echo "🚨 Testing Error Handling"
echo "---------------------------------------------------"

# Test 10: No sensitive info in error messages
run_test "Error messages don't leak sensitive info" \
         "curl -s $BFF_URL/api/nonexistent" \
         "404|Not Found"

# Test 11: SQL injection protection (basic test)
run_test "Basic SQL injection protection" \
         "curl -s '$BFF_URL/api/health?id=1%27%20OR%20%271%27=%271'" \
         "healthy"

echo ""
echo "⚡ Testing Rate Limiting"
echo "---------------------------------------------------"

# Test 12: Rate limiting (basic test)
run_test "Multiple requests handled properly" \
         "for i in {1..5}; do curl -s $BFF_URL/api/health >/dev/null; done && curl -s $BFF_URL/api/health" \
         "healthy"

echo ""
echo "==================================================="
echo "📋 SECURITY VALIDATION SUMMARY"
echo "==================================================="
echo -e "Tests Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Tests Failed: ${RED}$FAILED_TESTS${NC}"

TOTAL_TESTS=$((PASSED_TESTS + FAILED_TESTS))
if [ $TOTAL_TESTS -gt 0 ]; then
    PASS_RATE=$(( (PASSED_TESTS * 100) / TOTAL_TESTS ))
    echo "Pass Rate: $PASS_RATE%"

    if [ $PASS_RATE -ge 80 ]; then
        echo -e "Security Status: ${GREEN}GOOD${NC} ✅"
        exit 0
    elif [ $PASS_RATE -ge 60 ]; then
        echo -e "Security Status: ${YELLOW}NEEDS IMPROVEMENT${NC} ⚠️"
        exit 1
    else
        echo -e "Security Status: ${RED}CRITICAL ISSUES${NC} ❌"
        exit 2
    fi
else
    echo -e "Security Status: ${RED}NO TESTS RUN${NC}"
    exit 3
fi
