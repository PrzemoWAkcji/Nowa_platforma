# 📊 Monitoring & Observability Guide

## Spis Treści

1. [Wprowadzenie](#wprowadzenie)
2. [Prometheus Setup](#prometheus-setup)
3. [Grafana Setup](#grafana-setup)
4. [Health Checks](#health-checks)
5. [Alerting](#alerting)
6. [Log Aggregation](#log-aggregation)

---

## Wprowadzenie

Ten przewodnik pomoże Ci skonfigurować kompletny stack monitoringu dla Athletics Platform.

### Stack Monitoringu

- **Prometheus** - Zbieranie metryk
- **Grafana** - Wizualizacja i dashboardy
- **Winston** - Logging (już skonfigurowany)
- **Health Checks** - Status aplikacji

---

## Prometheus Setup

### 1. Dodaj Prometheus do Docker Compose

Edytuj `docker-compose.yml`:

```yaml
services:
  # Istniejące serwisy...

  # 📊 Prometheus - Metrics Collection
  prometheus:
    image: prom/prometheus:latest
    container_name: athletics-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - "--config.file=/etc/prometheus/prometheus.yml"
      - "--storage.tsdb.path=/prometheus"
      - "--web.console.libraries=/usr/share/prometheus/console_libraries"
      - "--web.console.templates=/usr/share/prometheus/consoles"
    restart: unless-stopped
    networks:
      - monitoring

  # 📈 Node Exporter - System Metrics
  node-exporter:
    image: prom/node-exporter:latest
    container_name: athletics-node-exporter
    ports:
      - "9100:9100"
    restart: unless-stopped
    networks:
      - monitoring

volumes:
  prometheus_data:
    driver: local

networks:
  monitoring:
    driver: bridge
```

### 2. Utwórz Konfigurację Prometheus

Utwórz plik `monitoring/prometheus/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    monitor: "athletics-platform"

# Alerting configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets: []

# Load rules
rule_files:
  - "alerts.yml"

# Scrape configurations
scrape_configs:
  # Backend API metrics
  - job_name: "backend"
    static_configs:
      - targets: ["backend:3001"]
    metrics_path: "/metrics"

  # Node Exporter - System metrics
  - job_name: "node-exporter"
    static_configs:
      - targets: ["node-exporter:9100"]

  # Prometheus itself
  - job_name: "prometheus"
    static_configs:
      - targets: ["localhost:9090"]
```

### 3. Dodaj Metrics Endpoint do Backendu

Zainstaluj potrzebne pakiety:

```bash
cd athletics-platform/backend
npm install prom-client
```

Utwórz `src/monitoring/metrics.service.ts`:

```typescript
import { Injectable } from "@nestjs/common";
import { register, Counter, Histogram, Gauge } from "prom-client";

@Injectable()
export class MetricsService {
  // HTTP Request metrics
  public readonly httpRequestDuration = new Histogram({
    name: "http_request_duration_seconds",
    help: "Duration of HTTP requests in seconds",
    labelNames: ["method", "route", "status_code"],
    buckets: [0.1, 0.5, 1, 2, 5],
  });

  public readonly httpRequestTotal = new Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status_code"],
  });

  // Database metrics
  public readonly dbQueryDuration = new Histogram({
    name: "db_query_duration_seconds",
    help: "Duration of database queries in seconds",
    labelNames: ["operation"],
    buckets: [0.01, 0.05, 0.1, 0.5, 1],
  });

  public readonly dbConnectionsActive = new Gauge({
    name: "db_connections_active",
    help: "Number of active database connections",
  });

  // Application metrics
  public readonly competitionsTotal = new Gauge({
    name: "competitions_total",
    help: "Total number of competitions",
  });

  public readonly athletesTotal = new Gauge({
    name: "athletes_total",
    help: "Total number of athletes",
  });

  // Get all metrics
  async getMetrics(): Promise<string> {
    return register.metrics();
  }

  // Reset metrics (for testing)
  resetMetrics() {
    register.clear();
  }
}
```

Dodaj endpoint w `src/app.controller.ts`:

```typescript
import { Controller, Get, Header } from "@nestjs/common";
import { MetricsService } from "./monitoring/metrics.service";

@Controller()
export class AppController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get("metrics")
  @Header("Content-Type", "text/plain")
  async getMetrics() {
    return this.metricsService.getMetrics();
  }
}
```

---

## Grafana Setup

### 1. Dodaj Grafana do Docker Compose

```yaml
services:
  # 📊 Grafana - Visualization
  grafana:
    image: grafana/grafana:latest
    container_name: athletics-grafana
    ports:
      - "3003:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD:-admin}
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
      - ./monitoring/grafana/dashboards:/var/lib/grafana/dashboards
    depends_on:
      - prometheus
    restart: unless-stopped
    networks:
      - monitoring

volumes:
  grafana_data:
    driver: local
```

### 2. Konfiguracja Data Source

Utwórz `monitoring/grafana/provisioning/datasources/prometheus.yml`:

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false
```

### 3. Dashboard Configuration

Utwórz `monitoring/grafana/provisioning/dashboards/dashboard.yml`:

```yaml
apiVersion: 1

providers:
  - name: "Athletics Platform"
    orgId: 1
    folder: ""
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /var/lib/grafana/dashboards
```

### 4. Przykładowy Dashboard

Utwórz `monitoring/grafana/dashboards/athletics-platform.json`:

```json
{
  "dashboard": {
    "title": "Athletics Platform Overview",
    "panels": [
      {
        "title": "HTTP Requests per Second",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Response Time (95th percentile)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds_bucket)"
          }
        ]
      },
      {
        "title": "Active Database Connections",
        "targets": [
          {
            "expr": "db_connections_active"
          }
        ]
      },
      {
        "title": "Total Competitions",
        "targets": [
          {
            "expr": "competitions_total"
          }
        ]
      }
    ]
  }
}
```

---

## Health Checks

### 1. Enhanced Health Check Endpoint

Backend już ma health check w `src/health/health.controller.ts`. Możesz go rozszerzyć:

```typescript
import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Controller("health")
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    // Check database
    let dbStatus = "ok";
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      dbStatus = "error";
    }

    // Check memory
    const memUsage = process.memoryUsage();
    const memoryMB = Math.round(memUsage.heapUsed / 1024 / 1024);

    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus,
      memory: {
        heapUsed: `${memoryMB}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      },
      version: process.env.npm_package_version || "1.0.0",
    };
  }

  @Get("ready")
  async readiness() {
    // Check if app is ready to serve traffic
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: "ready" };
    } catch (error) {
      throw new Error("Service not ready");
    }
  }

  @Get("live")
  async liveness() {
    // Simple liveness probe
    return { status: "alive" };
  }
}
```

### 2. Kubernetes-Style Health Checks

W `docker-compose.yml`:

```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health/live"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

---

## Alerting

### 1. Utwórz Alert Rules

Utwórz `monitoring/prometheus/alerts.yml`:

```yaml
groups:
  - name: athletics_platform_alerts
    interval: 30s
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: |
          rate(http_requests_total{status_code=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors/sec"

      # High response time
      - alert: HighResponseTime
        expr: |
          histogram_quantile(0.95, http_request_duration_seconds_bucket) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }}s"

      # Service down
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.job }} is down"
          description: "{{ $labels.job }} has been down for more than 1 minute"

      # High memory usage
      - alert: HighMemoryUsage
        expr: |
          (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) 
          / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is above 90%"

      # Database connection issues
      - alert: DatabaseConnectionHigh
        expr: db_connections_active > 50
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High number of database connections"
          description: "Active connections: {{ $value }}"
```

### 2. Alertmanager (Opcjonalnie)

```yaml
services:
  alertmanager:
    image: prom/alertmanager:latest
    container_name: athletics-alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./monitoring/alertmanager:/etc/alertmanager
    command:
      - "--config.file=/etc/alertmanager/alertmanager.yml"
    restart: unless-stopped
    networks:
      - monitoring
```

Utwórz `monitoring/alertmanager/alertmanager.yml`:

```yaml
global:
  resolve_timeout: 5m

route:
  group_by: ["alertname", "cluster", "service"]
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: "email"

receivers:
  - name: "email"
    email_configs:
      - to: "alerts@yourdomain.com"
        from: "alertmanager@yourdomain.com"
        smarthost: "smtp.gmail.com:587"
        auth_username: "your-email@gmail.com"
        auth_password: "your-app-password"

  - name: "slack"
    slack_configs:
      - api_url: "YOUR_SLACK_WEBHOOK_URL"
        channel: "#alerts"
        title: "{{ .CommonAnnotations.summary }}"
        text: "{{ .CommonAnnotations.description }}"
```

---

## Log Aggregation

### Winston (Już Skonfigurowany)

Backend już używa Winston do logowania. Logi są zapisywane w:

- `logs/combined.log` - Wszystkie logi
- `logs/error.log` - Tylko błędy
- `logs/warn.log` - Ostrzeżenia
- `logs/security-combined.log` - Logi bezpieczeństwa

### Dostęp do Logów

```bash
# Zobacz logi w czasie rzeczywistym
docker-compose exec backend tail -f logs/combined.log

# Przeszukaj logi
docker-compose exec backend grep "ERROR" logs/error.log

# Analiza logów JSON
docker-compose exec backend cat logs/combined.log | jq 'select(.level=="error")'
```

---

## Quick Start - Uruchomienie Monitoringu

### 1. Utwórz strukturę katalogów

```bash
mkdir -p monitoring/{prometheus,grafana/provisioning/{datasources,dashboards},grafana/dashboards,alertmanager}
```

### 2. Skopiuj pliki konfiguracyjne

(Użyj konfiguracji z powyższych sekcji)

### 3. Uruchom stack monitoringu

```bash
docker-compose up -d prometheus grafana node-exporter
```

### 4. Dostęp do dashboardów

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3003 (admin/admin)
- **Backend Metrics**: http://localhost:3001/metrics

### 5. Import gotowych dashboardów

W Grafana możesz zaimportować gotowe dashboardy:

- Node Exporter Full: ID `1860`
- Docker Container & Host Metrics: ID `10619`

---

## Best Practices

### 1. Metryki do Monitorowania

**RED Metrics (Request Rate, Errors, Duration)**:

- ✅ Request rate per endpoint
- ✅ Error rate (4xx, 5xx)
- ✅ Response time (p50, p95, p99)

**USE Metrics (Utilization, Saturation, Errors)**:

- ✅ CPU usage
- ✅ Memory usage
- ✅ Database connections
- ✅ Disk I/O

**Business Metrics**:

- ✅ Number of competitions
- ✅ Number of active athletes
- ✅ Number of results recorded
- ✅ User logins per day

### 2. Alert Fatigue Prevention

- ⚠️ Ustaw odpowiednie thresholdy
- ⚠️ Użyj `for:` clause aby uniknąć fałszywych alarmów
- ⚠️ Grupuj podobne alerty
- ⚠️ Dokumentuj każdy alert

### 3. Retention

```yaml
# Prometheus - zachowaj dane przez 15 dni
command:
  - "--storage.tsdb.retention.time=15d"
  - "--storage.tsdb.retention.size=10GB"
```

---

## Troubleshooting

### Prometheus nie zbiera metryk

```bash
# Sprawdź targets w Prometheus
curl http://localhost:9090/api/v1/targets

# Sprawdź czy backend odpowiada
curl http://localhost:3001/metrics
```

### Grafana nie łączy się z Prometheus

```bash
# Test z kontenera Grafana
docker-compose exec grafana curl http://prometheus:9090
```

### Wysokie użycie zasobów

```bash
# Ogranicz retencję
# Zmniejsz scrape interval
# Użyj recording rules dla kosztownych zapytań
```

---

## 📚 Dodatkowe Zasoby

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Node Exporter](https://github.com/prometheus/node_exporter)
- [Best Practices](https://prometheus.io/docs/practices/)

---

**Happy Monitoring! 📊**
