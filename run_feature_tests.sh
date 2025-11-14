#!/bin/bash

# GRC Feature Test Runner
# Quick script to run feature tests with proper environment setup

echo "=============================================================="
echo "🧪 GRC FEATURE TEST RUNNER"
echo "=============================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check environment variables
echo -e "${CYAN}🔍 Checking environment...${NC}"

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL is not set${NC}"
    echo -e "${YELLOW}   Please set: export DATABASE_URL=postgresql://user:pass@localhost:5432/grc_db${NC}"
    exit 1
else
    # Mask password in output
    MASKED_URL=$(echo $DATABASE_URL | sed 's/:[^:]*@/:***@/')
    echo -e "${GREEN}✅ DATABASE_URL: $MASKED_URL${NC}"
fi

if [ -z "$API_BASE_URL" ]; then
    export API_BASE_URL="http://localhost:3006"
    echo -e "${YELLOW}⚠️  API_BASE_URL not set, using default: $API_BASE_URL${NC}"
else
    echo -e "${GREEN}✅ API_BASE_URL: $API_BASE_URL${NC}"
fi

echo ""

# Check if services are running
echo -e "${CYAN}🔍 Checking if services are running...${NC}"

if curl -s "$API_BASE_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ BFF service is running at $API_BASE_URL${NC}"
else
    echo -e "${YELLOW}⚠️  BFF service not reachable at $API_BASE_URL${NC}"
    echo -e "${YELLOW}   Tests may fail. Start services with: npm run start:bff${NC}"
fi

echo ""

# Parse command line arguments
TEST_TYPE="all"
if [ "$1" == "--auto-assessment" ] || [ "$1" == "-a" ]; then
    TEST_TYPE="auto-assessment"
elif [ "$1" == "--workflow" ] || [ "$1" == "-w" ]; then
    TEST_TYPE="workflow"
elif [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --auto-assessment, -a    Run auto-assessment tests only"
    echo "  --workflow, -w           Run workflow engine tests only"
    echo "  --help, -h               Show this help message"
    echo "  (no args)                Run all tests"
    echo ""
    echo "Examples:"
    echo "  $0                       # Run all tests"
    echo "  $0 --auto-assessment     # Run auto-assessment tests"
    echo "  $0 --workflow            # Run workflow tests"
    exit 0
fi

# Run tests based on selection
echo -e "${CYAN}🚀 Running tests: $TEST_TYPE${NC}"
echo ""

if [ "$TEST_TYPE" == "all" ]; then
    node tests/run_all_tests.js
elif [ "$TEST_TYPE" == "auto-assessment" ]; then
    node tests/test_auto_assessment_generator.js
elif [ "$TEST_TYPE" == "workflow" ]; then
    node tests/test_workflow_engine.js
fi

TEST_EXIT_CODE=$?

echo ""
echo "=============================================================="
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Tests completed successfully!${NC}"
else
    echo -e "${RED}❌ Tests failed with exit code $TEST_EXIT_CODE${NC}"
fi
echo "=============================================================="

exit $TEST_EXIT_CODE
