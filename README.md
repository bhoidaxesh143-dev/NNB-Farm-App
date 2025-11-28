<<<<<<< HEAD
# NNB-Farm-App
Farmer_Solucation
=======
# Industrial-Grade MERN Application

A production-ready MERN (MongoDB, Express, React, Node.js) stack application built with industry best practices for scalability, security, and maintainability.

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development](#development)
- [Testing](#testing)
- [Production Build](#production-build)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Security](#security)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Security
- ✅ JWT authentication with refresh tokens
- ✅ Password hashing with bcrypt
- ✅ Rate limiting (global and endpoint-specific)
- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ Input validation and sanitization
- ✅ NoSQL injection prevention
- ✅ XSS protection

### Scalability
- ✅ Stateless application architecture
- ✅ Horizontal scaling support
- ✅ Redis caching layer
- ✅ MongoDB connection pooling
- ✅ Load balancer ready
- ✅ Docker containerization

### Observability
- ✅ Structured logging (Winston)
- ✅ Health check endpoints
- ✅ Request correlation IDs
- ✅ Error tracking
- ✅ Performance metrics ready

### Code Quality
- ✅ ESLint + Prettier
- ✅ Unit and integration tests
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ Code coverage reporting
- ✅ Layered architecture (MVC + Services + Repositories)

### Developer Experience
- ✅ Hot reload in development
- ✅ Docker Compose for local development
- ✅ Environment-based configuration
- ✅ Comprehensive documentation

## 🏗️ Architecture

The application follows a **three-tier architecture** with clear separation of concerns:

```
┌─────────────────────────────────────┐
│         Client Tier (React)          │
│  - Component-based UI                │
│  - Context API for state             │
│  - Axios with interceptors           │
└─────────────────────────────────────┘
                 ↓ REST API
┌─────────────────────────────────────┐
│    Application Tier (Express.js)     │
│  ┌─────────────────────────────────┐ │
│  │ Controllers (HTTP Handlers)     │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │ Services (Business Logic)       │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │ Repositories (Data Access)      │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│         Data Tier                    │
│  - MongoDB (Primary Database)        │
│  - Redis (Cache & Sessions)          │
└─────────────────────────────────────┘
```

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## 🛠️ Tech Stack

### Backend
- **Node.js** (v18+) - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (with Mongoose ODM)
- **Redis** - Caching and session storage
- **JWT** - Authentication
- **Winston** - Logging
- **Jest** - Testing framework

### Frontend
- **React** (v18+) - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Query** - Data fetching
- **Vite** - Build tool
- **Vitest** - Testing framework

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **GitHub Actions** - CI/CD pipeline
- **ESLint & Prettier** - Code quality

## 📦 Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Docker** & **Docker Compose** (for containerized setup)
- **MongoDB** (local or Atlas)
- **Redis** (local or cloud)

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd mern-app

# Copy environment files
cp server/.env.example server/.env
cp client/.env.example client/.env

# Start all services (MongoDB, Redis, Server, Client)
docker-compose -f docker-compose.dev.yml up

# Application will be available at:
# - Client: http://localhost:3000
# - Server: http://localhost:5000
# - MongoDB: localhost:27017
# - Redis: localhost:6379
```

### Option 2: Local Development

**Terminal 1 - Start MongoDB and Redis:**
```bash
docker-compose up mongodb redis
```

**Terminal 2 - Start Server:**
```bash
cd server
npm install
cp .env.example .env
npm run dev
```

**Terminal 3 - Start Client:**
```bash
cd client
npm install
cp .env.example .env
npm run dev
```

### Initial Setup

1. **Create Admin User (Optional):**
```bash
# Access MongoDB
mongosh mongodb://admin:admin123@localhost:27017/mern-app

# Create admin user
db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyMK4z6pFhSm", // password123
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

2. **Access the Application:**
   - Open http://localhost:3000
   - Register a new account or login with credentials

## 💻 Development

### Server Development

```bash
cd server

# Install dependencies
npm install

# Development with hot reload
npm run dev

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type check (if using TypeScript)
npm run typecheck
```

### Client Development

```bash
cd client

# Install dependencies
npm install

# Development server
npm run dev

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Environment Variables

**Server (`server/.env`):**
```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mern-app
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=dev-jwt-secret-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production
CORS_ORIGIN=http://localhost:3000
```

**Client (`client/.env`):**
```bash
VITE_API_URL=http://localhost:5000/api/v1
```

## 🧪 Testing

### Server Tests

```bash
cd server

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run integration tests only
npm run test:integration

# Generate coverage report
npm test -- --coverage
```

### Client Tests

```bash
cd client

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Structure

```
server/src/__tests__/
├── unit/                 # Unit tests
│   └── utils/
│       ├── AppError.test.js
│       └── response.test.js
└── integration/          # Integration tests
    └── auth.integration.test.js

client/src/__tests__/
└── App.test.jsx
```

## 🏭 Production Build

### Build Server

```bash
cd server

# Install production dependencies
npm ci --only=production

# Note: No build step required for JavaScript
# Server runs directly from source
```

### Build Client

```bash
cd client

# Install dependencies
npm ci

# Build for production
npm run build

# Output will be in client/dist/
```

### Build Docker Images

```bash
# Build server image
docker build -t mern-server:latest ./server

# Build client image
docker build -t mern-client:latest ./client

# Or use docker-compose
docker-compose build
```

## 🚢 Deployment

### Production Deployment

See detailed deployment instructions in [DEPLOYMENT.md](./DEPLOYMENT.md).

**For Hostinger Cloud Starter VPS:**  
See [HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md) for step-by-step Hostinger-specific deployment guide.

**Quick Deploy with Docker Compose:**

```bash
# 1. Set up production environment variables
cp server/.env.example server/.env
# Edit server/.env with production values

# 2. Deploy
docker-compose up -d

# 3. Check status
docker-compose ps
docker-compose logs -f

# 4. Verify health
curl http://your-server:5000/health
```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] JWT secrets generated (strong, random)
- [ ] MongoDB configured (authentication enabled)
- [ ] Redis configured (password set)
- [ ] CORS origin set to production domain
- [ ] SSL/TLS certificate installed
- [ ] Rate limiting configured
- [ ] Monitoring and logging set up
- [ ] Backup strategy in place

See [SECURITY.md](./SECURITY.md) for complete security checklist.

## 📚 API Documentation

### Base URL

```
Development: http://localhost:5000/api/v1
Production:  https://api.yourdomain.com/api/v1
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "data": { ... }
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "..."
}

Response: 200 OK
{
  "success": true,
  "data": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "message": "Logout successful"
}
```

### User Endpoints

#### Get Profile
```http
GET /users/profile/me
Authorization: Bearer {accessToken}

Response: 200 OK
```

#### Update Profile
```http
PUT /users/profile/me
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Jane Doe"
}
```

#### Get All Users (Admin)
```http
GET /users?page=1&limit=20
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

### Health Check Endpoints

```http
GET /health          # Liveness probe
GET /readiness       # Readiness probe
```

### Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [...] // Optional
  },
  "timestamp": "2025-11-28T00:00:00.000Z"
}
```

**Common Error Codes:**
- `VALIDATION_ERROR` (400) - Invalid input
- `UNAUTHORIZED` (401) - Not authenticated
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `CONFLICT` (409) - Duplicate resource
- `RATE_LIMIT_EXCEEDED` (429) - Too many requests
- `INTERNAL_ERROR` (500) - Server error

## 🔒 Security

This application implements multiple security layers:

- **Authentication:** JWT with short-lived access tokens (15 min)
- **Authorization:** Role-based access control (RBAC)
- **Rate Limiting:** 100 requests per 15 minutes (global), 5 per 15 minutes (auth)
- **Password Security:** Bcrypt hashing (cost factor 12)
- **Input Validation:** express-validator + sanitization
- **NoSQL Injection Prevention:** express-mongo-sanitize
- **Security Headers:** Helmet.js
- **CORS:** Configured with specific origins
- **Secrets Management:** Environment variables

For complete security documentation, see [SECURITY.md](./SECURITY.md).

### Generating Secure Secrets

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate refresh token secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📁 Project Structure

```
mern-app/
├── server/                      # Backend application
│   ├── src/
│   │   ├── config/              # Configuration files
│   │   │   ├── index.js         # Main config
│   │   │   ├── database.js      # MongoDB connection
│   │   │   └── redis.js         # Redis connection
│   │   ├── models/              # Mongoose models
│   │   │   └── User.js
│   │   ├── repositories/        # Data access layer
│   │   │   └── userRepository.js
│   │   ├── services/            # Business logic layer
│   │   │   ├── authService.js
│   │   │   └── userService.js
│   │   ├── controllers/         # Route controllers
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   └── healthController.js
│   │   ├── routes/              # API routes
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── healthRoutes.js
│   │   │   └── index.js
│   │   ├── middleware/          # Express middleware
│   │   │   ├── index.js
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   ├── rateLimiter.js
│   │   │   ├── validate.js
│   │   │   ├── requestLogger.js
│   │   │   └── notFound.js
│   │   ├── validators/          # Request validators
│   │   │   └── authValidator.js
│   │   ├── utils/               # Utility functions
│   │   │   ├── logger.js
│   │   │   ├── AppError.js
│   │   │   ├── asyncHandler.js
│   │   │   ├── response.js
│   │   │   ├── cache.js
│   │   │   └── gracefulShutdown.js
│   │   ├── __tests__/           # Tests
│   │   │   ├── unit/
│   │   │   └── integration/
│   │   └── index.js             # App entry point
│   ├── .env.example
│   ├── .eslintrc.json
│   ├── .prettierrc.json
│   ├── jest.config.js
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── package.json
│
├── client/                      # Frontend application
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── Layout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── pages/               # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/            # API services
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   └── userService.js
│   │   ├── context/             # React Context
│   │   │   └── AuthContext.jsx
│   │   ├── __tests__/           # Tests
│   │   │   └── App.test.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── setupTests.js
│   ├── .env.example
│   ├── .eslintrc.json
│   ├── .prettierrc.json
│   ├── vite.config.js
│   ├── nginx.conf
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── index.html
│   └── package.json
│
├── .github/
│   └── workflows/
│       ├── ci.yml               # CI pipeline
│       └── deploy.yml           # Deployment pipeline
│
├── docker-compose.yml           # Production compose
├── docker-compose.dev.yml       # Development compose
├── ARCHITECTURE.md              # Architecture documentation
├── SECURITY.md                  # Security documentation
├── DEPLOYMENT.md                # Deployment documentation
├── README.md                    # This file
└── .gitignore
```

## 🔄 CI/CD Pipeline

The project includes a complete CI/CD pipeline using GitHub Actions:

### Continuous Integration (on push/PR)

1. **Lint & Format Check** - ESLint and Prettier
2. **Unit Tests** - Jest with coverage
3. **Integration Tests** - API testing
4. **Build Check** - Ensure builds succeed
5. **Docker Build** - Verify Docker images build
6. **Security Scan** - npm audit and Snyk

### Continuous Deployment (on push to main)

1. **Build Docker Images**
2. **Push to Container Registry**
3. **Deploy to Environment**

See [.github/workflows/](./github/workflows/) for pipeline configuration.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Follow ESLint and Prettier configurations
- Write tests for new features
- Update documentation as needed
- Follow the existing project structure
- Use meaningful commit messages

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

- **Documentation:** [ARCHITECTURE.md](./ARCHITECTURE.md), [SECURITY.md](./SECURITY.md), [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Issues:** GitHub Issues
- **Discussions:** GitHub Discussions

## 🎯 Roadmap

- [ ] Add Swagger/OpenAPI documentation
- [ ] Implement email verification
- [ ] Add password reset functionality
- [ ] Implement two-factor authentication (2FA)
- [ ] Add social authentication (Google, GitHub)
- [ ] Implement file upload with S3
- [ ] Add real-time features with WebSockets
- [ ] Implement cron jobs for scheduled tasks
- [ ] Add comprehensive API rate limiting per user
- [ ] Implement audit logging
- [ ] Add Grafana dashboards for monitoring
- [ ] Kubernetes deployment manifests

## 🙏 Acknowledgments

- Built with industry best practices
- Follows OWASP security guidelines
- Implements 12-factor app methodology
- Inspired by enterprise-grade applications

---

**Built with ❤️ for production readiness**

>>>>>>> 2d7a136 (CREATE : Create NNB-Farm-App  using MERN)
