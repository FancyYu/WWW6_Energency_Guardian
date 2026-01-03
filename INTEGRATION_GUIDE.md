# Emergency Guardian System Integration Guide

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- Python 3.9+ (for local development)
- Go 1.19+ (for local development)

### 1. Environment Setup

```bash
# Clone the repository
git clone <repository-url>
cd emergency-guardian

# Copy environment variables
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

### 2. Start the System

#### Development Environment (with hot reload)

```bash
# Start all services in development mode
./scripts/start-system.sh dev

# Or manually with docker-compose
docker-compose -f docker-compose.dev.yml up --build
```

#### Production Environment

```bash
# Start all services in production mode
./scripts/start-system.sh prod

# Or manually with docker-compose
docker-compose up --build
```

### 3. Access the System

#### Development URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **AI Agents**: http://localhost:8001
- **Storage Service**: http://localhost:8002
- **IPFS Gateway**: http://localhost:8080
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

#### Production URLs

- **Main Application**: http://localhost (via Nginx)
- **Monitoring (Grafana)**: http://localhost:3001
- **Metrics (Prometheus)**: http://localhost:9090

## 🏗️ System Architecture

### Services Overview

1. **Frontend** (React + TypeScript + Vite)

   - User interface for emergency management
   - Web3 wallet integration
   - Real-time status updates

2. **Backend** (Node.js + TypeScript + Express)

   - REST API for application logic
   - Database management
   - Authentication and authorization

3. **AI Agents** (Python + FastAPI)

   - Emergency situation analysis
   - Automated decision making
   - Notification coordination

4. **Storage Service** (Go + Gin)

   - IPFS integration
   - Data encryption and sharding
   - File management

5. **Infrastructure Services**
   - **PostgreSQL**: Primary database
   - **Redis**: Caching and message queue
   - **IPFS**: Decentralized storage
   - **Nginx**: API Gateway and load balancer
   - **Prometheus**: Metrics collection
   - **Grafana**: Monitoring dashboards

### Network Architecture

```
Internet
    ↓
[Nginx API Gateway]
    ↓
┌─────────────────────────────────────┐
│           Guardian Network          │
├─────────────┬─────────────┬─────────┤
│  Frontend   │   Backend   │AI Agents│
├─────────────┼─────────────┼─────────┤
│Storage Svc  │ PostgreSQL  │  Redis  │
├─────────────┼─────────────┼─────────┤
│    IPFS     │ Prometheus  │ Grafana │
└─────────────┴─────────────┴─────────┘
```

## 🔧 Configuration

### Environment Variables

Key environment variables to configure:

```bash
# Blockchain
BLOCKCHAIN_RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=0x...
PRIVATE_KEY=0x...

# API Keys
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret_32_chars_min
ENCRYPTION_KEY=your_32_byte_encryption_key

# External Services
SENDGRID_API_KEY=your_sendgrid_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
```

### Service Configuration

Each service can be configured through environment variables:

- **Frontend**: `VITE_*` variables for build-time configuration
- **Backend**: Database, Redis, and external service URLs
- **AI Agents**: API keys and model configurations
- **Storage Service**: IPFS and encryption settings

## 🔍 Monitoring and Debugging

### Viewing Logs

```bash
# View all service logs
./scripts/start-system.sh logs

# View development logs
./scripts/start-system.sh logs dev

# View specific service logs
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f ai-agents
```

### Service Status

```bash
# Check service status
./scripts/start-system.sh status

# Check development status
./scripts/start-system.sh status dev
```

### Health Checks

All services include health check endpoints:

- **Backend**: `GET /health`
- **AI Agents**: `GET /health`
- **Storage Service**: `GET /health`
- **Nginx**: `GET /health`

### Monitoring Dashboards

Access Grafana at http://localhost:3001 (production) for:

- Service performance metrics
- Resource usage monitoring
- Error rate tracking
- Response time analysis

## 🧪 Testing the Integration

### 1. Basic Connectivity Test

```bash
# Test all service endpoints
curl http://localhost:3001/health  # Backend
curl http://localhost:8001/health  # AI Agents
curl http://localhost:8002/health  # Storage Service
curl http://localhost:3000         # Frontend
```

### 2. End-to-End Flow Test

1. **Access Frontend**: Navigate to http://localhost:3000
2. **Connect Wallet**: Use MetaMask or WalletConnect
3. **Create Emergency**: Test emergency creation flow
4. **Verify AI Processing**: Check AI agent logs for processing
5. **Check Storage**: Verify data storage in IPFS
6. **Monitor Backend**: Check backend logs for API calls

### 3. Service Communication Test

```bash
# Test inter-service communication
curl -X POST http://localhost:3001/api/test-ai-connection
curl -X POST http://localhost:3001/api/test-storage-connection
curl -X GET http://localhost:8001/test-storage
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Conflicts**

   ```bash
   # Check what's using the ports
   lsof -i :3000  # Frontend
   lsof -i :3001  # Backend
   lsof -i :8001  # AI Agents
   lsof -i :8002  # Storage Service
   ```

2. **Docker Issues**

   ```bash
   # Clean up Docker resources
   docker system prune -a
   docker volume prune

   # Rebuild without cache
   docker-compose build --no-cache
   ```

3. **Database Connection Issues**

   ```bash
   # Check PostgreSQL logs
   docker-compose logs postgres

   # Connect to database manually
   docker exec -it guardian-postgres psql -U guardian -d emergency_guardian
   ```

4. **IPFS Connection Issues**

   ```bash
   # Check IPFS status
   curl http://localhost:5001/api/v0/id

   # View IPFS logs
   docker-compose logs ipfs
   ```

### Service Dependencies

Services start in this order:

1. Infrastructure (Redis, PostgreSQL, IPFS)
2. Storage Service
3. AI Agents
4. Backend
5. Frontend
6. Nginx (production only)

If a service fails to start, check its dependencies are running first.

## 🔄 Development Workflow

### Making Changes

1. **Frontend Changes**: Hot reload enabled in development mode
2. **Backend Changes**: Nodemon restarts server automatically
3. **AI Agents Changes**: Uvicorn reloads on file changes
4. **Storage Service Changes**: Air provides hot reload for Go

### Adding New Services

1. Create Dockerfile and Dockerfile.dev
2. Add service to docker-compose.yml and docker-compose.dev.yml
3. Configure environment variables
4. Add health check endpoint
5. Update nginx configuration if needed
6. Add monitoring configuration

### Database Migrations

```bash
# Run database migrations
docker exec -it guardian-backend npm run migrate

# Create new migration
docker exec -it guardian-backend npm run migrate:create
```

## 📚 API Documentation

### Backend API

- Swagger UI: http://localhost:3001/api-docs (development)
- OpenAPI spec: http://localhost:3001/api/openapi.json

### AI Agents API

- FastAPI docs: http://localhost:8001/docs
- Redoc: http://localhost:8001/redoc

### Storage Service API

- API documentation: http://localhost:8002/docs

## 🔐 Security Considerations

### Development Environment

- Uses default passwords (change for production)
- No SSL/TLS encryption
- Debug logging enabled
- CORS allows all origins

### Production Environment

- Strong passwords required
- SSL/TLS termination at Nginx
- Production logging levels
- Restricted CORS policies
- Rate limiting enabled
- Security headers configured

### Best Practices

1. Never commit secrets to version control
2. Use strong, unique passwords
3. Enable SSL/TLS in production
4. Regularly update dependencies
5. Monitor for security vulnerabilities
6. Implement proper backup strategies

## 📞 Support

For issues and questions:

1. Check the logs first
2. Review this integration guide
3. Check individual service documentation
4. Create an issue in the repository

## 🎯 Next Steps

After successful integration:

1. Deploy smart contracts to testnet
2. Configure external services (SendGrid, Twilio)
3. Set up production monitoring
4. Implement backup strategies
5. Configure CI/CD pipelines
6. Perform security audit
