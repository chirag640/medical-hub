# medical-hub

Complete medical records management system with FLAC, RBAC, OAuth, and production features

## 📋 Description

This project was generated using [FoundationWizard](https://github.com/yourusername/foundation-wizard), an automated NestJS project generator.

**Author:** Healthcare Team  
**License:** MIT

## 🚀 Tech Stack

- **Framework:** NestJS 10
- **Language:** TypeScript
- **Database:** MongoDB
- **ORM:** Mongoose
- **Node Version:** 20
- **Package Manager:** npm

## 📦 Installation

```bash
# Install dependencies
npm install
```

## 🔧 Configuration

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Update the environment variables in `.env`:

```env
# MongoDB connection string
DATABASE_URL=mongodb://localhost:27017/medical-hub

PORT=3000
```

## 🏃 Running the app

```bash
# Development
npm run start:dev

# Production mode
npm run start:prod
```

## 🐳 Docker Support

### Using Docker Compose (Recommended)

```bash
# Start all services (app + database)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Using Dockerfile only

```bash
# Build image
docker build -t medical-hub .

# Run container
docker run -p 3000:3000 --env-file .env medical-hub
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🎯 Features

### Basic Features

- ✅ **CORS:** Cross-Origin Resource Sharing enabled
- ✅ **Helmet:** HTTP security headers protection
- ✅ **Compression:** Gzip compression for responses
- ✅ **Validation:** Global request validation with class-validator

### Advanced Features

- ✅ **Structured Logging:** Pino logger with request tracking and performance metrics
- ✅ **Redis Caching:** Distributed caching with cache-manager
- ✅ **API Documentation:** Interactive Swagger/OpenAPI docs at `/api/docs`
- ✅ **Health Checks:** Terminus health monitoring at `/health`
- ✅ **Rate Limiting:** Throttler middleware to prevent abuse
- ✅ **API Versioning:** URI-based versioning support (e.g., `/v1/users`)

## 📝 API Endpoints

### 📚 API Documentation (Swagger)

```
GET /api/docs
```

Interactive API documentation with Swagger UI. All endpoints are documented with request/response schemas and JWT authentication.

### ❤️ Health Check

```
GET /health
```

Returns system health status including:

- Database connectivity
- Memory usage (heap & RSS)
- Disk storage
- Uptime

Response:

```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "memory_heap": { "status": "up" },
    "memory_rss": { "status": "up" },
    "disk": { "status": "up" }
  },
  "details": { ... }
}
```

### Hello World

```
GET /
```

Response:

```
Hello from medical-hub!
```

## 📊 Logging

This project uses **Pino** for structured JSON logging with the following features:

- Request/response logging
- Performance tracking (response time)
- Context-aware logging
- Sensitive data redaction (authorization headers, cookies)
- Pretty printing in development mode

Example log output (development):

```
[14:23:45] INFO  (HTTP): Incoming Request: GET /users
[14:23:45] INFO  (HTTP): Request Completed: GET /users (responseTime: 45ms)
```

Production logs are in JSON format for easy parsing and analysis.

## 🗄️ Caching

Redis-based distributed caching is configured with:

- **Default TTL:** 5 minutes (300 seconds)
- **Strategy:** Cache-aside pattern
- **Invalidation:** Automatic on TTL expiry

### Usage Example

```typescript
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class YourService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getData(key: string) {
    // Try cache first
    const cached = await this.cacheManager.get(key);
    if (cached) return cached;

    // Cache miss - fetch and store
    const data = await this.fetchData();
    await this.cacheManager.set(key, data, 600); // 10 minutes TTL
    return data;
  }
}
```

**Configuration:**
Set `REDIS_URL` in `.env` to use Redis, otherwise falls back to in-memory cache.

```env
REDIS_URL=redis://localhost:6379
```

## 🚦 Rate Limiting

Throttler middleware is configured to prevent API abuse:

- **Default:** 10 requests per 60 seconds
- **Scope:** Per IP address
- **Response:** `429 Too Many Requests` when limit exceeded

### Configuration

Adjust rate limits in `.env`:

```env
THROTTLE_TTL=60000      # Time window (ms)
THROTTLE_LIMIT=10       # Max requests per window
```

### Custom Rate Limits

Override limits per controller/route:

```typescript
import { Throttle } from '@nestjs/throttler';

@Controller('api')
export class ApiController {
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute
  @Get('expensive-operation')
  expensiveOperation() {
    // ...
  }
}
```

## 🔄 API Versioning

URI-based API versioning is enabled. Add versions to your controllers:

```typescript
import { Controller, Get, Version } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Version('1')
  @Get()
  findAllV1() {
    return { version: 'v1', users: [] };
  }

  @Version('2')
  @Get()
  findAllV2() {
    return { version: 'v2', users: [], meta: { total: 0 } };
  }
}
```

Access endpoints:

- `GET /v1/users` - Version 1
- `GET /v2/users` - Version 2

## 📁 Project Structure

```
medical-hub/
├── src/
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
├── test/
├── .env.example
├── .eslintrc.js
├── .gitignore
├── .prettierrc
├── docker-compose.yml
├── Dockerfile
├── nest-cli.json
├── package.json
├── README.md
└── tsconfig.json
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

---

Generated with ❤️ by [FoundationWizard](https://github.com/yourusername/foundation-wizard)
