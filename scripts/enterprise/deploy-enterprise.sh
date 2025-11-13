#!/bin/bash

# =====================================================
# ENTERPRISE DEPLOYMENT SCRIPT
# Deploys the complete GRC platform with all enterprise features
# =====================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="grc-production"
DOCKER_REGISTRY="${DOCKER_REGISTRY:-grc-platform}"
VERSION="${VERSION:-latest}"
ENVIRONMENT="${ENVIRONMENT:-production}"

echo -e "${BLUE}🚀 Starting Enterprise GRC Platform Deployment${NC}"
echo "======================================================"
echo "Environment: $ENVIRONMENT"
echo "Namespace: $NAMESPACE"
echo "Registry: $DOCKER_REGISTRY"
echo "Version: $VERSION"
echo "======================================================"

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check prerequisites
check_prerequisites() {
    echo -e "${BLUE}📋 Checking prerequisites...${NC}"
    
    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed"
        exit 1
    fi
    
    # Check if docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "docker is not installed"
        exit 1
    fi
    
    # Check if helm is installed
    if ! command -v helm &> /dev/null; then
        print_error "helm is not installed"
        exit 1
    fi
    
    # Check cluster connection
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    print_status "All prerequisites met"
}

# Function to create namespace
create_namespace() {
    echo -e "${BLUE}🏗️ Creating namespace...${NC}"
    
    kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
    
    # Label namespace
    kubectl label namespace $NAMESPACE environment=$ENVIRONMENT --overwrite
    kubectl label namespace $NAMESPACE app=grc-platform --overwrite
    
    print_status "Namespace $NAMESPACE created/updated"
}

# Function to deploy infrastructure components
deploy_infrastructure() {
    echo -e "${BLUE}🏗️ Deploying infrastructure components...${NC}"
    
    # PostgreSQL
    echo "Deploying PostgreSQL..."
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm repo update
    
    helm upgrade --install postgresql bitnami/postgresql \
        --namespace $NAMESPACE \
        --set auth.postgresPassword=grc-postgres-password \
        --set auth.database=grc_production \
        --set primary.persistence.size=100Gi \
        --set primary.resources.requests.memory=2Gi \
        --set primary.resources.requests.cpu=1000m \
        --wait
    
    # Redis
    echo "Deploying Redis..."
    helm upgrade --install redis bitnami/redis \
        --namespace $NAMESPACE \
        --set auth.password=grc-redis-password \
        --set master.persistence.size=20Gi \
        --wait
    
    # Elasticsearch
    echo "Deploying Elasticsearch..."
    helm repo add elastic https://helm.elastic.co
    helm repo update
    
    helm upgrade --install elasticsearch elastic/elasticsearch \
        --namespace $NAMESPACE \
        --set replicas=3 \
        --set volumeClaimTemplate.resources.requests.storage=50Gi \
        --set resources.requests.memory=2Gi \
        --set resources.requests.cpu=1000m \
        --wait
    
    # Qdrant (Vector Database)
    echo "Deploying Qdrant..."
    kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: qdrant
  namespace: $NAMESPACE
spec:
  replicas: 1
  selector:
    matchLabels:
      app: qdrant
  template:
    metadata:
      labels:
        app: qdrant
    spec:
      containers:
      - name: qdrant
        image: qdrant/qdrant:latest
        ports:
        - containerPort: 6333
        - containerPort: 6334
        volumeMounts:
        - name: qdrant-storage
          mountPath: /qdrant/storage
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
      volumes:
      - name: qdrant-storage
        persistentVolumeClaim:
          claimName: qdrant-pvc
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: qdrant-pvc
  namespace: $NAMESPACE
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 50Gi
---
apiVersion: v1
kind: Service
metadata:
  name: qdrant
  namespace: $NAMESPACE
spec:
  selector:
    app: qdrant
  ports:
  - name: http
    port: 6333
    targetPort: 6333
  - name: grpc
    port: 6334
    targetPort: 6334
EOF
    
    print_status "Infrastructure components deployed"
}

# Function to build and push Docker images
build_and_push_images() {
    echo -e "${BLUE}🐳 Building and pushing Docker images...${NC}"
    
    # Services to build
    services=("bff" "grc-api" "auth-service" "document-service" "partner-service" "notification-service" "rag-service" "monitoring-service" "ai-scheduler-service")
    
    for service in "${services[@]}"; do
        echo "Building $service..."
        
        # Build image
        docker build -t $DOCKER_REGISTRY/$service:$VERSION apps/services/$service/ || \
        docker build -t $DOCKER_REGISTRY/$service:$VERSION apps/$service/
        
        # Push image
        docker push $DOCKER_REGISTRY/$service:$VERSION
        
        print_status "$service image built and pushed"
    done
    
    # Build frontend
    echo "Building frontend..."
    docker build -t $DOCKER_REGISTRY/frontend:$VERSION apps/web/
    docker push $DOCKER_REGISTRY/frontend:$VERSION
    
    print_status "All images built and pushed"
}

# Function to deploy secrets
deploy_secrets() {
    echo -e "${BLUE}🔐 Deploying secrets...${NC}"
    
    kubectl create secret generic grc-secrets \
        --namespace=$NAMESPACE \
        --from-literal=database-url="postgresql://postgres:grc-postgres-password@postgresql:5432/grc_production" \
        --from-literal=redis-url="redis://:grc-redis-password@redis:6379" \
        --from-literal=elasticsearch-url="http://elasticsearch:9200" \
        --from-literal=qdrant-url="http://qdrant:6333" \
        --from-literal=jwt-secret="$(openssl rand -base64 32)" \
        --from-literal=openai-api-key="${OPENAI_API_KEY:-}" \
        --from-literal=azure-ad-client-id="${AZURE_AD_CLIENT_ID:-}" \
        --from-literal=azure-ad-client-secret="${AZURE_AD_CLIENT_SECRET:-}" \
        --dry-run=client -o yaml | kubectl apply -f -
    
    print_status "Secrets deployed"
}

# Function to deploy application services
deploy_services() {
    echo -e "${BLUE}🚀 Deploying application services...${NC}"
    
    # Deploy each service
    services=("grc-api" "auth-service" "document-service" "partner-service" "notification-service" "rag-service" "monitoring-service" "ai-scheduler-service")
    
    for service in "${services[@]}"; do
        echo "Deploying $service..."
        
        kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: $service
  namespace: $NAMESPACE
  labels:
    app: $service
    version: $VERSION
spec:
  replicas: 2
  selector:
    matchLabels:
      app: $service
  template:
    metadata:
      labels:
        app: $service
        version: $VERSION
    spec:
      containers:
      - name: $service
        image: $DOCKER_REGISTRY/$service:$VERSION
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: grc-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: grc-secrets
              key: redis-url
        - name: ELASTICSEARCH_URL
          valueFrom:
            secretKeyRef:
              name: grc-secrets
              key: elasticsearch-url
        - name: QDRANT_URL
          valueFrom:
            secretKeyRef:
              name: grc-secrets
              key: qdrant-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: grc-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /healthz
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /readyz
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: $service
  namespace: $NAMESPACE
spec:
  selector:
    app: $service
  ports:
  - port: 3000
    targetPort: 3000
  type: ClusterIP
EOF
        
        print_status "$service deployed"
    done
}

# Function to deploy BFF
deploy_bff() {
    echo -e "${BLUE}🌐 Deploying BFF (Backend for Frontend)...${NC}"
    
    kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bff
  namespace: $NAMESPACE
  labels:
    app: bff
    version: $VERSION
spec:
  replicas: 3
  selector:
    matchLabels:
      app: bff
  template:
    metadata:
      labels:
        app: bff
        version: $VERSION
    spec:
      containers:
      - name: bff
        image: $DOCKER_REGISTRY/bff:$VERSION
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: GRC_API_URL
          value: "http://grc-api:3000"
        - name: AUTH_SERVICE_URL
          value: "http://auth-service:3000"
        - name: DOCUMENT_SERVICE_URL
          value: "http://document-service:3000"
        - name: PARTNER_SERVICE_URL
          value: "http://partner-service:3000"
        - name: NOTIFICATION_SERVICE_URL
          value: "http://notification-service:3000"
        - name: RAG_SERVICE_URL
          value: "http://rag-service:3000"
        - name: MONITORING_SERVICE_URL
          value: "http://monitoring-service:3000"
        - name: AI_SCHEDULER_SERVICE_URL
          value: "http://ai-scheduler-service:3000"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /healthz
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /readyz
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: bff
  namespace: $NAMESPACE
spec:
  selector:
    app: bff
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: bff-hpa
  namespace: $NAMESPACE
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: bff
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
EOF
    
    print_status "BFF deployed with auto-scaling"
}

# Function to deploy frontend
deploy_frontend() {
    echo -e "${BLUE}🎨 Deploying frontend...${NC}"
    
    kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: $NAMESPACE
  labels:
    app: frontend
    version: $VERSION
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
        version: $VERSION
    spec:
      containers:
      - name: frontend
        image: $DOCKER_REGISTRY/frontend:$VERSION
        ports:
        - containerPort: 80
        env:
        - name: VITE_API_URL
          value: "http://bff"
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: $NAMESPACE
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
EOF
    
    print_status "Frontend deployed"
}

# Function to deploy ingress
deploy_ingress() {
    echo -e "${BLUE}🌐 Deploying ingress...${NC}"
    
    kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: grc-ingress
  namespace: $NAMESPACE
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
spec:
  tls:
  - hosts:
    - grc.yourdomain.com
    - api.grc.yourdomain.com
    secretName: grc-tls
  rules:
  - host: grc.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
  - host: api.grc.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: bff
            port:
              number: 80
EOF
    
    print_status "Ingress deployed"
}

# Function to deploy monitoring
deploy_monitoring() {
    echo -e "${BLUE}📊 Deploying monitoring stack...${NC}"
    
    # Prometheus
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo update
    
    helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
        --namespace $NAMESPACE \
        --set prometheus.prometheusSpec.retention=30d \
        --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=50Gi \
        --set grafana.adminPassword=grc-grafana-password \
        --wait
    
    print_status "Monitoring stack deployed"
}

# Function to run database migrations
run_migrations() {
    echo -e "${BLUE}🗄️ Running database migrations...${NC}"
    
    # Wait for database to be ready
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=postgresql -n $NAMESPACE --timeout=300s
    
    # Run migrations
    kubectl run migration-job --image=$DOCKER_REGISTRY/grc-api:$VERSION \
        --namespace=$NAMESPACE \
        --restart=Never \
        --env="DATABASE_URL=$(kubectl get secret grc-secrets -n $NAMESPACE -o jsonpath='{.data.database-url}' | base64 -d)" \
        --command -- npm run migrate
    
    # Wait for migration to complete
    kubectl wait --for=condition=complete job/migration-job -n $NAMESPACE --timeout=300s
    
    # Clean up migration job
    kubectl delete job migration-job -n $NAMESPACE
    
    print_status "Database migrations completed"
}

# Function to populate initial data
populate_initial_data() {
    echo -e "${BLUE}📊 Populating initial data...${NC}"
    
    # Run the enterprise control population script
    kubectl run data-population-job --image=$DOCKER_REGISTRY/grc-api:$VERSION \
        --namespace=$NAMESPACE \
        --restart=Never \
        --env="DATABASE_URL=$(kubectl get secret grc-secrets -n $NAMESPACE -o jsonpath='{.data.database-url}' | base64 -d)" \
        --command -- mysql -h postgresql -u postgres -p"grc-postgres-password" grc_production < /app/scripts/enterprise/populate-complete-controls.sql
    
    kubectl wait --for=condition=complete job/data-population-job -n $NAMESPACE --timeout=600s
    kubectl delete job data-population-job -n $NAMESPACE
    
    print_status "Initial data populated"
}

# Function to verify deployment
verify_deployment() {
    echo -e "${BLUE}🔍 Verifying deployment...${NC}"
    
    # Check all pods are running
    echo "Checking pod status..."
    kubectl get pods -n $NAMESPACE
    
    # Wait for all deployments to be ready
    kubectl wait --for=condition=available deployment --all -n $NAMESPACE --timeout=300s
    
    # Check services
    echo "Checking services..."
    kubectl get services -n $NAMESPACE
    
    # Check ingress
    echo "Checking ingress..."
    kubectl get ingress -n $NAMESPACE
    
    print_status "Deployment verification completed"
}

# Function to display access information
display_access_info() {
    echo -e "${BLUE}🎉 Deployment completed successfully!${NC}"
    echo "======================================================"
    echo "Access Information:"
    echo "- Frontend: https://grc.yourdomain.com"
    echo "- API: https://api.grc.yourdomain.com"
    echo "- Grafana: http://$(kubectl get svc prometheus-grafana -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}'):3000"
    echo "  - Username: admin"
    echo "  - Password: grc-grafana-password"
    echo ""
    echo "Next Steps:"
    echo "1. Update DNS records to point to your ingress IP"
    echo "2. Configure SSL certificates"
    echo "3. Set up backup procedures"
    echo "4. Configure monitoring alerts"
    echo "5. Set up user accounts and permissions"
    echo "======================================================"
}

# Main deployment flow
main() {
    check_prerequisites
    create_namespace
    deploy_infrastructure
    build_and_push_images
    deploy_secrets
    deploy_services
    deploy_bff
    deploy_frontend
    deploy_ingress
    deploy_monitoring
    run_migrations
    populate_initial_data
    verify_deployment
    display_access_info
}

# Handle script arguments
case "${1:-}" in
    "infrastructure")
        check_prerequisites
        create_namespace
        deploy_infrastructure
        ;;
    "services")
        deploy_services
        deploy_bff
        deploy_frontend
        ;;
    "monitoring")
        deploy_monitoring
        ;;
    "verify")
        verify_deployment
        ;;
    *)
        main
        ;;
esac
