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

  // Habilite CORS se precisar
  app.enableCors();
    
  app.setGlobalPrefix('api');  

  // Evite prefixo global aqui (use redirect /api/* no netlify.toml)
  // app.setGlobalPrefix('api');

  await app.init();

  const expressHandler = serverless(expressApp); // retorno é unknown para TS

  cached = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const result = await expressHandler(event, context);
    // Garantimos ao TS que segue o contrato HandlerResponse
    return result as unknown as HandlerResponse;
  };

  return cached;
}

export const handler: Handler = async (event, context) => {
  const h = await bootstrap();
  return h(event, context);
};
