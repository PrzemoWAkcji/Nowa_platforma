# 🛠️ Nowoczesny Stos Technologiczny - 2024/2025

## 🎯 **Architektura Ogólna**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (NestJS)      │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │   + Redis       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Microservices │    │   Analytics     │
│   (React Native)│    │   (Docker)      │    │   (ClickHouse)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 **Backend - Nowoczesne Rozwiązania**

### **Framework: NestJS** ⭐
```typescript
// Przykład modułu zawodów
@Module({
  imports: [TypeOrmModule.forFeature([Competition])],
  controllers: [CompetitionController],
  providers: [CompetitionService],
  exports: [CompetitionService],
})
export class CompetitionModule {}

@Controller('competitions')
@UseGuards(JwtAuthGuard)
export class CompetitionController {
  constructor(private competitionService: CompetitionService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  async findAll(@Query() query: FindCompetitionsDto) {
    return this.competitionService.findAll(query);
  }
}
```

**Zalety NestJS:**
- Architektura modularna
- Wbudowane dependency injection
- Decorators i metadata
- Świetne TypeScript support
- Built-in testing utilities
- Microservices support

### **ORM: Prisma 5.0** ⭐
```prisma
// schema.prisma
model Competition {
  id          String   @id @default(cuid())
  name        String
  startDate   DateTime
  endDate     DateTime
  location    String
  type        CompetitionType
  status      CompetitionStatus @default(DRAFT)
  
  events      Event[]
  registrations Registration[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("competitions")
}
```

**Zalety Prisma:**
- Type-safe database access
- Auto-generated client
- Database migrations
- Introspection
- Real-time subscriptions
- Multi-database support

### **Cache: Redis Stack** ⭐
```typescript
// Redis configuration
@Injectable()
export class CacheService {
  constructor(@InjectRedis() private redis: Redis) {}

  async setCompetitionResults(competitionId: string, results: any[]) {
    await this.redis.setex(
      `competition:${competitionId}:results`,
      3600, // 1 hour TTL
      JSON.stringify(results)
    );
  }

  async getLeaderboard(eventId: string) {
    return this.redis.zrevrange(`leaderboard:${eventId}`, 0, -1, 'WITHSCORES');
  }
}
```

### **Message Queue: BullMQ** ⭐
```typescript
// Background job processing
@Processor('results-processing')
export class ResultsProcessor {
  @Process('calculate-points')
  async calculatePoints(job: Job<{ resultId: string }>) {
    const { resultId } = job.data;
    // Complex points calculation logic
    await this.pointsService.calculateAndSave(resultId);
  }
}
```

## 🎨 **Frontend - Next.js 14 App Router**

### **Framework: Next.js 14** ⭐
```typescript
// app/competitions/page.tsx
import { Suspense } from 'react';
import { CompetitionsList } from '@/components/competitions/competitions-list';
import { CompetitionsFilter } from '@/components/competitions/competitions-filter';

export default function CompetitionsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Zawody</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <CompetitionsFilter />
        </aside>
        <main className="lg:col-span-3">
          <Suspense fallback={<CompetitionsListSkeleton />}>
            <CompetitionsList />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
```

### **UI Library: Shadcn/ui + Tailwind** ⭐
```typescript
// components/ui/competition-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CompetitionCardProps {
  competition: Competition;
}

export function CompetitionCard({ competition }: CompetitionCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{competition.name}</CardTitle>
          <Badge variant={getStatusVariant(competition.status)}>
            {competition.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            📍 {competition.location}
          </p>
          <p className="text-sm text-muted-foreground">
            📅 {formatDate(competition.startDate)}
          </p>
          <Button className="w-full mt-4">
            Zobacz szczegóły
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### **State Management: Zustand** ⭐
```typescript
// stores/competition-store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface CompetitionState {
  competitions: Competition[];
  selectedCompetition: Competition | null;
  filters: CompetitionFilters;
  
  // Actions
  setCompetitions: (competitions: Competition[]) => void;
  selectCompetition: (competition: Competition) => void;
  updateFilters: (filters: Partial<CompetitionFilters>) => void;
}

export const useCompetitionStore = create<CompetitionState>()(
  devtools(
    persist(
      (set, get) => ({
        competitions: [],
        selectedCompetition: null,
        filters: {},
        
        setCompetitions: (competitions) => set({ competitions }),
        selectCompetition: (competition) => set({ selectedCompetition: competition }),
        updateFilters: (filters) => set({ 
          filters: { ...get().filters, ...filters } 
        }),
      }),
      { name: 'competition-store' }
    )
  )
);
```

### **Data Fetching: TanStack Query v5** ⭐
```typescript
// hooks/use-competitions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useCompetitions(filters?: CompetitionFilters) {
  return useQuery({
    queryKey: ['competitions', filters],
    queryFn: () => competitionApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateCompetition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: competitionApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
    },
  });
}
```

## 📱 **Mobile App - React Native + Expo**

### **Framework: Expo Router** ⭐
```typescript
// app/(tabs)/competitions.tsx
import { Stack } from 'expo-router';
import { CompetitionsList } from '@/components/competitions-list';

export default function CompetitionsScreen() {
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Zawody',
          headerSearchBarOptions: {
            placeholder: 'Szukaj zawodów...',
          },
        }} 
      />
      <CompetitionsList />
    </>
  );
}
```

## 🗄️ **Database - PostgreSQL + Extensions**

### **PostgreSQL 16 + Extensions** ⭐
```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Full-text search
CREATE EXTENSION IF NOT EXISTS "timescaledb"; -- Time-series data
CREATE EXTENSION IF NOT EXISTS "postgis"; -- Geospatial data

-- Optimized indexes
CREATE INDEX CONCURRENTLY idx_competitions_date_status 
ON competitions (start_date, status) 
WHERE status IN ('UPCOMING', 'ONGOING');

CREATE INDEX CONCURRENTLY idx_results_athlete_event 
ON results (athlete_id, event_id) 
INCLUDE (result_value, position);

-- Full-text search
CREATE INDEX CONCURRENTLY idx_athletes_search 
ON athletes USING gin(to_tsvector('polish', first_name || ' ' || last_name));
```

### **TimescaleDB for Analytics** ⭐
```sql
-- Time-series table for performance metrics
CREATE TABLE athlete_performance_metrics (
  time TIMESTAMPTZ NOT NULL,
  athlete_id UUID NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  metric_name VARCHAR(50) NOT NULL,
  metric_value DECIMAL(10,3) NOT NULL,
  competition_id UUID,
  
  PRIMARY KEY (time, athlete_id, event_type, metric_name)
);

-- Convert to hypertable
SELECT create_hypertable('athlete_performance_metrics', 'time');

-- Continuous aggregates for real-time analytics
CREATE MATERIALIZED VIEW athlete_monthly_stats
WITH (timescaledb.continuous) AS
SELECT 
  time_bucket('1 month', time) AS month,
  athlete_id,
  event_type,
  AVG(metric_value) as avg_performance,
  MAX(metric_value) as best_performance,
  COUNT(*) as competitions_count
FROM athlete_performance_metrics
GROUP BY month, athlete_id, event_type;
```

## 🔄 **Real-time Features**

### **WebSocket with Socket.io** ⭐
```typescript
// Real-time results updates
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'competitions',
})
export class CompetitionGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join-competition')
  handleJoinCompetition(
    @MessageBody() competitionId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`competition-${competitionId}`);
  }

  async broadcastResult(competitionId: string, result: Result) {
    this.server
      .to(`competition-${competitionId}`)
      .emit('new-result', result);
  }
}
```

## 🧪 **Testing Strategy**

### **Unit Tests: Vitest** ⭐
```typescript
// tests/services/competition.service.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { CompetitionService } from '@/services/competition.service';

describe('CompetitionService', () => {
  let service: CompetitionService;

  beforeEach(() => {
    service = new CompetitionService();
  });

  it('should calculate points correctly', () => {
    const result = service.calculatePoints('100M', 10.50, 'MALE', 'SENIOR');
    expect(result).toBe(1021);
  });
});
```

### **E2E Tests: Playwright** ⭐
```typescript
// tests/e2e/competition-registration.spec.ts
import { test, expect } from '@playwright/test';

test('athlete can register for competition', async ({ page }) => {
  await page.goto('/competitions/123');
  await page.click('[data-testid="register-button"]');
  await page.fill('[data-testid="athlete-select"]', 'John Doe');
  await page.click('[data-testid="submit-registration"]');
  
  await expect(page.locator('[data-testid="success-message"]'))
    .toContainText('Rejestracja zakończona pomyślnie');
});
```

## 🚀 **DevOps & Deployment**

### **Containerization: Docker** ⭐
```dockerfile
# Dockerfile.backend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### **Orchestration: Docker Compose** ⭐
```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/athletics
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: timescale/timescaledb:latest-pg16
    environment:
      POSTGRES_DB: athletics
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## 📊 **Monitoring & Observability**

### **APM: OpenTelemetry** ⭐
```typescript
// tracing.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

### **Metrics: Prometheus** ⭐
```typescript
// metrics.ts
import { register, Counter, Histogram } from 'prom-client';

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route'],
});
```

## 🔒 **Security**

### **Authentication: Auth0 / Supabase Auth** ⭐
```typescript
// auth.config.ts
export const authConfig = {
  providers: [
    {
      id: 'auth0',
      name: 'Auth0',
      type: 'oauth',
      authorization: {
        url: 'https://your-domain.auth0.com/authorize',
        params: {
          scope: 'openid email profile',
          audience: 'https://api.athletics-platform.com',
        },
      },
    },
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
  },
};
```

## 🎯 **Performance Optimizations**

### **Caching Strategy** ⭐
```typescript
// Multi-level caching
@Injectable()
export class CompetitionService {
  // L1: In-memory cache
  @Cacheable({ ttl: 300 }) // 5 minutes
  async getCompetition(id: string) {
    // L2: Redis cache
    const cached = await this.redis.get(`competition:${id}`);
    if (cached) return JSON.parse(cached);
    
    // L3: Database
    const competition = await this.prisma.competition.findUnique({
      where: { id },
      include: { events: true, registrations: true },
    });
    
    await this.redis.setex(`competition:${id}`, 3600, JSON.stringify(competition));
    return competition;
  }
}
```

### **Database Optimization** ⭐
```sql
-- Partitioning for large tables
CREATE TABLE results_2024 PARTITION OF results
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Materialized views for complex queries
CREATE MATERIALIZED VIEW athlete_statistics AS
SELECT 
  a.id,
  a.first_name,
  a.last_name,
  COUNT(r.id) as total_competitions,
  AVG(r.points) as average_points,
  MAX(r.points) as best_points
FROM athletes a
LEFT JOIN results r ON a.id = r.athlete_id
GROUP BY a.id, a.first_name, a.last_name;

-- Refresh strategy
CREATE OR REPLACE FUNCTION refresh_athlete_statistics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY athlete_statistics;
END;
$$ LANGUAGE plpgsql;
```

## 📈 **Scalability Considerations**

1. **Horizontal Scaling**: Microservices architecture
2. **Database Sharding**: By region/competition type
3. **CDN**: Static assets and images
4. **Load Balancing**: Multiple backend instances
5. **Auto-scaling**: Kubernetes with HPA
6. **Edge Computing**: Cloudflare Workers for global performance

Ten nowoczesny stos technologiczny zapewni Twojej platformie przewagę konkurencyjną i przygotuje ją na przyszłość! 🚀