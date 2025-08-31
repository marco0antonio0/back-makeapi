// netlify/functions/nest.cjs
let cached;

/** @type {(event:any, context:any)=>Promise<any>} */
async function bootstrap() {
  if (cached) return cached;

  // IMPORTS dinâmicos (sem require)
  const serverless = (await import('serverless-http')).default;
  const express = (await import('express')).default;
  await import('reflect-metadata');

  const { NestFactory } = await import('@nestjs/core');
  const { ExpressAdapter } = await import('@nestjs/platform-express');
  const { DocumentBuilder, SwaggerModule } = await import('@nestjs/swagger');
  const { ValidationPipe } = await import('@nestjs/common');

  // AppModule compilado (dist)
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

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    validationError: { target: false, value: false },
  }));

  const config = new DocumentBuilder()
    .setTitle('MakeAPI API')
    .setDescription('Documentação da API MakeAPI')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // JSON do Swagger
  expressApp.get('/api/docs-json', (_req, res) => {
    res.type('application/json').send(document);
  });

  // HTML do Swagger (CDN + fallback)
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>MakeAPI Docs</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" type="image/png" sizes="32x32" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/favicon-16x16.png" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" onerror="this.href='https://unpkg.com/swagger-ui-dist@5/swagger-ui.css'" />
  <style>
    body { margin:0; background:#fff; }
    #swagger-ui { height: 100vh; }
    .topbar { display:none; }
    .err { padding: 16px; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial, sans-serif; color:#b91c1c; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <div id="err" class="err" style="display:none"></div>

  <script>
    (function () {
      const CDN1 = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5';
      const CDN2 = 'https://unpkg.com/swagger-ui-dist@5';

      function loadScript(src) {
        return new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = src;
          s.async = false;
          s.onload = () => resolve(src);
          s.onerror = () => reject(new Error('Falha ao carregar: ' + src));
          document.head.appendChild(s);
        });
      }

      async function boot() {
        try {
          try { await loadScript(\`\${CDN1}/swagger-ui-bundle.js\`); }
          catch { await loadScript(\`\${CDN2}/swagger-ui-bundle.js\`); }

          try { await loadScript(\`\${CDN1}/swagger-ui-standalone-preset.js\`); }
          catch { await loadScript(\`\${CDN2}/swagger-ui-standalone-preset.js\`); }

          if (typeof window.SwaggerUIBundle !== 'function') {
            throw new Error('SwaggerUIBundle não disponível após carregar CDNs');
          }

          const ui = window.SwaggerUIBundle({
            url: '/api/docs-json',
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [window.SwaggerUIBundle.presets.apis, window.SwaggerUIStandalonePreset],
            layout: 'BaseLayout',
            docExpansion: 'none',
            persistAuthorization: true,
          });
          window.ui = ui;
        } catch (e) {
          const box = document.getElementById('err');
          box.style.display = 'block';
          box.textContent = 'Falha ao carregar o Swagger UI: ' + (e && e.message ? e.message : e);
        }
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
      } else {
        boot();
      }
    })();
  </script>
</body>
</html>`;

  expressApp.get('/api/docs', (_req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  });

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
