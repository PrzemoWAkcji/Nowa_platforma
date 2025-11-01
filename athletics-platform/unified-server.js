const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const express = require('express');
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./backend/dist/src/app.module');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Inicjalizacja Next.js
const app = next({ dev, hostname, port, dir: './frontend' });
const handle = app.getRequestHandler();

async function startUnifiedServer() {
  try {
    console.log('🚀 Uruchamianie zunifikowanego serwera...');
    
    // Przygotowanie Next.js
    await app.prepare();
    console.log('✅ Next.js przygotowany');
    
    // Tworzenie aplikacji NestJS
    const nestApp = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });
    
    // Konfiguracja CORS dla NestJS
    nestApp.enableCors({
      origin: [`http://localhost:${port}`],
      credentials: true,
    });
    
    // Inicjalizacja NestJS jako middleware
    await nestApp.init();
    const nestExpressApp = nestApp.getHttpAdapter().getInstance();
    console.log('✅ NestJS przygotowany');
    
    // Tworzenie głównego serwera Express
    const server = express();
    
    // API routes - przekierowanie do NestJS
    server.use('/api', nestExpressApp);
    server.use('/auth', nestExpressApp);
    server.use('/competitions', nestExpressApp);
    server.use('/events', nestExpressApp);
    server.use('/athletes', nestExpressApp);
    server.use('/results', nestExpressApp);
    server.use('/combined-events', nestExpressApp);
    server.use('/uploads', nestExpressApp);
    
    // Wszystkie inne requesty - Next.js
    server.all('*', (req, res) => {
      return handle(req, res);
    });
    
    // Uruchomienie serwera
    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`🎉 Zunifikowany serwer działa na http://localhost:${port}`);
      console.log(`📱 Frontend: http://localhost:${port}`);
      console.log(`🔧 Backend API: http://localhost:${port}/api`);
    });
    
  } catch (error) {
    console.error('❌ Błąd podczas uruchamiania serwera:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Zamykanie serwera...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Zamykanie serwera...');
  process.exit(0);
});

startUnifiedServer();