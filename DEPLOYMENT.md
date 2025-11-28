# Deployment Guide

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Deployment Options](#deployment-options)
5. [Production Deployment](#production-deployment)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Rollback Procedures](#rollback-procedures)
8. [Troubleshooting](#troubleshooting)

## Overview

This guide covers deploying the MERN application to various environments (staging and production).

### Architecture

```
Internet
    ↓
Load Balancer / CDN
    ↓
┌─────────────────────────────────┐
│    Application Servers (N)       │ ← Auto-scaling
│  (Docker containers/Kubernetes)  │
└─────────────────────────────────┘
    ↓                  ↓
MongoDB Atlas      Redis Cache
(Managed)          (Managed/Self-hosted)
```

## Prerequisites

### Required Tools
- Docker & Docker Compose
- Node.js 18+ (for local builds)
- Git
- kubectl (for Kubernetes)
- Cloud CLI (AWS CLI, gcloud, or az)

### Required Accounts
- Cloud provider account (AWS/GCP/Azure)
- MongoDB Atlas account (or self-hosted MongoDB)
- Redis Cloud account (or self-hosted Redis)
- Domain registrar (for custom domain)
- SSL certificate (Let's Encrypt recommended)

## Environment Setup

### 1. Development Environment

```bash
# Clone repository
git clone <repository-url>
cd mern-app

# Start development environment
docker-compose -f docker-compose.dev.yml up
```

Access:
- Client: http://localhost:3000
- Server: http://localhost:5000
- MongoDB: localhost:27017
- Redis: localhost:6379

### 2. Staging Environment

**Purpose:** Pre-production testing, QA validation

**Setup:**
```bash
# Copy environment template
cp server/.env.example server/.env.staging

# Configure staging environment variables
# Edit server/.env.staging with staging values

# Deploy to staging
docker-compose -f docker-compose.yml up -d
```

**Configuration:**
- Use staging database
- Enable debug logging
- Lower rate limits for testing
- Test payment gateways in sandbox mode

### 3. Production Environment

See [Production Deployment](#production-deployment) section below.

## Deployment Options

### Option 1: Docker Compose (Simple Deployment)

**Best for:** Small applications, single server deployment

**Steps:**
```bash
# 1. Set up server
ssh user@your-server.com

# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. Clone repository
git clone <repository-url>
cd mern-app

# 4. Configure environment
cp server/.env.example server/.env
nano server/.env # Edit with production values

# 5. Start application
docker-compose up -d

# 6. Check status
docker-compose ps
docker-compose logs -f
```

**Pros:**
- Simple setup
- Easy to understand
- Good for small scale

**Cons:**
- Single point of failure
- Manual scaling
- Limited high availability

### Option 2: Kubernetes (Production-Grade)

**Best for:** Large applications, high availability, auto-scaling

**Architecture:**
```
Ingress (nginx)
    ↓
┌─────────────────────────────────┐
│  Server Deployment (Replicas: 3)│
└─────────────────────────────────┘
┌─────────────────────────────────┐
│  Client Deployment (Replicas: 2)│
└─────────────────────────────────┘
    ↓                  ↓
MongoDB Service    Redis Service
```

**Setup:**
```bash
# 1. Create Kubernetes manifests (k8s/ directory)
mkdir k8s

# 2. Create deployment files
# See example manifests below

# 3. Apply configurations
kubectl apply -f k8s/

# 4. Check status
kubectl get pods
kubectl get services
```

**Example Kubernetes Manifests:**

`k8s/server-deployment.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mern-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mern-server
  template:
    metadata:
      labels:
        app: mern-server
    spec:
      containers:
      - name: server
        image: your-registry/mern-server:latest
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: mern-secrets
              key: mongodb-uri
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: mern-secrets
              key: jwt-secret
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /readiness
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: mern-server-service
spec:
  selector:
    app: mern-server
  ports:
  - port: 80
    targetPort: 5000
  type: ClusterIP
```

### Option 3: Cloud Platform Services

#### AWS Deployment

**Components:**
- **ECS (Elastic Container Service)** for application containers
- **RDS** for MongoDB (or MongoDB Atlas)
- **ElastiCache** for Redis
- **ALB** (Application Load Balancer) for load balancing
- **CloudFront** for CDN
- **S3** for static assets

**Steps:**
```bash
# 1. Push images to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com
docker build -t mern-server ./server
docker tag mern-server:latest <account>.dkr.ecr.<region>.amazonaws.com/mern-server:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/mern-server:latest

# 2. Create ECS task definitions
aws ecs register-task-definition --cli-input-json file://task-definition.json

# 3. Create/Update ECS service
aws ecs create-service --cli-input-json file://service-definition.json
```

#### Google Cloud Platform

**Components:**
- **Cloud Run** or **GKE** for containers
- **Cloud SQL** for MongoDB
- **Memorystore** for Redis
- **Cloud Load Balancing**
- **Cloud CDN**

#### Azure

**Components:**
- **Azure Container Instances** or **AKS**
- **Azure Cosmos DB** for MongoDB
- **Azure Cache for Redis**
- **Azure Load Balancer**
- **Azure CDN**

## Production Deployment

### Step-by-Step Production Deployment

#### 1. Prepare MongoDB

**Option A: MongoDB Atlas (Recommended)**
```bash
# 1. Create cluster at cloud.mongodb.com
# 2. Configure IP whitelist (add application server IPs)
# 3. Create database user
# 4. Get connection string
# 5. Update MONGODB_URI in environment
```

**Option B: Self-Hosted MongoDB**
```bash
# Install MongoDB
# Configure replica set
# Set up authentication
# Configure backup strategy
```

#### 2. Prepare Redis

**Option A: Redis Cloud**
```bash
# 1. Create database at redis.com
# 2. Get connection details
# 3. Update REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
```

**Option B: Self-Hosted Redis**
```bash
# Install Redis
# Configure persistence
# Set password
# Configure maxmemory policy
```

#### 3. Configure Environment Variables

**Server Environment (`.env`):**
```bash
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mern-app
REDIS_HOST=redis-instance.region.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# JWT - MUST USE STRONG SECRETS
JWT_SECRET=<generate-strong-secret-32-chars>
JWT_REFRESH_SECRET=<generate-strong-secret-32-chars>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE_ENABLED=true

# Security
BCRYPT_ROUNDS=12
```

**Client Environment:**
```bash
VITE_API_URL=https://api.yourdomain.com/api/v1
```

#### 4. Build Docker Images

```bash
# Server
cd server
docker build -t mern-server:v1.0.0 .

# Client
cd client
docker build -t mern-client:v1.0.0 .
```

#### 5. Push to Container Registry

```bash
# Tag images
docker tag mern-server:v1.0.0 your-registry.com/mern-server:v1.0.0
docker tag mern-client:v1.0.0 your-registry.com/mern-client:v1.0.0

# Push images
docker push your-registry.com/mern-server:v1.0.0
docker push your-registry.com/mern-client:v1.0.0
```

#### 6. Deploy Application

```bash
# Pull latest images
docker-compose pull

# Start services
docker-compose up -d

# Check health
curl https://api.yourdomain.com/health
curl https://api.yourdomain.com/readiness
```

#### 7. Configure Load Balancer

**nginx Configuration:**
```nginx
upstream api_servers {
    server server1:5000;
    server server2:5000;
    server server3:5000;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/ssl/certs/fullchain.pem;
    ssl_certificate_key /etc/ssl/private/privkey.pem;

    location / {
        proxy_pass http://api_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 8. Set Up SSL/TLS

**Let's Encrypt (Free):**
```bash
# Install certbot
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### 9. Configure DNS

```
A    yourdomain.com        -> Load Balancer IP
A    api.yourdomain.com    -> Load Balancer IP
CNAME www.yourdomain.com   -> yourdomain.com
```

#### 10. Set Up Monitoring

See [Monitoring & Maintenance](#monitoring--maintenance) section.

## Monitoring & Maintenance

### Health Checks

**Endpoints:**
- `/health` - Liveness probe (is app running?)
- `/readiness` - Readiness probe (is app ready to serve traffic?)

**Monitoring:**
```bash
# Check health
curl https://api.yourdomain.com/health

# Expected response:
{
  "success": true,
  "data": { "status": "OK" },
  "message": "Service is healthy"
}
```

### Logging

**Centralized Logging Options:**
- ELK Stack (Elasticsearch, Logstash, Kibana)
- CloudWatch (AWS)
- Stackdriver (GCP)
- Azure Monitor

**Log Levels:**
- ERROR: Application errors
- WARN: Warnings and deprecations
- INFO: Important events
- DEBUG: Detailed debugging

### Metrics

**Key Metrics to Monitor:**
- Request rate (requests/second)
- Response time (p50, p95, p99)
- Error rate (%)
- CPU usage (%)
- Memory usage (%)
- Database connections
- Redis hit/miss ratio

**Tools:**
- Prometheus + Grafana
- Datadog
- New Relic
- CloudWatch

### Alerting

**Critical Alerts:**
- Server down
- Database connection failures
- High error rate (>5%)
- High response time (>2s p95)
- Low disk space (<10%)

**Warning Alerts:**
- Elevated error rate (>1%)
- Increased response time
- High memory usage (>80%)
- Failed authentication attempts spike

### Backup Strategy

**Database Backups:**
```bash
# MongoDB backup (daily)
mongodump --uri="$MONGODB_URI" --out=/backups/$(date +%Y%m%d)

# Retention: 7 daily, 4 weekly, 3 monthly
```

**Redis Backups:**
- RDB snapshots (automatic)
- AOF persistence (optional)

## Rollback Procedures

### Quick Rollback (Docker)

```bash
# 1. Identify previous version
docker images | grep mern-server

# 2. Stop current version
docker-compose down

# 3. Update docker-compose.yml to use previous version
# image: mern-server:v1.0.0 -> mern-server:v0.9.0

# 4. Start previous version
docker-compose up -d

# 5. Verify
curl https://api.yourdomain.com/health
```

### Kubernetes Rollback

```bash
# View rollout history
kubectl rollout history deployment/mern-server

# Rollback to previous version
kubectl rollout undo deployment/mern-server

# Rollback to specific revision
kubectl rollout undo deployment/mern-server --to-revision=2

# Check status
kubectl rollout status deployment/mern-server
```

### Database Rollback

```bash
# 1. Stop application
docker-compose down

# 2. Restore backup
mongorestore --uri="$MONGODB_URI" /backups/20250127

# 3. Start application
docker-compose up -d
```

## Troubleshooting

### Application Won't Start

```bash
# Check logs
docker-compose logs server

# Common issues:
# - Database connection failure
# - Missing environment variables
# - Port already in use
```

### High Memory Usage

```bash
# Check container stats
docker stats

# Restart containers
docker-compose restart server

# Increase memory limit in docker-compose.yml
```

### Database Connection Issues

```bash
# Test database connection
mongosh "$MONGODB_URI"

# Check network connectivity
ping <mongodb-host>

# Verify credentials
# Check IP whitelist (MongoDB Atlas)
```

### Slow Response Times

```bash
# Check database indexes
# Enable query profiling
# Review application logs
# Check Redis cache hit ratio
# Scale horizontally (add more servers)
```

### SSL Certificate Issues

```bash
# Test certificate
openssl s_client -connect yourdomain.com:443

# Renew certificate
sudo certbot renew

# Check certificate expiration
echo | openssl s_client -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

## Performance Optimization

### Application Level
- Enable Redis caching
- Optimize database queries
- Add database indexes
- Implement pagination
- Use connection pooling

### Infrastructure Level
- Use CDN for static assets
- Enable gzip compression
- Implement horizontal scaling
- Use load balancer
- Optimize Docker images

## Security Hardening

See [SECURITY.md](./SECURITY.md) for complete security checklist.

**Quick Checklist:**
- [ ] HTTPS enabled
- [ ] Secrets rotated
- [ ] Rate limiting active
- [ ] Database authenticated
- [ ] Redis password-protected
- [ ] Firewall configured
- [ ] Regular security updates
- [ ] Monitoring and alerting active

## Cost Optimization

### Development
- Use Docker Compose on single server
- Use MongoDB Atlas free tier
- Use Redis Cloud free tier

### Production (Small Scale)
- Single server with Docker Compose
- MongoDB Atlas M10 cluster (~$50/month)
- Redis Cloud 1GB (~$10/month)
- **Total: ~$100-150/month**

### Production (Medium Scale)
- Kubernetes cluster (3 nodes)
- MongoDB Atlas M30 cluster (~$200/month)
- Redis Cloud 5GB (~$40/month)
- Load balancer (~$20/month)
- **Total: ~$500-800/month**

## Support & Resources

- [Architecture Documentation](./ARCHITECTURE.md)
- [Security Guide](./SECURITY.md)
- [API Documentation](./API.md) (if created)
- [Contributing Guidelines](./CONTRIBUTING.md) (if created)

## Deployment Checklist

### Pre-Deployment
- [ ] Code reviewed and tested
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Secrets generated and stored securely
- [ ] Database migrations prepared
- [ ] Backup strategy in place
- [ ] Rollback plan documented
- [ ] Team notified

### Deployment
- [ ] Deploy to staging first
- [ ] Run smoke tests
- [ ] Monitor logs and metrics
- [ ] Verify health checks
- [ ] Test critical user flows
- [ ] Check performance metrics

### Post-Deployment
- [ ] Verify application is running
- [ ] Check error logs
- [ ] Monitor key metrics
- [ ] Test critical features
- [ ] Update documentation
- [ ] Team notification

