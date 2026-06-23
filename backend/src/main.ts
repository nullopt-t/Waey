import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as cors from 'cors';
import * as compression from 'compression';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS for all origins
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Security middleware
  // app.use(helmet());

  app.use(compression());

  // Serve static files for uploads at both /uploads and /api/uploads
  const uploadsPath = join(__dirname, '..', 'data', 'uploads');
  app.use('/uploads', express.static(uploadsPath, {
    setHeaders: (res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    }
  }));
  app.use('/api/uploads', express.static(uploadsPath, {
    setHeaders: (res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    }
  }));

  // Validation pipe with transform
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        // Convert empty strings to undefined
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Apply logging interceptor globally
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Set global prefix
  app.setGlobalPrefix('api');

  // Set server timeouts for long AI processing
  const httpAdapter = app.getHttpAdapter();
  const httpServer = httpAdapter.getHttpServer();
  httpServer.timeout = 120000; // 2 minutes
  httpServer.keepAliveTimeout = 130000;
  httpServer.headersTimeout = 130000;

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('منصة وعي - API')
    .setDescription('توثيق واجهة برمجة التطبيقات لمنصة وعي للصحة النفسية')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', name: 'JWT', description: 'أدخل رمز JWT' },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'منصة وعي - توثيق API',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT;

  if (!port) {
    Logger.error('PORT environment variable is not set', 'Bootstrap');
    process.exit(1);
  }

  // Log environment variables status
  Logger.log('=== Environment Variables Status ===', 'Bootstrap');
  Logger.log(`PORT: ${port}`, 'Bootstrap');
  Logger.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'set' : 'NOT SET'}`, 'Bootstrap');
  Logger.log(`NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`, 'Bootstrap');
  Logger.log(`JWT_SECRET: ${process.env.JWT_SECRET ? 'set' : 'NOT SET'}`, 'Bootstrap');
  Logger.log(`GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? 'set' : 'NOT SET'}`, 'Bootstrap');
  Logger.log('====================================', 'Bootstrap');

  await app.listen(port, "0.0.0.0");
  Logger.log(`Server running on port ${port}`, 'Bootstrap');
}
bootstrap();
