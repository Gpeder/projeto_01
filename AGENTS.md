# Desenvolvimento por etapas

- Implementar somente a etapa solicitada pelo usuário.
- Antes de modificar arquivos em cada nova etapa, inspecionar os arquivos pertinentes,
  verificar o estado do Git, apresentar um plano curto e aguardar aprovação explícita.
- Se o destino do trabalho estiver ambíguo, confirmar o caminho antes de criar arquivos.
- Preservar trabalho existente, a pasta `.git` e o histórico. Não restaurar, sobrescrever,
  excluir ou remover arquivos do índice sem autorização específica.
- Não criar repositórios Git aninhados. Não fazer commit ou push sem autorização explícita.
- Ao concluir uma etapa, informar alterações, verificações, limitações e estado do Git;
  parar e aguardar a próxima tarefa, sem antecipar sua implementação.

## Etapa atual: base do monorepo

- Usar pnpm workspaces e um único `pnpm-lock.yaml` na raiz.
- Manter o `package.json` raiz privado e `packageManager` alinhado ao pnpm utilizado.
- Manter `apps/web` com o template oficial React + TypeScript do Vite, TypeScript strict,
  tela padrão, logos, contador, estilos e assets originais.
- Manter `packages` e `docs` reservados com `.gitkeep` enquanto estiverem vazios.
- Não criar código de negócio, telas ou componentes próprios, temas, tokens ou navegação.
- Não instalar bibliotecas de interface, estado, formulários ou requisições.
- Não configurar API, Prisma, banco, Docker, Turborepo ou Nx.
- Não criar pastas vazias de controllers, services, repositories ou features.
- Documentar somente como futuros: `apps/api` (Node.js + Fastify), `packages/database`
  (Prisma + PostgreSQL) e `apps/mobile` (Flutter). Não criar esses diretórios nesta etapa.

## Referência do Figma

- `Pasta sem título` é a pasta de referência externa, fora do projeto implementado.
- Não consultar, copiar, modificar, mover ou remover seu conteúdo nesta etapa.
- Não incluir a referência no workspace, nas verificações ou no versionamento.
- Consultas ou uso da referência em etapas futuras dependem de instrução do usuário.

## Verificações

- Instalar dependências com pnpm na raiz.
- Executar `pnpm dev`, `pnpm build`, `pnpm lint` e `pnpm typecheck`.
- Quando houver acesso ao navegador, verificar a tela padrão, os logos e o contador.
- Informar explicitamente qualquer verificação que não puder ser executada.
