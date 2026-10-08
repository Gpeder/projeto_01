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

## Etapa atual: nutrientes por quantidade e totais automáticos das refeições

- Usar pnpm workspaces e um único `pnpm-lock.yaml` na raiz.
- Manter o `package.json` raiz privado e `packageManager` alinhado ao pnpm utilizado.
- Manter React + TypeScript strict + Vite e preservar o layout, os componentes,
  os temas e os tokens existentes em `apps/web`.
- Manter `packages` e `docs` reservados com `.gitkeep` enquanto estiverem vazios.
- Preservar o cadastro integrado aos endpoints `GET /foods` e `GET /foods/:id`
  de `apps/api`, preservando o preenchimento manual e o estado local atual.
- Manter a chave USDA exclusivamente no backend, sem exibir seu conteúdo.
- Preservar dados de origem e nutrientes ausentes como `null`, distinguir zero
  de campo vazio e exigir revisão dos dados antes de salvar.
- Calcular localmente nutrientes por quantidade, na mesma unidade da referência,
  e totais das refeições por alimento, sem consultar novamente a USDA.
- Preservar cópias independentes dos dados do catálogo nas refeições e os totais
  manuais existentes, com escolha explícita entre modo manual e calculado.
- Não implementar persistência nova, autenticação, conversão entre unidades,
  tradução automática ou mudanças nas demais áreas.
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

## Leitura eficiente do projeto

- Leia apenas os arquivos pertinentes à tarefa e suas dependências diretas.
  Amplie a investigação somente quando necessário.
- Localize arquivos e símbolos com buscas direcionadas antes de abrir arquivos inteiros.
- Não faça varreduras completas do monorepo em toda solicitação.
- Evite ler `node_modules`, `dist`, `build`, `coverage`, caches, arquivos gerados
  e logs extensos, salvo quando necessários ao diagnóstico.
- Consulte `pnpm-lock.yaml` somente em tarefas de dependências, instalação
  ou problemas relacionados.
- Não leia o conteúdo de `.env` ou credenciais. Para conferir configuração,
  use `.env.example` e verifique presença de variáveis sem imprimir valores.
- Consulte “Pasta sem título” somente quando eu solicitar referência visual,
  limitando a leitura aos componentes envolvidos.
- Não releia arquivos que já estejam no contexto e não tenham mudado.
- Leia apenas as skills pertinentes à tarefa.
- Limite a saída dos comandos aos trechos relevantes.
- Faça validações proporcionais à alteração, preservando as verificações
  obrigatórias do projeto.
- Responda de forma objetiva: alterações, verificações e pendências.

Essas regras não devem impedir a leitura de código necessário para corrigir
um problema com segurança.
