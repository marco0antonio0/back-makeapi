# 🚀 NestJS Template for Netlify
<div style="display: flex; flex-direction: row; gap: 10px; align-items: center; margin-bottom: 20px;">
  <img src="https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
  <img src="https://img.shields.io/badge/Serverless-FD5750?style=for-the-badge&logo=serverless&logoColor=white">
</div>

- [View pt-br version](#template-nestjs-para-netlify)

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

👋 **Welcome!**  
This project is a **ready-to-use template** for building APIs with **NestJS** and running them in a **serverless** environment on [Netlify](https://www.netlify.com/).  
The goal is to provide a clean, simple, and functional starting point so you can start quickly:  
- All endpoints are under `/api/...`
- Comes with an example endpoint `/api/health` that returns the application status
- Well-organized and easy-to-extend structure

---
> ---
>
> Example: [https://template-nestjs.netlify.app/api/health](https://template-nestjs.netlify.app/api/health)
>
> ---

## 🚀 How to use this template

Create a new project using this template:

```bash
npx degit marco0antonio0/template_nest_netlify my-project
```

Install dependencies:

```bash
cd my-project
npm install
```

Run locally with Netlify CLI:

```bash
npm install -g netlify-cli
netlify dev
```

---

## 📂 File Structure

### `src/main.ts`
```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```
> **Purpose**: Default NestJS entry point for local execution (`npm run start:dev`).  
> On Netlify, it is not used directly because the bootstrap is done in `netlify/functions/nest.ts`.

---

### `netlify/functions/nest.ts`
```ts
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverless from 'serverless-http';
import { AppModule } from '../../src/app.module';
```
> **Purpose**:  
> - Adapts the NestJS app to run in a **serverless** environment using `serverless-http`.  
> - Sets `app.setGlobalPrefix('api')` so all endpoints are under `/api/...`.  
> - Uses caching to avoid recreating the server on each invocation (improves warm start performance).  
> - Exports `handler`, which is the function Netlify calls for each request.

---

### `src/app.module.ts`
```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```
> **Purpose**: Root module of the NestJS app.  
> - Registers controllers and providers.  
> - In this template, only `AppController` and `AppService` are configured.

---

### `src/app.controller.ts`
```ts
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  getHeath() {
    return { status: 'up' };
  }
}
```
> **Purpose**:  
> - Defines application routes.  
> - In this template, it has a `GET /api/health` route that returns `{ status: 'up' }` as an example.

---

## 🔗 Default endpoints in the template
- **GET `/api/health`** → Returns the API status.

---

## 🛠️ Technologies used
- [NestJS](https://nestjs.com/) — Progressive Node.js framework.
- [Express](https://expressjs.com/) — HTTP server used by NestJS.
- [serverless-http](https://github.com/dougmoscrop/serverless-http) — Adapts Express for serverless environments.
- [Netlify Functions](https://docs.netlify.com/functions/overview/) — Netlify's serverless functions.

---

## 📌 Notes
- To add new routes, create new **controllers** in `src/` and they will be automatically available under the `/api/` prefix.
- In production, **Netlify** uses the `netlify/functions/nest.ts` file as the entry point.
- To change the `/api` prefix, update `app.setGlobalPrefix()` in `netlify/functions/nest.ts` and `netlify.toml`.

---

# Template NestJS para Netlify
<div style="display: flex; flex-direction: row; gap: 10px; align-items: center; margin-bottom: 20px;">
  <img src="https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
  <img src="https://img.shields.io/badge/Serverless-FD5750?style=for-the-badge&logo=serverless&logoColor=white">
</div>
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

👋 **Bem-vindo(a)!**  
Este projeto é um **template pronto** para você criar APIs usando **NestJS** e rodá-las de forma **serverless** na plataforma [Netlify](https://www.netlify.com/).  
A ideia é fornecer uma base limpa, simples e funcional para que você possa começar rápido:  
- Todos os endpoints ficam sob `/api/...`
- Já vem com um endpoint de exemplo `/api/health` que retorna o status da aplicação
- Estrutura organizada e fácil de expandir

---
> ---
>
> Exemplo: [https://template-nestjs.netlify.app/api/health](https://template-nestjs.netlify.app/api/health)
>
> ---

## 🚀 Como usar este template

Para criar um novo projeto usando este template:

```bash
npx degit marco0antonio0/template_nest_netlify meu-projeto
```

Instale as dependências:

```bash
cd meu-projeto
npm install
```

Para rodar localmente com o Netlify CLI:

```bash
npm install -g netlify-cli
netlify dev
```

---

## 📂 Estrutura de Arquivos

### `src/main.ts`
```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```
> **Função**: Arquivo de entrada padrão do NestJS para execução local (`npm run start:dev`).  
> No Netlify, não é utilizado diretamente, pois o bootstrap é feito pelo `netlify/functions/nest.ts`.

---

### `netlify/functions/nest.ts`
```ts
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverless from 'serverless-http';
import { AppModule } from '../../src/app.module';
```
> **Função**:  
> - Adapta a aplicação NestJS para rodar no formato **serverless** usando `serverless-http`.  
> - Define `app.setGlobalPrefix('api')` para que todos os endpoints fiquem sob `/api/...`.  
> - Usa cache para evitar recriar o servidor a cada invocação (melhorando performance).  
> - Exporta `handler`, que é a função que o Netlify invoca para cada requisição.

---

### `src/app.module.ts`
```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```
> **Função**: Módulo raiz do NestJS.  
> - Registra controladores (`controllers`) e provedores (`providers`).  
> - No template, apenas o `AppController` e `AppService` estão configurados.

---

### `src/app.controller.ts`
```ts
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  getHeath() {
    return { status: 'up' };
  }
}
```
> **Função**:  
> - Define as rotas da aplicação.  
> - Neste template, há uma rota `GET /api/health` que retorna `{ status: 'up' }` como exemplo.

---

## 🔗 Endpoints padrão no template
- **GET `/api/health`** → Retorna status da API.

---

## 🛠️ Tecnologias utilizadas
- [NestJS](https://nestjs.com/) — Framework Node.js progressivo.
- [Express](https://expressjs.com/) — Servidor HTTP usado pelo NestJS.
- [serverless-http](https://github.com/dougmoscrop/serverless-http) — Adapta Express para ambientes serverless.
- [Netlify Functions](https://docs.netlify.com/functions/overview/) — Funções serverless da Netlify.

---

## 📌 Observações
- Para adicionar novas rotas, crie novos **controllers** no `src/` e eles estarão automaticamente disponíveis sob o prefixo `/api/`.
- Para produção, o **Netlify** usará o arquivo `netlify/functions/nest.ts` como ponto de entrada.
- Se quiser mudar o prefixo `/api`, altere o `app.setGlobalPrefix()` no `netlify/functions/nest.ts` e o `netlify.toml`.

---