# Repository Information Overview

## Repository Summary
This repository contains a professional athletics competition management platform with three main components: a backend API, a frontend web application, and a desktop agent for integration with the FinishLynx timing system.

## Repository Structure
- **athletics-platform/**: Main web application with backend and frontend
- **athletics-platform-agent/**: Desktop application for FinishLynx integration
- **Documentation files**: Various markdown files with implementation details

### Main Repository Components
- **Backend API**: NestJS application with SQLite database
- **Frontend**: Next.js 15 web application
- **Desktop Agent**: Electron application for FinishLynx integration

## Projects

### Athletics Platform Backend
**Configuration File**: `package.json`

#### Language & Runtime
**Language**: TypeScript
**Version**: TypeScript 5.7.3
**Build System**: NestJS CLI
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- NestJS v11.0.1 (Core, Common, Platform)
- Prisma ORM v6.11.0
- JWT Authentication
- Class Validator

#### Build & Installation
```bash
cd athletics-platform/backend
npm install
npx prisma migrate dev --name init
npm run start:dev
```

#### Testing
**Framework**: Jest
**Test Location**: `/test` directory
**Naming Convention**: `*.spec.ts`
**Run Command**:
```bash
npm run test
npm run test:e2e
```

### Athletics Platform Frontend
**Configuration File**: `package.json`

#### Language & Runtime
**Language**: TypeScript
**Version**: TypeScript 5.x
**Build System**: Next.js
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- Next.js 15.3.4
- React 19.0.0
- TanStack Query 5.81.5
- Zustand 5.0.6
- Tailwind CSS 4.x

#### Build & Installation
```bash
cd athletics-platform/frontend
npm install
npm run dev
```

### Athletics Platform Agent
**Configuration File**: `package.json`

#### Language & Runtime
**Language**: JavaScript
**Version**: Node.js
**Build System**: Electron Builder
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- Electron 27.0.0
- Axios 1.6.0
- Chokidar 3.5.3
- Winston 3.11.0
- Electron Store 8.1.0

#### Build & Installation
```bash
cd athletics-platform-agent
npm install
npm run build-win
```

## Database Schema
The application uses Prisma ORM with SQLite database. Key models include:
- **User**: System users with different roles
- **Athlete**: Athletes with personal information
- **Competition**: Athletic competitions
- **Event**: Individual events within competitions
- **Registration**: Athlete registrations for competitions
- **Result**: Performance results
- **CombinedEvent**: Multi-discipline events like decathlon

## Features
- **Competition Management**: Create and manage athletic competitions
- **Combined Events**: Support for official World Athletics and Masters (WMA) multi-events
- **Results Management**: Track and field results recording
- **FinishLynx Integration**: Automatic synchronization with timing system
- **User Authentication**: Role-based access control

## API Endpoints
- **Competitions**: CRUD operations for competitions
- **Combined Events**: Manage multi-discipline events
- **Athletes**: Manage athlete information
- **Results**: Record and retrieve performance results

## Development Status
- **Backend**: Functional with core features implemented
- **Frontend**: Basic UI components and integration
- **Agent**: Complete with FinishLynx integration
- **Authentication**: In progress