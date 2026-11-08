# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Widgets do perfil

O perfil (`/perfil`, `/perfil/:id`) tem uma parte fixa (foto, nome, foco, instituição, conexões, competências, bio, Curso, Período e Especialidades) e, abaixo dela, um grid de widgets que cada estudante organiza no modo "Personalizar perfil". Há também um espaço opcional para um widget compacto no canto superior direito do topo azul.

### Como o layout é salvo

- O layout fica no próprio usuário, em `User.profileLayout` (`{ version: 1, hero, widgets }`, tipos em `src/types/index.ts`), e é gravado com `userService.update` na coluna `profiles.profile_layout` (jsonb) do Supabase.
- Sem layout salvo, a página usa `defaultLayout`: projeto fixado, Links, Selos (se houver) e a galeria de projetos.
- Todo layout lido passa por `sanitizeLayout` (`src/widgets/layout.ts`), que descarta tipos desconhecidos e widgets cujos dados sumiram, corrige tamanhos e cores fora da paleta e limita o grid a 12 widgets e a 2 widgets azul-marinho. Dados quebrados nunca derrubam a página.
- Ao salvar, `featuredProjectId` é sincronizado com o primeiro "Projeto fixado" do layout, para o resto do app continuar funcionando.

### Onde fica cada parte

- `src/widgets/specs.ts`: regras de cada tipo (tamanhos, se cabe no topo, validação da configuração).
- `src/widgets/theme.ts`: paleta permitida e cores de texto derivadas do fundo.
- `src/widgets/layout.ts`: funções puras de leitura e edição (testadas em `layout.test.ts`).
- `src/widgets/registry.ts`: liga cada tipo à sua visualização (`views/`) e ao formulário (`settings/`).
- `src/pages/profile/`: a página, a parte fixa (`ProfileCore.tsx`) e o modo de edição (`edit/`).
- `src/i18n/pt-BR.ts`: todos os textos da página e dos widgets.

### Como adicionar um tipo de widget

1. Acrescente o id em `WidgetType` (`src/types/index.ts`).
2. Descreva o tipo em `WIDGET_SPECS` (`src/widgets/specs.ts`): categoria, tamanhos, `heroSafe`, tema padrão, `createConfig`, `sanitizeConfig` e `isEmpty`. Use só dados que já existem; se faltar dado, `createConfig` devolve `null`.
3. Crie a visualização em `src/widgets/views/` (recebe `widget`, `ctx`, `inHero`, `colors`, `headingId`) e, se houver opções, o formulário em `src/widgets/settings/`.
4. Registre os dois em `WIDGET_REGISTRY` (`src/widgets/registry.ts`) e adicione os textos em `t.widgets.types` (`src/i18n/pt-BR.ts`).
5. Adicione testes para a validação da configuração e rode `npm test`, `npm run build` e `npm run lint`.

Cores vêm só de `WIDGET_BGS` e `WIDGET_ACCENTS`; o contorno é sempre tinta e a cor do texto nunca é escolhida pelo estudante.
