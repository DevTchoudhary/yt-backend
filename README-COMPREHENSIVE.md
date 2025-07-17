# Yukti SRE Platform Backend

A comprehensive NestJS backend for the Yukti SRE platform with MongoDB, featuring authentication, RBAC, company management, and dynamic company aliases.

## 🚀 Features

- **Authentication & Authorization**
  - OTP-based login system (no passwords required)
  - JWT tokens with refresh mechanism
  - Role-based access control (RBAC)
  - Permission-based authorization
  - Email verification and validation

- **Company Management**
  - Dynamic company aliases for subdomains
  - Company approval workflow
  - Multi-tenant architecture
  - Company profile management
  - Dashboard URL generation

- **Security**
  - Email validation (blocks temporary/disposable emails)
  - Rate limiting and throttling
  - Helmet security headers
  - CORS configuration
  - Input validation and sanitization
  - Production-level security practices

- **Database**
  - MongoDB with Mongoose ODM
  - Optimized schemas and indexes
  - Data validation and relationships

## 🛠 Tech Stack

- **Framework**: NestJS (Latest v10+)
- **Database**: MongoDB 7.0+
- **Authentication**: JWT, Passport
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI 3.0
- **Security**: Helmet, Throttler, bcryptjs
- **Email**: Nodemailer
- **Compression**: gzip compression

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v7 or higher)
- npm or yarn

## 🔧 Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd yukti-backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/yukti-sre

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Application
PORT=3000
NODE_ENV=development
APP_NAME=Yukti SRE Platform
APP_VERSION=1.0.0

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# Dashboard
DASHBOARD_BASE_URL=https://dashboard.yukti.com
```

4. **Start MongoDB:**
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Or using local installation
mongod
```

5. **Run the application:**
```bash
# Development mode with hot reload
npm run start:dev

# Production build and run
npm run build
npm run start:prod
```

The application will be available at:
- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api/v1/health

## 📚 API Documentation

### Live Documentation
Visit `http://localhost:3000/api/docs` for interactive Swagger documentation.

### Authentication Flow

1. **Signup** → Creates user and company (pending approval)
2. **Login** → Sends OTP to email
3. **Verify OTP** → Returns JWT tokens
4. **Use API** → Include Bearer token in Authorization header

### Core Endpoints

#### 🔐 Authentication
- `POST /api/v1/auth/signup` - Register new user and company
- `POST /api/v1/auth/login` - Login and send OTP
- `POST /api/v1/auth/verify-otp` - Verify OTP and get tokens
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user profile
- `POST /api/v1/auth/logout` - Logout user

#### 🏢 Company Management
- `GET /api/v1/companies` - Get all companies (Admin only)
- `GET /api/v1/companies/stats` - Get company statistics
- `GET /api/v1/companies/check-alias/{alias}` - Check alias availability
- `GET /api/v1/companies/{id}` - Get company by ID
- `PATCH /api/v1/companies/{id}` - Update company
- `GET /api/v1/companies/alias/{alias}` - Get company by alias
- `POST /api/v1/companies/approve` - Approve company (Admin only)
- `POST /api/v1/companies/reject` - Reject company (Admin only)
- `GET /api/v1/companies/{id}/dashboard-url` - Get dashboard URL

#### 📊 Dashboard
- `GET /api/v1/dashboard` - Get dashboard overview
- `GET /api/v1/dashboard/company/{alias}` - Get company dashboard
- `GET /api/v1/dashboard/stats` - Get dashboard statistics
- `GET /api/v1/dashboard/recent-activity` - Get recent activity

#### 🏥 Health
- `GET /api/v1/health` - Detailed health check with metrics
- `GET /api/v1` - Simple health check

## 💡 Usage Examples

### 1. Complete User Registration Flow

```bash
# Step 1: Register new user and company
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@company.com",
    "companyName": "Acme Corporation",
    "companyAlias": "acme-corp",
    "businessEmail": "contact@acme.com",
    "phone": "+1234567890",
    "businessAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipcode": "10001",
      "country": "USA"
    },
    "industry": "Technology",
    "companySize": "medium",
    "website": "https://acme.com"
  }'

# Response:
# {
#   "message": "Signup successful. Your account is pending approval.",
#   "userId": "...",
#   "companyId": "...",
#   "requiresApproval": true
# }
```

### 2. Login and Authentication

```bash
# Step 2: Login (sends OTP to email)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@company.com"
  }'

# Step 3: Verify OTP
curl -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@company.com",
    "otp": "123456"
  }'

# Response:
# {
#   "user": { ... },
#   "company": { ... },
#   "tokens": {
#     "accessToken": "eyJ...",
#     "refreshToken": "eyJ..."
#   }
# }
```

### 3. Authenticated API Calls

```bash
# Use the access token for authenticated requests
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer eyJ..."

# Get company dashboard
curl -X GET http://localhost:3000/api/v1/dashboard/company/acme-corp \
  -H "Authorization: Bearer eyJ..."
```

## 🏗 Architecture

### Database Schema

#### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  role: Enum ['admin', 'company_admin', 'user'],
  permissions: [String],
  companyId: ObjectId,
  status: Enum ['active', 'inactive', 'pending'],
  otp: String,
  otpExpiry: Date,
  refreshTokens: [String],
  createdAt: Date,
  updatedAt: Date
}
```

#### Companies Collection
```javascript
{
  _id: ObjectId,
  name: String,
  alias: String (unique),
  businessEmail: String,
  backupEmail: String,
  phone: String,
  businessAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipcode: String
  },
  status: Enum ['pending', 'approved', 'rejected'],
  approvedAt: Date,
  approvedBy: String,
  rejectionReason: String,
  dashboardUrl: String,
  settings: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### Security Features

1. **Email Validation**: Comprehensive email validation to prevent temporary/disposable emails
2. **OTP Authentication**: Secure 6-digit OTP with expiry (5 minutes)
3. **JWT Tokens**: Short-lived access tokens (15m) with long-lived refresh tokens (7d)
4. **RBAC**: Three-tier role system (Admin, Company Admin, User)
5. **Rate Limiting**: Configurable rate limiting per endpoint
6. **Input Validation**: Comprehensive validation using class-validator
7. **Security Headers**: Helmet.js for security headers
8. **CORS**: Configurable CORS policies

### Multi-tenancy Architecture

- **Dynamic Aliases**: Each company gets a unique alias for subdomain routing
- **Isolated Data**: Company-specific data isolation
- **Dashboard URLs**: Dynamic dashboard URL generation
- **Scalable Design**: Designed to handle multiple tenants efficiently

## 🔧 Development

### Project Structure

```
src/
├── auth/                    # Authentication module
│   ├── controllers/         # Auth controllers
│   ├── services/           # Auth business logic
│   ├── dto/               # Data transfer objects
│   ├── guards/            # Auth guards (JWT, Roles)
│   ├── decorators/        # Custom decorators
│   └── strategies/        # Passport strategies
├── companies/             # Company management
│   ├── controllers/       # Company controllers
│   ├── services/         # Company business logic
│   ├── dto/             # Company DTOs
│   └── schemas/         # Mongoose schemas
├── dashboard/            # Dashboard module
│   ├── controllers/     # Dashboard controllers
│   └── services/       # Dashboard services
├── common/              # Shared utilities
│   ├── interfaces/     # Common interfaces
│   ├── services/      # Shared services (Email, Validation)
│   ├── guards/       # Common guards
│   └── decorators/  # Common decorators
├── config/             # Configuration files
│   └── database.config.ts
└── main.ts            # Application entry point
```

### Available Scripts

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debugging

# Production
npm run build             # Build the application
npm run start:prod        # Start production server

# Testing
npm run test             # Run unit tests
npm run test:e2e         # Run end-to-end tests
npm run test:cov         # Run tests with coverage

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/yukti-sre` |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | Required |
| `JWT_EXPIRES_IN` | Access token expiry | `15m` |
| `JWT_REFRESH_SECRET` | Refresh token secret | Required |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |
| `SMTP_HOST` | SMTP server host | Required for email |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username | Required for email |
| `SMTP_PASS` | SMTP password | Required for email |
| `PORT` | Application port | `3000` |
| `THROTTLE_TTL` | Rate limit window (seconds) | `60` |
| `THROTTLE_LIMIT` | Max requests per window | `10` |

## 🚀 Deployment

### Production Checklist

- [ ] Set strong JWT secrets (min 32 characters)
- [ ] Configure production MongoDB instance
- [ ] Set up email service (SMTP)
- [ ] Configure reverse proxy (Nginx/Apache)
- [ ] Set up SSL certificates
- [ ] Configure environment variables
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy built application
COPY dist ./dist

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/health || exit 1

# Start application
CMD ["node", "dist/main"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/yukti-sre
      - NODE_ENV=production
    depends_on:
      - mongo
    
  mongo:
    image: mongo:7.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

## 📊 Monitoring

### Health Endpoints

```bash
# Simple health check
curl http://localhost:3000/api/v1

# Detailed health check with metrics
curl http://localhost:3000/api/v1/health
```

### Metrics Available

- Application uptime
- Memory usage (RSS, Heap)
- Database connection status
- Service version and environment
- Response times

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Standards

- Follow NestJS best practices
- Use TypeScript strictly
- Add comprehensive tests
- Document new endpoints
- Follow existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/api/docs`
- Review the health check endpoint for system status

---

**Built with ❤️ using NestJS and MongoDB**