import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { options } from './utils/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = parseInt(process.env.PORT);
  app.enableCors();

  SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, options));

  await app.listen(port ?? 4000);
}
bootstrap();
