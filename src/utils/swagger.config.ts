import { DocumentBuilder } from '@nestjs/swagger';

// Base configuration
const baseOptions = new DocumentBuilder()
  .setTitle('Q&A')
  .setDescription('The API documentation for my NestJS app')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
    'access-token',
  )
  .addTag('App')
  .addTag('Auth')
  .addTag('Users')
  .addTag('Courses')
  .addTag('Questions')
  .addTag('Answers')
  .addTag('Comments');

// Exported options
export const options = baseOptions.build();
