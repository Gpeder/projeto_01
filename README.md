# Projeto

Base de monorepo com pnpm workspaces. O frontend usa React + TypeScript strict +
Vite e Tailwind CSS 4.3.3, com uma amostra de tipografia e cores para revisão visual.

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
| `primary` | `#242629` | `#e8eae5` |
| `on-primary` | `#ffffff` | `#181a1c` |
| `focus` | `#375f85` | `#a7c7e7` |
| `success` | `#286344` | `#8bc4a3` |
| `warning` | `#855400` | `#e5bd75` |
| `error` | `#a63232` | `#eda1a1` |

As cores reproduzem a referência, incluindo o erro antes definido diretamente no
CSS. Atenção (`warning`) é a única adição: não há essa cor nos estilos exportados.
As bordas suaves originais foram preservadas; `border` serve para divisórias e
`control` não deve ser o único indicador de um campo, pois fica abaixo de 3:1
contra as superfícies. O botão da amostra usa a cor de ação e foco visível.

O tema acompanha o sistema por padrão. Para conferir a prioridade do atributo
no console do navegador:

```js
document.documentElement.dataset.theme = 'light'
document.documentElement.dataset.theme = 'dark'
document.documentElement.removeAttribute('data-theme') // Volta ao sistema
```

O atributo controla também `color-scheme` e a variante `dark:` do Tailwind.
Não há seletor visual nem persistência. O `App` é apenas uma amostra desta etapa.

## Organização

- `apps/web`: frontend React + TypeScript + Vite.
- `packages`: reservado para pacotes futuros.
- `docs`: reservado para documentação.
- `pnpm-lock.yaml`: único lockfile, mantido na raiz.

Planejados para etapas futuras, ainda não criados:

- `apps/api`: Node.js + Fastify.
- `packages/database`: Prisma + PostgreSQL.
- `apps/mobile`: Flutter.
