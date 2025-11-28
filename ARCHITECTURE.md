# Architecture Documentation

## System Overview

This MERN application follows a **three-tier architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Tier                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  React + TypeScript SPA                                     │ │
│  │  - Component-based architecture                             │ │
│  │  - Redux/Context for state management                       │ │
│  │  - Axios for HTTP client with interceptors                  │ │
│  │  - React Router for navigation                              │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTPS/REST
┌─────────────────────────────────────────────────────────────────┐
│                      Application Tier                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  API Gateway / Load Balancer (Production)                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Express.js Application Servers (Stateless, Scalable)       │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │ │
│  │  │   Instance 1  │  │  Instance 2  │  │  Instance N  │     │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘     │ │
│  │                                                              │ │
│  │  Middleware Stack:                                           │ │
│  │  • Rate Limiting (express-rate-limit)                        │ │
│  │  • Security Headers (helmet)                                 │ │
│  │  • CORS Configuration                                        │ │
│  │  • JWT Authentication                                        │ │
│  │  • Request Validation (express-validator)                    │ │
│  │  • Error Handling                                            │ │
│  │  • Logging (Winston)                                         │ │
│  │                                                              │ │
│  │  Layered Architecture:                                       │ │
│  │  ┌─────────────────────────────────────────────────┐        │ │
│  │  │  Controllers (HTTP handlers)                     │        │ │
│  │  └─────────────────────────────────────────────────┘        │ │
│  │                      ▼                                       │ │
│  │  ┌─────────────────────────────────────────────────┐        │ │
│  │  │  Services (Business Logic)                       │        │ │
│  │  └─────────────────────────────────────────────────┘        │ │
│  │                      ▼                                       │ │
│  │  ┌─────────────────────────────────────────────────┐        │ │
│  │  │  Data Access Layer (Repositories)                │        │ │
│  │  └─────────────────────────────────────────────────┘        │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Data Tier                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  MongoDB (Primary Database)                                 │ │
│  │  • Replica Set for HA                                       │ │
│  │  • Connection Pooling                                       │ │
│  │  • Indexes for performance                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Redis (Cache & Session Store)                              │ │
│  │  • Session management                                       │ │
│  │  • API response caching                                     │ │
│  │  • Rate limiting store                                      │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Observability & Monitoring                     │
│  • Application Logs (Winston → Centralized Logging)             │
│  • Metrics (Prometheus/Custom)                                   │
│  • Health Checks (/health, /readiness)                           │
│  • Error Tracking (Sentry/similar)                               │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Client Tier (React + TypeScript)

**Responsibilities:**
- User interface rendering
- Client-side routing
- Form validation
- State management
- API communication

**Key Patterns:**
- **Component composition**: Atomic design principles (atoms, molecules, organisms)
- **Custom hooks**: Reusable logic extraction
- **Context API / Redux**: Global state management
- **Error boundaries**: Graceful error handling
- **Code splitting**: Lazy loading for performance

**Structure:**
```
client/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page-level components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API client services
│   ├── context/         # Context providers
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript type definitions
│   └── __tests__/       # Component tests
```

### 2. Application Tier (Express + Node.js)

**Responsibilities:**
- Request routing and handling
- Business logic execution
- Authentication and authorization
- Data validation
- Caching strategy
- Error handling and logging

**Layered Architecture:**

#### a) Controllers Layer
- Handle HTTP requests/responses
- Input validation
- Delegate to services
- Return formatted responses

#### b) Services Layer
- Business logic implementation
- Transaction management
- Orchestrate multiple repositories
- Cache management

#### c) Data Access Layer (Repositories)
- Database operations
- Query optimization
- Data mapping
- Connection management

**Structure:**
```
server/
├── src/
│   ├── controllers/     # HTTP request handlers
│   ├── services/        # Business logic
│   ├── repositories/    # Data access layer
│   ├── models/          # MongoDB schemas
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── utils/           # Utilities (logger, cache, etc.)
│   ├── config/          # Configuration
│   ├── validators/      # Request validation schemas
│   └── __tests__/       # Unit & integration tests
```

### 3. Data Tier

#### MongoDB
- **Primary data store**
- Document-oriented database
- Replica set for high availability
- Connection pooling (mongoose)
- Indexed queries for performance

#### Redis
- **Caching layer** for frequently accessed data
- **Session storage** for JWT refresh tokens
- **Rate limiting** counter storage
- TTL-based expiration

## Security Architecture

### Authentication & Authorization

```
┌─────────────────────────────────────────────────────────────────┐
│  Authentication Flow (JWT)                                       │
│                                                                  │
│  1. User Login (POST /api/auth/login)                           │
│     ↓                                                            │
│  2. Validate credentials (bcrypt password check)                │
│     ↓                                                            │
│  3. Generate JWT tokens:                                         │
│     • Access Token (short-lived, 15 min)                         │
│     • Refresh Token (long-lived, 7 days, stored in Redis)       │
│     ↓                                                            │
│  4. Return tokens (httpOnly cookie + response body)             │
│     ↓                                                            │
│  5. Subsequent requests include Access Token in header          │
│     ↓                                                            │
│  6. Middleware validates JWT on protected routes                │
│     ↓                                                            │
│  7. Token refresh via /api/auth/refresh when expired            │
└─────────────────────────────────────────────────────────────────┘
```

### Security Measures

1. **OWASP Top 10 Protection:**
   - Input validation (express-validator)
   - SQL/NoSQL injection prevention (parameterized queries)
   - XSS protection (helmet, content security policy)
   - CSRF protection (SameSite cookies)
   - Secure headers (helmet middleware)

2. **Rate Limiting:**
   - Per-IP rate limiting
   - Per-user rate limiting
   - Exponential backoff for login attempts

3. **Data Protection:**
   - Password hashing (bcrypt, cost factor 12)
   - Encryption at rest (MongoDB)
   - TLS/SSL in transit
   - Environment variable secrets
   - No sensitive data in logs

## Scalability Strategy

### Horizontal Scaling
- **Stateless application servers**: No session affinity required
- **Load balancer**: Distributes traffic across instances
- **Database replica set**: Read scaling with secondary replicas
- **Caching**: Reduces database load

### Connection Pooling
```typescript
// MongoDB connection pool configuration
mongoose.connect(MONGO_URI, {
  maxPoolSize: 10,        // Maximum connections
  minPoolSize: 5,         // Minimum connections
  socketTimeoutMS: 45000, // Socket timeout
  serverSelectionTimeoutMS: 5000,
});
```

### Caching Strategy
- **Cache-Aside Pattern**: Application checks cache before DB
- **TTL-based expiration**: Automatic cache invalidation
- **Layered caching**: 
  - L1: In-memory (Node.js process)
  - L2: Redis (shared across instances)

## Observability

### Logging Strategy
```typescript
// Structured logging with Winston
logger.info('User logged in', {
  userId: user.id,
  ip: req.ip,
  timestamp: new Date().toISOString(),
  correlationId: req.correlationId,
});
```

**Log Levels:**
- ERROR: Application errors, exceptions
- WARN: Deprecated features, unusual behavior
- INFO: Important business events
- DEBUG: Detailed diagnostic information

### Health Checks
- **Liveness probe** (`/health`): Is the app running?
- **Readiness probe** (`/readiness`): Is the app ready to serve traffic?
  - Database connectivity
  - Redis connectivity
  - Dependency health

### Metrics
- Request rate
- Response times (p50, p95, p99)
- Error rates
- Database connection pool usage
- Cache hit/miss ratio

## Performance Optimization

1. **Pagination**: Cursor-based pagination for large datasets
2. **Indexing**: Strategic MongoDB indexes
3. **Compression**: Gzip response compression
4. **Caching**: Redis for hot data
5. **Connection pooling**: Reuse database connections
6. **Lazy loading**: Client-side code splitting

## Reliability

### Graceful Shutdown
```typescript
// Handle SIGTERM/SIGINT
process.on('SIGTERM', async () => {
  await server.close();
  await mongoose.connection.close();
  await redis.quit();
});
```

### Retry Mechanisms
- Database connection retries with exponential backoff
- Circuit breaker for external services
- Idempotent API operations

### Error Handling
- Global error handler middleware
- Typed error classes
- Proper HTTP status codes
- Error logging and monitoring

## Configuration Management (12-Factor)

1. **Environment-based configuration**: Separate configs for dev/staging/prod
2. **Secret management**: Environment variables, never commit secrets
3. **Feature flags**: Enable/disable features without deployment
4. **Externalized config**: All config in environment, not code

## Deployment Architecture

### Development
```
Docker Compose:
  - app (Node.js)
  - client (React dev server)
  - mongodb
  - redis
```

### Staging/Production
```
Container Orchestration (Kubernetes/ECS):
  - Multiple app replicas
  - Load balancer
  - MongoDB Atlas (managed)
  - Redis (managed/self-hosted)
  - CDN for static assets
  - Environment-specific configs
```

## API Design Principles

1. **RESTful conventions**: Standard HTTP methods and status codes
2. **Versioning**: `/api/v1/` prefix for API versioning
3. **Consistent response format**:
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "timestamp": "2025-11-28T00:00:00.000Z"
}
```
4. **Error responses**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": []
  },
  "timestamp": "2025-11-28T00:00:00.000Z"
}
```

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React + TypeScript | UI framework |
| Backend | Node.js + Express + TypeScript | API server |
| Database | MongoDB | Primary data store |
| Cache | Redis | Caching & sessions |
| Authentication | JWT | Stateless auth |
| Validation | express-validator | Input validation |
| Logging | Winston | Structured logging |
| Testing | Jest + Supertest + RTL | Unit & integration tests |
| Containerization | Docker | Deployment packaging |
| CI/CD | GitHub Actions | Automated pipeline |
| Security | Helmet, Rate Limit, bcrypt | Security measures |

## Next Steps for Production

1. Set up monitoring and alerting (Prometheus + Grafana / Datadog)
2. Configure CDN for static assets (CloudFront / Cloudflare)
3. Implement backup strategy for MongoDB
4. Set up centralized logging (ELK stack / CloudWatch)
5. Configure auto-scaling policies
6. Implement comprehensive audit logging
7. Set up disaster recovery procedures
8. Performance testing and optimization

