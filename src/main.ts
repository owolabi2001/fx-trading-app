import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter, EEnvironmentConstants, LoggingInterceptor, TransformInterceptor } from './common';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { SendMailService } from './modules/mail/services';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = new Logger();
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new LoggingInterceptor());

  app.useGlobalInterceptors(new TransformInterceptor());

  app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)));

  const mailer = app.get(SendMailService);

  mailer.sendMailTest();

  const config = new DocumentBuilder()
    .setTitle('CredPal FX Trading App')
    .setDescription('Official API documentation for CredPal FX Trading App.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (c: string, method: string) => method,
    ignoreGlobalPrefix: false,
  };

  const document = SwaggerModule.createDocument(app, config, options);

  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: `FX Trading Swagger UI.`,
    swaggerOptions: {
      displayOperationId: true,
      persistAuthorization: true,
      docExpansion: 'none',
      displayRequestDuration: true,
      deepLinking: true,
      tryItOutEnabled: true,
    },
    jsonDocumentUrl: 'swagger/json',
  });


  const port = configService.get<number>(EEnvironmentConstants.port) ?? 8010;

  await app.listen(port, () => logger.log(`App Running on port ${port} 🚀.`));
}
bootstrap();
