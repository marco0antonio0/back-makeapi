// netlify/functions/nest.cjs
let cached;

/** @type {(event:any, context:any)=>Promise<any>} */
async function bootstrap() {
  if (cached) return cached;

  // IMPORTS dinâmicos (não usamos require)
  const serverless = (await import('serverless-http')).default;
  const express = (await import('express')).default;
  await import('reflect-metadata');

  const { NestFactory } = await import('@nestjs/core');
  const { ExpressAdapter } = await import('@nestjs/platform-express');
  const { DocumentBuilder, SwaggerModule } = await import('@nestjs/swagger');

  // AppModule compilado (CommonJS). Pode vir como named export ou em default.
  const dist = await import('../../dist/app.module.js');
  const AppModule = dist.AppModule ?? dist.default?.AppModule;
  if (!AppModule) {
    throw new Error('AppModule não encontrado em ../../dist/app.module.js');
  }

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
  // Fica em: /.netlify/functions/nest/api/docs
  SwaggerModule.setup('api/docs', app, document);

  await app.init();

  const expressHandler = serverless(expressApp);
  cached = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return await expressHandler(event, context);
  };
  return cached;
}

exports.handler = async (event, context) => {
  const h = await bootstrap();
  return h(event, context);
};
