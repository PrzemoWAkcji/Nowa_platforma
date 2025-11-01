# 🏃‍♂️ Athletics Platform - Development Guide

> Professional development environment for the Athletics Competition Management Platform

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **Git** (latest version)

### One-Command Setup & Start

```bash
# First time setup (installs dependencies, sets up database)
npm run setup

# Start development environment
npm run dev
```

That's it! 🎉

## 📋 Available Commands

### 🔥 **Primary Commands** (Most Used)

| Command | Description | Use Case |
|---------|-------------|----------|
| `npm run dev` | Start both frontend & backend in development mode | Daily development |
| `npm run setup` | Complete project setup (first time) | Initial setup |
| `npm run build` | Build both applications for production | Before deployment |
| `npm run test` | Run all tests (backend + frontend) | Before commits |

### 🛠️ **Development Commands**

| Command | Description |
|---------|-------------|
| `npm run clean` | Clean all build artifacts |
| `npm run lint` | Lint all code |
| `npm run format` | Format all code |
| `npm run setup:fresh` | Fresh setup (cleans everything first) |

### 🗄️ **Database Commands**

| Command | Description |
|---------|-------------|
| `npm run db:migrate` | Run database migrations |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm run db:seed` | Seed database with test data |
| `npm run db:reset` | Reset database (⚠️ destructive) |

### 🔍 **Individual Service Commands**

#### Backend (NestJS API)
```bash
npm run backend:dev      # Start backend in development
npm run backend:build    # Build backend
npm run backend:test     # Run backend tests
npm run backend:lint     # Lint backend code
```

#### Frontend (Next.js Web)
```bash
npm run frontend:dev     # Start frontend in development
npm run frontend:build   # Build frontend
npm run frontend:test    # Run frontend tests
npm run frontend:lint    # Lint frontend code
```

## 🌐 **Service URLs**

When running `npm run dev`, the following services will be available:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main web application |
| **Backend API** | http://localhost:3002 | REST API endpoints |
| **API Documentation** | http://localhost:3002/api | Swagger/OpenAPI docs |
| **Database Studio** | http://localhost:5555 | Prisma Studio (run `npm run db:studio`) |

## 🏗️ **Project Structure**

```
athletics-platform/
├── athletics-platform/
│   ├── backend/          # NestJS API server
│   │   ├── src/          # Source code
│   │   ├── prisma/       # Database schema & migrations
│   │   └── test/         # Test files
│   └── frontend/         # Next.js web application
│       ├── src/          # Source code
│       ├── components/   # React components
│       └── pages/        # Next.js pages
├── athletics-platform-agent/  # Desktop agent (FinishLynx integration)
└── package.json          # Root package.json (monorepo)
```

## 🔧 **Development Workflow**

### Daily Development
1. **Start development environment:**
   ```bash
   npm run dev
   ```

2. **Make your changes** in either `athletics-platform/backend/` or `athletics-platform/frontend/`

3. **Test your changes:**
   ```bash
   npm run test
   ```

4. **Lint and format:**
   ```bash
   npm run lint
   npm run format
   ```

### Database Changes
1. **Modify schema** in `athletics-platform/backend/prisma/schema.prisma`

2. **Create migration:**
   ```bash
   npm run db:migrate
   ```

3. **Generate client:**
   ```bash
   npm run db:generate
   ```

### Adding New Dependencies

#### Backend Dependencies
```bash
cd athletics-platform/backend
npm install package-name
```

#### Frontend Dependencies
```bash
cd athletics-platform/frontend
npm install package-name
```

## 🚨 **Troubleshooting**

### Common Issues

#### Port Already in Use
```bash
# Kill processes on ports 3000 and 3002
npx kill-port 3000 3002
```

#### Database Issues
```bash
# Reset database completely
npm run db:reset

# Fresh setup
npm run setup:fresh
```

#### Node Modules Issues
```bash
# Clean and reinstall everything
npm run clean
rm -rf node_modules athletics-platform/*/node_modules
npm run setup
```

#### Cache Issues
```bash
# Clear Next.js cache
npm run frontend:clean

# Clear NestJS build cache
npm run backend:clean
```

## 🎯 **Best Practices**

### Code Quality
- Always run `npm run lint` before committing
- Use `npm run format` to maintain consistent code style
- Write tests for new features
- Follow TypeScript strict mode

### Database
- Always create migrations for schema changes
- Test migrations on development database first
- Use descriptive migration names
- Backup production data before running migrations

### Git Workflow
```bash
# Before starting work
git pull origin main
npm run setup

# Before committing
npm run lint
npm run test
npm run build

# Commit with conventional commits
git commit -m "feat: add new competition feature"
```

## 📊 **Performance Monitoring**

### Development Metrics
- **Backend startup:** ~3-5 seconds
- **Frontend startup:** ~5-10 seconds
- **Hot reload:** <1 second
- **Build time:** ~30-60 seconds

### Health Checks
```bash
# Check if services are running
npm run health

# Individual health checks
npm run backend:health
npm run frontend:health
```

## 🔐 **Environment Variables**

### Backend (.env)
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-jwt-secret"
NODE_ENV="development"
PORT=3002
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:3002"
NODE_ENV="development"
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run test`
5. Commit: `git commit -m "feat: add amazing feature"`
6. Push: `git push origin feature/amazing-feature`
7. Create a Pull Request

## 📞 **Support**

- **Documentation:** Check this file and inline code comments
- **Issues:** Create GitHub issues for bugs
- **Questions:** Use GitHub Discussions

---

**Happy Coding! 🚀**

*Athletics Platform Development Team*