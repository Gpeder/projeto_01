# Projeto

Base de monorepo com pnpm workspaces. O frontend mantém a tela padrão do template
oficial React + TypeScript do Vite, incluindo logos e contador, com TypeScript strict.

## Executar

Versões utilizadas nesta etapa: Node.js 22.23.2 e pnpm 11.22.0.
Execute os comandos na raiz do projeto:

```sh
pnpm install
pnpm dev
```

Abra o endereço exibido pelo Vite no terminal, normalmente http://localhost:5173.

```sh
pnpm build      # Verifica tipos e gera apps/web/dist
pnpm lint      # Executa o Oxlint do template oficial
pnpm typecheck # Verifica os projetos TypeScript do frontend e do Vite
```

## Organização

- `apps/web`: frontend React + TypeScript + Vite.
- `packages`: reservado para pacotes futuros.
- `docs`: reservado para documentação.
- `pnpm-lock.yaml`: único lockfile, mantido na raiz.

Planejados para etapas futuras, ainda não criados:

- `apps/api`: Node.js + Fastify.
- `packages/database`: Prisma + PostgreSQL.
- `apps/mobile`: Flutter.
