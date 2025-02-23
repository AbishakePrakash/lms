import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { options } from './utils/swagger.config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = parseInt(process.env.PORT) || 5000;
  app.enableCors();

  SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, options));

  await app.listen(port);
  Logger.debug(`Application is running on port ${port}`);
}
bootstrap();
