# CapyFolio

Este projeto está localizado na pasta `capyfolio/` e foi desenvolvido como uma plataforma acadêmica para estudantes, pesquisadores e projetos universitários.

## O que é o projeto

O CapyFolio funciona como uma rede social institucional focada em:

- compartilhar publicações acadêmicas e atualizações de estudantes;
- apresentar projetos de pesquisa e desenvolvimento;
- divulgar eventos e oportunidades acadêmicas;
- conectar pessoas por área de interesse, curso e instituição;
- expor perfis com formação, foco de pesquisa e projetos em destaque.

A ideia central é aproximar a comunidade acadêmica, ajudando estudantes e pesquisadores a encontrar projetos, oportunidades e contatos relevantes dentro do ambiente universitário.

## Estrutura do repositório

- `capyfolio/` — aplicação principal em React + TypeScript + Vite;
- `capyfolio/src/` — componentes, páginas, contextos e serviços da aplicação;
- `capyfolio/src/lib/` — cliente Supabase, tipos gerados do banco e envio de imagens;
- `capyfolio/scripts/` — gerador dos dados de exemplo (`generate-seed.mjs`) a partir de `scripts/seed-data/*.json`;
- `capyfolio/public/` — arquivos públicos estáticos;
- `capyfolio/package.json` — scripts de execução e dependências.

## Como executar o projeto

1. Abra o terminal no diretório raiz do projeto:

   ```bash
   cd "c:\Users\Nucelles\Documents\University\Design Thinking\capyfolio"
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure o Supabase: copie `capyfolio/.env.example` para `capyfolio/.env.local` e preencha as duas variáveis abaixo (o arquivo `.env.local` é ignorado pelo git).

   | Variável | Valor |
   |---|---|
   | `VITE_SUPABASE_URL` | URL do projeto (Supabase > Project Settings > API) |
   | `VITE_SUPABASE_ANON_KEY` | chave publishable/anon. Nunca use a chave `service_role` no frontend. |

   Na Vercel, cadastre as mesmas duas variáveis em Production, Preview e Development. Sem elas, o app não inicia e mostra o erro no console.

4. Inicie a aplicação em modo de desenvolvimento:

   ```bash
   npm run dev
   ```

5. Acesse a URL mostrada no terminal, geralmente:

   ```text
   http://localhost:5173
   ```

## Como navegar na aplicação

### 1. Acesso e autenticação

Ao abrir a aplicação, você entra na tela de login.

- Use a opção de login para entrar com uma conta cadastrada;
- Se ainda não tiver conta, acesse a tela de cadastro;
- A autenticação usa Supabase Auth (e-mail e senha). Publicações, curtidas, comentários, favoritos, inscrições e conexões ficam no banco Supabase, por conta. Os perfis, projetos, eventos e posts iniciais são dados de exemplo (`is_sample`), não pessoas ou instituições reais.

### 2. Feed acadêmico

Depois de entrar, a primeira área normalmente acessada é o feed.

Nesse espaço você pode:

- visualizar postagens da comunidade;
- curtir publicações;
- comentar nas postagens;
- criar novas postagens;
- publicar projetos novos.

### 3. Projetos

Na área de projetos, você encontra:

- lista de projetos e pesquisas;
- cards com informações resumidas;
- possibilidade de salvar projetos como favoritos;
- detalhes completos de cada projeto em uma página específica.

### 4. Eventos

Na seção de eventos, é possível:

- consultar a agenda acadêmica;
- abrir detalhes de cada evento;
- verificar informações como data, local, categoria e programação;
- registrar inscrição em eventos abertos.

### 5. Pessoas

A seção de pessoas permite:

- buscar estudantes e pesquisadores;
- explorar perfis por nome, foco ou instituição;
- conectar-se com outras pessoas da comunidade.

### 6. Perfil

No perfil:

- você pode visualizar dados pessoais e acadêmicos;
- conferir seus projetos publicados;
- criar um novo projeto;
- destacar um projeto como principal no perfil.

### 7. Navegação geral

A aplicação usa navegação por rotas, então você pode se deslocar entre:

- `/login` — tela de login;
- `/cadastro` — cadastro;
- `/feed` — feed principal;
- `/projetos` — projetos;
- `/eventos` — eventos;
- `/pessoas` — pessoas;
- `/perfil` — seu perfil.

## Observações finais

- A interface foi desenvolvida com foco em manter a identidade visual original do protótipo.
- Todo o conteúdo textual foi mantido em português do Brasil.
- O projeto está estruturado para evoluir facilmente para integração real com backend, autenticação e banco de dados no futuro.

Se quiser continuar o desenvolvimento, a próxima etapa natural é expandir os dados mockados, criar integrações reais e melhorar a experiência de edição do perfil e dos projetos.
