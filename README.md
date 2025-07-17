# Yukti SRE Platform Backend

A comprehensive NestJS backend for the Yukti SRE (Site Reliability Engineering) platform with advanced authentication, RBAC, and multi-tenant company management.

## Features

### 🔐 Authentication & Authorization
- **Email-based authentication** with OTP verification
- **JWT tokens** with refresh token support
- **Role-based access control (RBAC)** with granular permissions
- **Multi-factor authentication** support
- **Account security** with login attempt tracking and lockout

### 🏢 Company Management
- **Dynamic company aliases** for subdomain dashboards
- **Multi-tenant architecture** with company isolation
- **Company approval workflow** for admin oversight
- **Business email validation** to prevent temporary emails
- **Comprehensive company profiles** with metadata

### 🛡️ Security Features
- **Helmet.js** for security headers
- **Rate limiting** with configurable thresholds
- **Input validation** with class-validator
- **CORS configuration** for cross-origin requests
- **Environment-based configuration** with validation

### 📊 Dashboard & Analytics
- **Role-based dashboard views** with different features per role
- **Company-specific dashboards** with dynamic URLs
- **Real-time notifications** and activity tracking
- **Quick actions** based on user permissions

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start MongoDB
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:5

# Or start your local MongoDB service
sudo systemctl start mongod
```

### 4. Run the Application
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## API Documentation

Once the application is running, visit:
- **Swagger UI**: http://localhost:12000/api/docs
- **Health Check**: http://localhost:12000/api/v1/health

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Register new user and company
- `POST /api/v1/auth/login` - Login and send OTP
- `POST /api/v1/auth/verify-otp` - Verify OTP and get tokens
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user profile
- `POST /api/v1/auth/logout` - Logout user

### Companies
- `GET /api/v1/companies` - List companies (Admin/SRE)
- `GET /api/v1/companies/:id` - Get company by ID
- `GET /api/v1/companies/alias/:alias` - Get company by alias
- `PATCH /api/v1/companies/:id` - Update company
- `POST /api/v1/companies/approve` - Approve company (Admin)
- `POST /api/v1/companies/reject` - Reject company (Admin)
- `GET /api/v1/companies/stats` - Company statistics (Admin)

### Dashboard
- `GET /api/v1/dashboard` - Get dashboard overview
- `GET /api/v1/dashboard/company/:alias` - Company dashboard by alias
- `GET /api/v1/dashboard/stats` - Dashboard statistics
- `GET /api/v1/dashboard/recent-activity` - Recent activity

## Usage Examples

### 1. User Registration
```bash
curl -X POST http://localhost:12000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@company.com",
    "companyName": "Acme Corporation",
    "businessEmail": "contact@acme.com",
    "phone": "+1234567890",
    "businessAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "zipcode": "10001"
    }
  }'
```

### 2. User Login
```bash
curl -X POST http://localhost:12000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@company.com"
  }'
```

### 3. Verify OTP
```bash
curl -X POST http://localhost:12000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@company.com",
    "otp": "123456"
  }'
```

### 4. Access Dashboard
```bash
curl -X GET http://localhost:12000/api/v1/dashboard \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Architecture

### Database Schema (MongoDB)

#### Users Collection
- Email-based authentication with OTP
- Role-based permissions (client, sre, admin)
- Company association and security tracking
- Preferences and notification settings

#### Companies Collection
- Unique company names and aliases
- Business information and addresses
- Approval workflow and status tracking
- Settings and metadata

### Role-Based Permissions

#### Client Role
- Read own company data and user profile
- Read assigned projects
- Create incidents/tickets

#### SRE Role
- All client permissions
- Write to assigned projects
- Monitor systems and deploy applications

#### Admin Role
- All permissions
- Manage users and companies
- Approve/reject company registrations
- System-wide settings

## Security Features

### Email Validation
- Blocks temporary/disposable email domains
- Validates business email format
- Supports custom domain validation

### Company Alias Security
- URL-safe character validation
- Reserved word blocking
- Unique constraint enforcement
- Length limitations

### Authentication Security
- JWT with refresh tokens
- OTP verification with attempt limits
- Account lockout on failed attempts
- Rate limiting on endpoints

## Development

### Project Structure
```
src/
├── auth/                 # Authentication module
├── companies/           # Company management
├── dashboard/           # Dashboard functionality
├── common/             # Shared utilities
│   ├── decorators/     # Custom decorators
│   ├── guards/         # Auth guards
│   ├── interfaces/     # Type definitions
│   └── services/       # Shared services
└── config/             # Configuration files
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## License

This project is licensed under the MIT License.# yt-backend
