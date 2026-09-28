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
| `control-strong` | `#858980` | `#7a8188` |
| `primary` | `#242629` | `#e8eae5` |
| `on-primary` | `#ffffff` | `#181a1c` |
| `focus` | `#375f85` | `#a7c7e7` |
| `success` | `#286344` | `#8bc4a3` |
| `warning` | `#855400` | `#e5bd75` |
| `error` | `#a63232` | `#eda1a1` |
| `on-error` | `var(--on-primary)` | `var(--on-primary)` |

As cores partem da referência, incluindo o erro antes definido diretamente no
CSS. Atenção (`warning`) acrescenta uma cor que não havia nos estilos exportados.
`control-strong` fornece uma borda com maior contraste para o Button secundário;
`on-error` reutiliza a cor de texto de ação para o Button destrutivo.
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

`loading` bloqueia o botão nativamente, assim como `disabled`, aplica `aria-busy`
e anuncia o texto de carregamento sem spinner. O nome acessível original é
preservado. Os dois rótulos reservam espaço desde o início para não alterar a
largura ao alternar `loading`; mantenha `children` e `loadingLabel` estáveis
durante a operação. Se mudar o próprio conteúdo, seu tamanho pode mudar.

A seção de botões no `App` demonstra os estados e uma operação simulada de 1,5s.
O estado de carregamento pertence ao consumidor; o Button não inicia operações
nem gerencia o estado do formulário.

## Organização

- `apps/web`: frontend React + TypeScript + Vite.
- `packages`: reservado para pacotes futuros.
- `docs`: reservado para documentação.
- `pnpm-lock.yaml`: único lockfile, mantido na raiz.

Planejados para etapas futuras, ainda não criados:

- `apps/api`: Node.js + Fastify.
- `packages/database`: Prisma + PostgreSQL.
- `apps/mobile`: Flutter.
