# Performance Baseline Testing - Phase 2
## Load Testing Configuration for GRC Platform

### Testing Strategy
We'll use Artillery.js for comprehensive load testing to establish performance baselines and identify bottlenecks.

### Installation & Setup
```bash
npm install -g artillery@latest
```

### Test Scenarios

#### 1. Authentication Endpoint Testing
```yaml
# auth-load-test.yml
config:
  target: http://localhost:3001
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Peak load"
  defaults:
    headers:
      Content-Type: application/json

scenarios:
  - name: "Authentication Flow"
    weight: 70
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "password123"
            tenant_id: "tenant1"
      - think: 2

  - name: "Health Check"
    weight: 30
    flow:
      - get:
          url: "/api/health"
```

#### 2. API Gateway (BFF) Load Test
```yaml
# bff-load-test.yml
config:
  target: http://localhost:3005
  phases:
    - duration: 60
      arrivalRate: 20
      name: "Ramp up"
    - duration: 180
      arrivalRate: 75
      name: "Sustained load"

scenarios:
  - name: "API Gateway Routes"
    flow:
      - get:
          url: "/api/grc-api/health"
      - think: 1
      - get:
          url: "/api/auth-service/health"
      - think: 1
```

#### 3. Database Performance Test
```yaml
# database-load-test.yml
config:
  target: http://localhost:3000
  phases:
    - duration: 120
      arrivalRate: 30
      name: "Database stress test"

scenarios:
  - name: "Data Retrieval"
    flow:
      - get:
          url: "/api/users"
          headers:
            Authorization: "Bearer fake-token-for-testing"
```

### Performance Metrics to Monitor

#### Response Time Targets
- **Authentication**: < 200ms (p95)
- **API Gateway**: < 150ms (p95)
- **Database Queries**: < 100ms (p95)
- **Health Checks**: < 50ms (p95)

#### Throughput Targets
- **Concurrent Users**: 1000+
- **Requests per Second**: 500+
- **Error Rate**: < 1%

#### Resource Utilization
- **Memory Usage**: < 80% of available
- **CPU Usage**: < 70% sustained
- **Database Connections**: < 80% of pool

### Monitoring During Tests
```bash
# Monitor Docker containers during load test
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

# Monitor database performance
docker exec docker-postgres-1 pg_stat_activity
```

### Expected Baseline Results
Based on the current architecture, we expect:

- **Single Service Response**: 50-150ms
- **Cross-Service Calls**: 100-300ms
- **Database Queries**: 10-50ms
- **Authentication**: 100-250ms

### Performance Bottleneck Identification
Common areas to monitor:
1. **Database Connection Pool**: Limited connections
2. **JWT Token Validation**: CPU intensive
3. **Cross-Service Communication**: Network latency
4. **Memory Leaks**: Gradual degradation

### Next Steps After Testing
1. Analyze results and identify bottlenecks
2. Optimize critical paths
3. Configure production load balancing
4. Set up auto-scaling thresholds
