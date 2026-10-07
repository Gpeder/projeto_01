# API de alimentos

Backend mínimo em Node.js 22.23.2 ou superior, TypeScript strict e Fastify.
Consulta a FoodData Central e expõe um contrato próprio. A execução é local,
em `127.0.0.1`. O frontend consulta estes endpoints pelo proxy `/api` do Vite
durante o desenvolvimento; a chave permanece exclusivamente neste backend.

## Configuração e execução

Na raiz do monorepo:

```sh
pnpm install
cp -n apps/api/.env.example apps/api/.env
```

Edite **`apps/api/.env`** manualmente e preencha `USDA_API_KEY`. Não cole a chave
em comandos, URLs, mensagens ou arquivos versionados. `PORT` é opcional e tem
padrão `3001`. O carregamento usa exclusivamente o caminho do `.env` do backend;
variáveis já presentes no processo têm precedência. A chave e a porta são
validadas ao iniciar. Uma chave ausente impede a inicialização. A validade junto
à USDA é conferida nas chamadas, não apenas na validação local.

```sh
pnpm dev:api
```

Depois de alterar o `.env`, reinicie o processo. Para executar o código compilado:

```sh
pnpm --filter api build
pnpm start:api
```

O `.gitignore` da raiz já exclui `.env` em qualquer aplicativo e permite
`.env.example`. O backend envia a chave no header `X-Api-Key`, exclusivamente
para a origem fixa da USDA, e rejeita redirecionamentos. Logs não incluem o
objeto de configuração, headers, URLs externas ou erros brutos do provedor.

## Endpoints

```sh
curl --get 'http://127.0.0.1:3001/foods' --data-urlencode 'query=rice cooked' --data 'page=1'
```

`query` é obrigatório, contém de 1 a 200 caracteres e não pode ser composto
apenas de espaços. `page` tem padrão `1` e aceita inteiros de `1` a `999999`.
São retornados no máximo 20 resultados por página. Parâmetros desconhecidos ou
duplicados são rejeitados. A busca inicial usa os termos da USDA,
predominantemente em inglês, sem tradução automática.

A resposta contém `items`, `page`, `pageSize`, `totalItems` e `totalPages`.
Uma busca sem resultados retorna `200` e `items: []`.

Use um `fdcId` recebido na busca para consultar detalhes. Exemplo com um
identificador inspecionado durante o desenvolvimento:

```sh
curl 'http://127.0.0.1:3001/foods/168914'
```

O identificador deve ser um inteiro positivo representável com segurança em
JavaScript. Busca e detalhes retornam alimentos com o mesmo contrato:

```json
{
  "fdcId": 168914,
  "source": "USDA FoodData Central",
  "dataType": "SR Legacy",
  "name": "Rice noodles, cooked",
  "brand": null,
  "brandOwner": null,
  "reference": { "quantity": 100, "unit": "g" },
  "nutrients": {
    "energyKcal": 108,
    "energyNutrientId": 1008,
    "proteinG": 1.79,
    "carbohydrateG": 24.01,
    "fatG": 0.2
  }
}
```

Esse exemplo foi extraído de uma resposta real; não é uma resposta padrão ou
um fallback. Descrição, preparo, capitalização, marca e proprietário são
preservados. `brand` vem de `brandName`; o proprietário permanece separado em
`brandOwner`. Nenhum JSON completo da USDA é devolvido.

## Normalização

Foram inspecionadas respostas reais de busca e detalhes de Foundation, SR Legacy,
Survey (FNDDS) e Branded antes de implementar o mapeamento. A busca usa
`foodNutrients[].nutrientId/value/unitName`; detalhes completos usam
`foodNutrients[].nutrient.id/unitName` e `amount`. O identificador do registro
`foodNutrients[].id` não identifica o nutriente.

| Informação | ID do nutriente USDA | Unidade aceita |
| --- | --- | --- |
| Proteínas | 1003 | g |
| Gorduras totais | 1004 | g |
| Carboidratos por diferença | 1005 | g |
| Energia | 1008 | kcal |
| Energia Atwater geral | 2047 | kcal |
| Energia Atwater específica | 2048 | kcal |

Em Foundation, a prioridade de energia é 2048, 2047 e 1008. Nos demais tipos,
é 1008, 2048 e 2047. `energyNutrientId` informa o valor escolhido; os valores
não são somados nem recalculados. Energia em kJ, incluindo o ID 1062, não é
tratada como kcal nem convertida nesta etapa. Se houver somente kJ,
`energyKcal` e `energyNutrientId` serão `null`.

Em Foundation, SR Legacy e Survey (FNDDS), a referência é 100 g da parte
comestível descrita. Em Branded, os nutrientes padronizados estão em base de
100 unidades; `servingSizeUnit` identifica g ou ml. Também são reconhecidos
os códigos GRM e MLT, respectivamente. A quantidade `servingSize` do rótulo
não é usada como referência desses valores. `labelNutrients`, valores por
porção e `foodPortions` não são usados para completar dados.

Unidades ou tipos sem referência confirmada produzem
`reference: { quantity: null, unit: null }`; os nutrientes continuam sendo os
valores declarados pela USDA, com base não identificada. Não devem ser tratados
como valores por 100 g nesses casos. Nenhuma conversão entre volume e massa é
feita, e não há cálculo de porções.

Dados ausentes, não numéricos, negativos, não finitos ou em unidades
incompatíveis resultam em `null`. Zero numérico declarado é preservado.
Valores com limite de quantificação positivo não são apresentados como zero
medido. Duplicatas conflitantes para o mesmo nutriente/unidade resultam em
`null`. Diferenças de precisão entre busca e detalhes são preservadas;
por exemplo, a amostra SR Legacy retorna carboidratos `24` na busca e `24.01`
nos detalhes.

## Erros e limites

Cada endpoint realiza uma chamada externa, com prazo de 10 segundos incluindo
a leitura do corpo, sem repetição automática. A busca não consulta detalhes
individualmente para completar cada resultado.

| HTTP | Código | Situação |
| --- | --- | --- |
| 400 | `INVALID_INPUT` | Entrada inválida ou rejeitada pela USDA |
| 404 | `FOOD_NOT_FOUND` | Alimento inexistente |
| 404 | `ROUTE_NOT_FOUND` | Rota inexistente |
| 429 | `USDA_RATE_LIMIT` | Limite de consultas do provedor |
| 502 | `USDA_INVALID_RESPONSE` | JSON ou estrutura externa inválida |
| 503 | `USDA_UNAVAILABLE` | Falha de rede, serviço ou credencial recusada |
| 504 | `USDA_TIMEOUT` | Prazo externo excedido |
| 500 | `INTERNAL_ERROR` | Falha interna inesperada |

Erros usam `{ "error": { "code": "...", "message": "..." } }`, sem stacks,
credenciais ou corpo de erro externo. O serviço depende da disponibilidade,
das cotas e dos dados publicados pela USDA. Não há cache ou armazenamento local.

## Verificações

Na raiz:

```sh
pnpm lint
pnpm typecheck
pnpm build
pnpm test:api
pnpm --filter api test:live
```

Os testes locais usam trechos das respostas reais em
`test/fixtures/usda-foods.json`, obtidos em 5 de outubro de 2026 pelo acesso
público de demonstração documentado pela USDA, além de casos sintéticos
identificados nos testes para ausências, unidades, Atwater e falhas.
As amostras correspondem aos FDC IDs 1104812, 168914, 2708356 e 2078244.

`test:live` executa uma busca e os detalhes de um resultado pelos handlers
da aplicação com chamadas reais à USDA. Exige a chave configurada, falha
explicitamente se ela faltar e imprime somente o resultado das verificações,
a quantidade de itens e o identificador consultado. Não é executado
automaticamente por `test:api` e consome duas consultas da cota.

## Organização e referências

`routes.ts` e `schema.ts` definem HTTP e validação; `controller.ts` recebe e
responde; `service.ts` organiza as operações; `normalize.ts` constrói o contrato;
`usda/client.ts` concentra o acesso externo. São módulos e funções simples,
sem banco ou repository.

- [Guia da API USDA](https://fdc.nal.usda.gov/api-guide/)
- [Especificação da API](https://fdc.nal.usda.gov/api-spec/fdc_api.html)
- [Foundation: energia, referência e limites de quantificação](https://fdc.nal.usda.gov/Foundation_Foods_Documentation/)
- [Branded: base nutricional e dados ausentes](https://fdc.nal.usda.gov/GBFPD_Documentation/)
- [FNDDS: base por 100 g e IDs, apêndice K](https://www.ars.usda.gov/ARSUserFiles/80400530/pdf/fndds/2021_2023_FNDDS_Doc.pdf)
- [GS1: códigos de unidades GRM e MLT](https://gs1.se/en/guides/documentation/code-lists/t0055-unit-of-measure/)
- [Autenticação por header no api.data.gov](https://api.data.gov/docs/developer-manual/)

Dados: U.S. Department of Agriculture, Agricultural Research Service,
FoodData Central. O acesso público de demonstração foi usado apenas na coleta
das amostras; o backend nunca o utiliza como alternativa à configuração da chave.
