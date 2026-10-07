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

## Etapa atual: cadastro de alimentos conectado à API interna

- Usar pnpm workspaces e um único `pnpm-lock.yaml` na raiz.
- Manter o `package.json` raiz privado e `packageManager` alinhado ao pnpm utilizado.
- Manter React + TypeScript strict + Vite e preservar o layout, os componentes,
  os temas e os tokens existentes em `apps/web`.
- Manter `packages` e `docs` reservados com `.gitkeep` enquanto estiverem vazios.
- Integrar o cadastro existente aos endpoints `GET /foods` e `GET /foods/:id`
  de `apps/api`, preservando o preenchimento manual e o estado local atual.
- Manter a chave USDA exclusivamente no backend, sem exibir seu conteúdo.
- Preservar dados de origem e nutrientes ausentes como `null`, distinguir zero
  de campo vazio e exigir revisão dos dados antes de salvar.
- Não implementar persistência nova, autenticação, cálculos de porção, soma dos
  alimentos de uma refeição, tradução automática ou mudanças nas demais áreas.
- Não instalar dependências sem justificativa aprovada no plano.
- Não configurar Prisma, banco, Docker, Turborepo ou Nx nem recriar o backend.
- Não criar pastas vazias de controllers, services, repositories ou features.
- Documentar somente como futuros: `packages/database` (Prisma + PostgreSQL)
  e `apps/mobile` (Flutter). Não criar esses diretórios nesta etapa.

## Referência do Figma

- `Pasta sem título` é a pasta de referência externa, fora do projeto implementado.
- Não consultar, copiar, modificar, mover ou remover seu conteúdo nesta etapa.
- Não incluir a referência no workspace, nas verificações ou no versionamento.
- Consultas ou uso da referência em etapas futuras dependem de instrução do usuário.

## Verificações

- Quando necessário, instalar dependências com pnpm na raiz.
- Antes da integração, executar `pnpm --filter ./apps/api test:live` sem imprimir
  a chave e identificar a causa de eventual falha.
- Executar `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck` e os testes pertinentes.
- Quando houver acesso ao navegador, verificar cadastro manual, busca e detalhes
  reais, revisão e edição, dados ausentes, erros, cancelamento, respostas antigas,
  temas claro/escuro, movimento reduzido e responsividade.
- Informar explicitamente qualquer verificação que não puder ser executada.
