// netlify/functions/nest.ts
import 'reflect-metadata';
import {
  type Handler,
  type HandlerEvent,
  type HandlerContext,
  type HandlerResponse,
} from '@netlify/functions';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverless from 'serverless-http';
import { AppModule } from '../../src/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'reflect-metadata';
import 'class-transformer';
import 'class-validator'

// Assinatura EXATA do handler da Netlify
type NetlifyHandler = (event: HandlerEvent, context: HandlerContext) => Promise<HandlerResponse>;

let cached: NetlifyHandler | undefined;

async function bootstrap(): Promise<NetlifyHandler> {
  if (cached) return cached;

  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);

  const app = await NestFactory.create(AppModule, adapter, {
    logger: ['error', 'warn', 'log'],
  });

  app.enableCors();
    
  app.setGlobalPrefix('api');  
  const config = new DocumentBuilder()
    .setTitle('MakeAPI API')
    .setDescription('Documentação da API MakeAPI')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  
  await app.init();

  const expressHandler = serverless(expressApp); 

  cached = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const result = await expressHandler(event, context);
    return result as unknown as HandlerResponse;
  };

  return cached;
}

export const handler: Handler = async (event, context) => {
  const h = await bootstrap();
  return h(event, context);
};
