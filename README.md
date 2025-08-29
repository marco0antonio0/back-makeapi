# 🚀 Make Api — CMS leve para endpoints e dados

<div style="display: flex; flex-direction: row; gap: 10px; align-items: center; margin-bottom: 20px;">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white">
  <img src="https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white">
  <img src="https://img.shields.io/badge/Docker-0db7ed?style=for-the-badge&logo=docker&logoColor=ffffff">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
  <img src="https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white">
</div>

**Make Api** é um CMS **simples e direto** para criar endpoints REST e gerenciar conteúdo de sites e apps, com foco em velocidade e praticidade.

---

## ⚙️ Requisitos
- Node.js LTS (18+ recomendado)
- npm

---

## 🚚 Instalação e execução
```bash
# instalar dependências
npm install --legacy-peer-dependency

# executar em desenvolvimento
npm run dev
```

Crie um `.env` (ou use `.env.example`), por exemplo:
```env
FIREBASE_API_KEY= 
FIREBASE_AUTH_DOMAIN= 
FIREBASE_PROJECT_ID= 
FIREBASE_APP_ID= 
FIREBASE_MESSAGING_SENDER_ID= 
FIREBASE_STORAGE_BUCKET= 
JWT_SECRET= 
```

---

## 📁 Estrutura mínima sugerida
```
├── 📁 .git/ 🚫 (auto-hidden)
├── 📁 dist/ 🚫 (auto-hidden)
├── 📁 netlify/
│   └── 📁 functions/
│       └── 📄 nest.ts
├── 📁 node_modules/ 🚫 (auto-hidden)
├── 📁 src/
│   ├── 📁 auth/
│   │   ├── 📁 decorators/
│   │   │   └── 📄 user.decorator.ts
│   │   ├── 📁 dtos/
│   │   │   ├── 📄 change-password.dto.ts
│   │   │   ├── 📄 forgot-password.dto.ts
│   │   │   ├── 📄 login.dto.ts
│   │   │   ├── 📄 register-confirm.dto.ts
│   │   │   ├── 📄 register-request.dto.ts
│   │   │   ├── 📄 register.dto.ts
│   │   │   └── 📄 reset-password.dto.ts
│   │   ├── 📄 auth.controller.ts
│   │   ├── 📄 auth.module.ts
│   │   ├── 📄 auth.repositories.ts
│   │   ├── 📄 auth.service.ts
│   │   ├── 📄 jwt-auth.guard.ts
│   │   └── 📄 jwt.strategy.ts
│   ├── 📁 endpoint/
│   │   ├── 📄 endpoint.controller.ts
│   │   ├── 📄 endpoint.module.ts
│   │   ├── 📄 endpoint.repository.ts
│   │   └── 📄 endpoint.service.ts
│   ├── 📁 firebase/
│   │   ├── 📄 firebase.module.ts
│   │   └── 📄 firebase.tokens.ts
│   ├── 📁 itens/
│   │   ├── 📄 itens.controller.ts
│   │   ├── 📄 itens.module.ts
│   │   ├── 📄 itens.repository.ts
│   │   └── 📄 itens.service.ts
│   ├── 📄 app.controller.ts
│   ├── 📄 app.module.ts
│   ├── 📄 app.service.ts
│   └── 📄 main.ts
├── 📁 test/
│   ├── 📄 app.e2e-spec.ts
│   └── 📄 jest-e2e.json
├── 🔒 .env 🚫 (auto-hidden)
├── 📄 .env.example
├── 📄 .eslintrc.js
├── 🚫 .gitignore
├── 📄 .prettierrc
├── 📜 License.md
├── 📖 README.md
├── 🔒 bun.lock 🚫 (auto-hidden)
├── 📄 nest-cli.json
├── ⚙️ netlify.toml
├── 📄 package-lock.json
├── 📄 package.json
├── 📄 tsconfig.build.json 🚫 (auto-hidden)
└── 📄 tsconfig.json
```

---

## 🤝 Contribuição
1. Verifique e **assinale** uma *issue*.
2. Sincronize e crie sua *branch*:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feat/makeapi-<issue>   # ou fix/makeapi-<issue>
   ```
3. Commit objetivo:
   ```bash
   git commit -m "feat/makeapi-<issue>: resumo curto do que foi feito"
   ```
4. Envie e abra o PR:
   ```bash
   git push origin feat/makeapi-<issue>
   ```
   Revise o código e, estando OK, **autorize o merge**.

### Convenções rápidas
- Branches: `feat/makeapi-<issue>`, `fix/makeapi-<issue>`
- Commits: `tipo/escopo: mensagem` (ex.: `feat`, `fix`, `chore`, `docs`)

---

## 🧪 Scripts
```bash
npm run dev
npm run build
npm start
```

---

## 📜 Licença
MIT (ou ajuste conforme necessário).