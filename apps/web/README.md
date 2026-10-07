# Frontend

React 19, TypeScript strict e Vite, com os componentes, temas e tokens existentes.

## Comunicação com a API de alimentos

Na raiz do monorepo, execute em terminais separados:

```sh
pnpm dev:api
pnpm dev
```

A chave USDA já configurada em `apps/api/.env` é lida apenas pelo backend.
O navegador acessa `GET /api/foods?query=...&page=...` e `GET /api/foods/:id`.
O proxy de desenvolvimento do Vite remove `/api` e encaminha as requisições
para `http://127.0.0.1:3001`. Se o backend usar outra porta, configure
`API_PROXY_TARGET` no ambiente do Vite ou em `apps/web/.env.local`, por exemplo
`API_PROXY_TARGET=http://127.0.0.1:3002`, e reinicie o Vite.

O proxy é uma configuração de desenvolvimento, não acompanha os arquivos do
build. Fora dele, configure no servidor de hospedagem um proxy reverso de
`/api/foods` para `/foods` da API. Para outro prefixo ou URL pública, defina
`VITE_API_BASE_URL` no ambiente de compilação, por exemplo `/backend`, e gere
novamente o build. Essa variável é pública; nunca coloque credenciais nela.
Prefira frontend e API na mesma origem. Uma origem diferente exige uma política
CORS explícita no backend/servidor; esta etapa não habilita CORS irrestrito.

## Cadastro de alimentos

Em `/alunos/gustavo/alimentacao`, o modal de cadastro oferece preenchimento
manual ou busca na USDA. A busca ocorre somente ao acionar Buscar e utiliza
termos em inglês. Os resultados são paginados e os detalhes são consultados
somente após selecionar um alimento. O formulário fica editável para revisão,
e o alimento é incluído no estado local apenas ao confirmar Salvar alimento.

Alternar o modo mantém o rascunho. Substituir dados já preenchidos exige
confirmação. Busca e detalhes têm estados de carregamento separados,
acessíveis e com movimento reduzido. Cancelar, fechar, trocar de modo ou
iniciar outra consulta invalida respostas anteriores. Falhas permitem tentar
novamente ou continuar manualmente; não há fallback para dados demonstrativos.
A consulta web tem limite de 15 segundos, incluindo a leitura da resposta;
o backend mantém seu limite de 10 segundos para o provedor.

Nutrientes vazios são `null`; zero é um valor informado. Decimais são preservados.
Os nutrientes correspondem à quantidade e unidade de referência do formulário.
Referência desconhecida na origem ou alterada pelo usuário exige preenchimento
e confirmação de revisão. Não há conversão entre unidades ou recálculo por porção.

O cadastro preserva o FDC ID e uma cópia do contrato original da API, incluindo
nome, marca, proprietário, tipo, referência, nutrientes e ID de energia.
Registra edições manuais e os campos diferentes da origem. O modal permite
consultar esses dados originais, sem atribuir os valores editados à USDA.
Cadastros incompletos são identificados na listagem. A soma já existente dos
totais planejados das refeições propaga ausências por nutriente; os alimentos
do cadastro não são somados automaticamente às refeições.

Os cadastros continuam no estado local da página do aluno. Recarregar a página
ou sair dela perde esses dados; não há armazenamento permanente, banco ou login.

## Verificação

Na raiz:

```sh
pnpm --filter ./apps/api test:live
pnpm --filter ./apps/web test
pnpm test:api
pnpm lint
pnpm typecheck
pnpm build
```

Os testes web usam o executor nativo do Node.js 22.23.2 ou superior, sem novas
dependências. Cobrem dados ausentes, precisão, origem, revisão de referência,
erros, timeout, cancelamento e invalidação de respostas fora de ordem.
As respostas simuladas existem somente nos testes, sem uso em produção.
