# Projeto

Base de monorepo com pnpm workspaces. O frontend usa React + TypeScript strict +
Vite e Tailwind CSS 4.3.3, com navegação inicial e uma demonstração da base visual.
O produto é uma plataforma web para o profissional acompanhar alunos. Nesta
etapa, existem a base visual, a navegação, uma listagem estática de alunos,
uma visão geral demonstrativa de presença e atividade e páginas provisórias.
O registro de presenças, a integração com relógios e o aplicativo do aluno
ficam para o futuro.

## Executar

Versões utilizadas nesta etapa: Node.js 22.23.2 e pnpm 11.22.0.
Execute os comandos na raiz do projeto:

```sh
pnpm install
pnpm dev
```

Abra o endereço exibido pelo Vite no terminal, normalmente http://localhost:5173.

```sh
pnpm build
pnpm lint
pnpm typecheck
```

## Backend de alimentos

O backend em `apps/api` usa Node.js, TypeScript e Fastify para consultar a USDA
FoodData Central. A integração é independente do frontend.

Copie `apps/api/.env.example` para `apps/api/.env` e preencha `USDA_API_KEY`
manualmente. O arquivo `.env` está ignorado pelo Git. Na raiz, execute:

```sh
pnpm dev:api
```

O servidor atende em `http://127.0.0.1:3001`. Os endpoints são
`GET /foods?query=rice&page=1` e `GET /foods/:id`.
A busca usa os termos originais da USDA, predominantemente em inglês.

`pnpm build`, `pnpm lint` e `pnpm typecheck` verificam os dois aplicativos.
`pnpm test:api` executa os testes locais; `pnpm --filter api test:live` verifica
busca e detalhes na USDA com a chave configurada. Instruções, contrato e limites
estão em [apps/api/README.md](apps/api/README.md).

## Base visual

Tailwind usa o plugin oficial `@tailwindcss/vite` e configuração em CSS, conforme a
[documentação da versão 4](https://tailwindcss.com/docs/installation/using-vite).
A detecção de classes fica limitada a `apps/web/src`; a referência do Figma não
participa da compilação. O Preflight fornece o reset e `box-sizing: border-box`.

As fontes seguem os estilos da referência: Manrope 500/600 nos títulos e Inter
400/500/600 nos textos e controles, carregadas por Google Fonts com `display=swap`
e fallback `system-ui, sans-serif`. O texto base usa `1rem` (16px no padrão do
navegador) e entrelinha 1,5. Sem acesso ao Google Fonts, usa-se a fonte do sistema.

Os tokens ficam em `apps/web/src/index.css` e geram classes semânticas como
`bg-background`, `bg-surface`, `text-foreground`, `text-muted`, `border-border`,
`bg-primary`, `text-on-primary`, `outline-focus` e `text-success`.

| Token | Claro | Escuro |
| --- | --- | --- |
| `background` | `#f7f7f5` | `#181a1c` |
| `surface` | `#ffffff` | `#222528` |
| `surface-muted` | `#f0f1ee` | `#2b2f33` |
| `foreground` | `#202123` | `#f0f1ee` |
| `muted` | `#62666d` | `#b0b5ba` |
| `border` | `#e2e3e0` | `#373c41` |
| `control` | `#b9bcb7` | `#626970` |
| `control-strong` | `#858980` | `#7a8188` |
| `primary` | `#242629` | `#e8eae5` |
| `on-primary` | `#ffffff` | `#181a1c` |
| `focus` | `#375f85` | `#a7c7e7` |
| `success` | `#286344` | `#8bc4a3` |
| `warning` | `#805a12` | `#dfbf79` |
| `error` | `#a63232` | `#eda1a1` |
| `on-error` | `var(--on-primary)` | `var(--on-primary)` |

As cores partem da referência, incluindo atenção (`warning`) nos dois temas.
`control-strong` fornece uma borda com maior contraste para o Button secundário.
O Button destrutivo usa `error` no texto e na borda, com fundo transparente;
o token existente `on-error` permanece disponível, mas não é usado nessa variante.
As bordas suaves originais foram preservadas; `border` serve para divisórias e
`control` não deve ser o único indicador de um campo, pois fica abaixo de 3:1
contra as superfícies. O botão da amostra usa a cor de ação e foco visível.

O tema acompanha o sistema enquanto não houver uma escolha salva. O controle
**Tema claro / Tema escuro** da sidebar alterna o tema e salva a preferência
em `localStorage` (`consta:theme`). O HTML aplica a preferência antes da montagem
do React. Se o armazenamento estiver indisponível, a troca continua funcionando
na sessão atual.

Para conferir os tokens na demonstração em `/dev/components`, use o console:

```js
document.documentElement.dataset.theme = 'light'
document.documentElement.dataset.theme = 'dark'
document.documentElement.removeAttribute('data-theme')
```

O atributo controla também `color-scheme` e a variante `dark:` do Tailwind.
As amostras ficam em `/dev/components`, disponível somente com o servidor de
desenvolvimento.

## Movimento e Button

Os tokens compartilhados de movimento ficam em `apps/web/src/index.css`:

| Token | Valor |
| --- | --- |
| `--duration-fast` | `120ms` |
| `--duration-normal` | `180ms` |
| `--duration-slow` | `280ms` |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` |

No Tailwind, as durações podem ser usadas como `duration-(--duration-normal)` e
as curvas como `ease-standard` e `ease-out`. O Button usa esses mesmos tokens
nos seus estilos locais, com transições de cores e opacidade. A preferência
`prefers-reduced-motion: reduce` remove somente as transições do componente.

```tsx
import Button from './components/ui/Button'

<Button
  type="submit"
  variant="primary"
  size="md"
  loading={saving}
  loadingLabel="Salvando…"
>
  Salvar
</Button>
```

O componente aceita atributos nativos de `button`, incluindo `ref`, `className`,
eventos e atributos ARIA. Os padrões são `primary`, `md` e `type="button"`.
Variantes: `primary`, `secondary`, `ghost` e `destructive`. Tamanhos: `sm` (38px),
`md` (44px) e `lg` (48px), com área mínima de 44 × 44px quando há ponteiro touch.
O tamanho `md` usa texto de 13px e espaçamento horizontal de 17px. A variante
destrutiva mantém texto e borda de erro, com superfície secundária no hover e
durante o clique, preservando o contraste do texto.

`loading` bloqueia o botão nativamente, assim como `disabled`, aplica `aria-busy`
e anuncia o texto de carregamento sem spinner. O nome acessível original é
preservado. Os dois rótulos reservam espaço desde o início para não alterar a
largura ao alternar `loading`; mantenha `children` e `loadingLabel` estáveis
durante a operação. Se mudar o próprio conteúdo, seu tamanho pode mudar.

A seção de botões em `/dev/components` demonstra os estados e uma operação simulada de 1,5s.
O estado de carregamento pertence ao consumidor; o Button não inicia operações
nem gerencia o estado do formulário.

## Navegação

React Router no modo declarativo gerencia as rotas. `/` abre **Visão geral**.
A sidebar oferece **Visão geral**, **Alunos**
(`/alunos`) e **Configurações** (`/configuracoes`), com `aria-current="page"`
no link ativo.
Configurações contém somente título e texto provisório.

A **Visão geral** segue a composição da referência: cabeçalho, destaque do aluno
Gustavo e duas áreas de acompanhamento. A semana de **24 a 30 de junho de 2024**
é identificada como exemplo, coerente com a listagem de alunos. O calendário
mostra duas presenças informadas por check-in no app, nos dias 24 e 26, para uma
meta semanal de três. Dias sem registro não são tratados como faltas.

A área **Atividade pelo relógio** mostra o último treino demonstrativo, com
54 minutos, frequência cardíaca média de 128 bpm e máxima de 156 bpm. Esses
valores são fictícios: não há conexão com dispositivos, sincronização ou
avaliação automática de intensidade. Dados do relógio não confirmam presença
na academia e não são somados aos check-ins. A tela é de consulta, adapta-se
ao mobile e aos dois temas e oferece **Ver alunos** para a listagem existente.
Datas e números usam `Intl` em português brasileiro; as datas do exemplo são
estáveis entre fusos horários. A página não registra presenças nem persiste dados.

A página **Alunos** exibe o cabeçalho **CARTEIRA**, a contagem de um aluno e uma
listagem com dados fixos da referência: Gustavo, identificado como demonstração,
objetivo de ganhar força e melhorar a composição corporal e último treino
**Treino B — Costas e bíceps**, em **26 jun 2024**. A tabela tem cabeçalhos
semânticos e apresenta as informações empilhadas no mobile, nos dois temas.
Não há cadastro, busca, filtros, edição ou integração com API. A ação **Ver aluno**
e sua coluna foram omitidas enquanto não existir uma página de detalhes.

As rotas `/treinos`, `/historicos`, `/evolucao`, `/alimentacao` e `/metas`
continuam acessíveis diretamente, com seus títulos e textos provisórios
preservados, mas saíram da sidebar conforme a referência atualizada. Não há
conteúdo funcional nessas páginas.

A marca identifica a plataforma como **PROFISSIONAL** e o perfil informativo
mostra **Profissional**, inicial **P** e **Modo demonstração**, sem autenticação
ou papéis implementados. A demonstração em `/dev/components` fica fora do menu
e não integra o JavaScript da compilação de produção.

`src/components/layout` contém `AppLayout` e `Sidebar`; `src/pages` contém as
páginas. O layout usa classes Tailwind e os tokens existentes. A sidebar tem
232px no desktop; abaixo de 801px, o botão **Abrir menu** abre o `dialog` modal
existente de 224px, sem barra de navegação inferior. O conteúdo tem largura
máxima de 1160px e espaçamento lateral de 32px entre 801px e 950px, e de 48px
a partir de 951px.
O diálogo bloqueia interação com o conteúdo atrás e a rolagem da página.
**Fechar**, Escape ou a seleção de um link fecham o menu e devolvem o foco
ao acionador. Ao mudar para desktop com o menu aberto, ele fecha e o link ativo
recebe foco. As transições respeitam `prefers-reduced-motion`.

## Organização

- `apps/web`: frontend React + TypeScript + Vite.
- `apps/api`: backend Node.js + TypeScript + Fastify, com integração USDA.
- `packages`: reservado para pacotes futuros.
- `docs`: reservado para documentação.
- `pnpm-lock.yaml`: único lockfile, mantido na raiz.

Planejados para etapas futuras, ainda não criados:

- `packages/database`: Prisma + PostgreSQL.
- `apps/mobile`: Flutter.
