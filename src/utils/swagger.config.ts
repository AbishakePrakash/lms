import { DocumentBuilder } from '@nestjs/swagger';

// Swagger configuration
export const options = new DocumentBuilder()
  .setTitle('Q&A')
  .setDescription('The API documentation for my NestJS app')
  .setVersion('1.0')
  //   .addTag('users') // You can add tags based on your module or API group
  .build();
