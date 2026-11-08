// Profile tags students can pick, plus course profiles that decide which tags to suggest and rank first.
// Groups only organise the list; every tag stays searchable for every course.
// Names keep their usual spelling (proper nouns, Portuguese terms). The test file checks for duplicates.

export type TagGroupId =
  | 'languages' | 'query' | 'frontend' | 'backend' | 'mobile' | 'data' | 'ai' | 'cloud' | 'testing' | 'security'
  | 'worktools' | 'hardware' | 'roles' | 'practices' | 'areas' | 'soft'
  | 'archDesign' | 'archTools' | 'urban' | 'representation' | 'civil' | 'builtRoles'
  | 'design' | 'comms' | 'arts' | 'engineering' | 'science' | 'business';

export const TAG_GROUPS: { id: TagGroupId; label: string; tags: string[] }[] = [
  {
    id: 'languages',
    label: 'Linguagens de programação',
    tags: [
      'Python', 'JavaScript', 'TypeScript', 'Java', 'C', 'C++', 'C#', 'Go', 'Rust', 'Kotlin', 'Swift', 'Objective-C',
      'PHP', 'Ruby', 'R', 'MATLAB', 'Julia', 'Scala', 'Dart', 'Elixir', 'Erlang', 'Haskell', 'OCaml', 'F#', 'Clojure',
      'Lisp', 'Scheme', 'Prolog', 'Lua', 'Perl', 'Groovy', 'Visual Basic', 'Delphi', 'Pascal', 'Fortran', 'COBOL',
      'Ada', 'Zig', 'Nim', 'Crystal', 'Mojo', 'Assembly', 'WebAssembly', 'Solidity', 'Move', 'Cairo', 'GDScript',
      'Apex', 'ABAP', 'SAS', 'Stata', 'Octave', 'Elm', 'PureScript', 'ReScript', 'CoffeeScript', 'Racket', 'Smalltalk',
    ],
  },
  {
    id: 'query',
    label: 'Linguagens de consulta, marcação e script',
    tags: [
      'SQL', 'PL/SQL', 'T-SQL', 'PL/pgSQL', 'GraphQL', 'SPARQL', 'Cypher', 'HTML', 'CSS', 'Sass', 'Less', 'XML', 'JSON',
      'YAML', 'Markdown', 'LaTeX', 'Bash', 'Shell Script', 'PowerShell', 'Zsh', 'Makefile', 'Regex', 'VHDL', 'Verilog',
      'SystemVerilog', 'CUDA', 'OpenCL', 'GLSL', 'HLSL',
    ],
  },
  {
    id: 'frontend',
    label: 'Front-end',
    tags: [
      'React', 'Next.js', 'Vue.js', 'Nuxt', 'Angular', 'Svelte', 'SvelteKit', 'SolidJS', 'Qwik', 'Astro', 'Remix',
      'Gatsby', 'Ember.js', 'Alpine.js', 'htmx', 'jQuery', 'Redux', 'Zustand', 'MobX', 'Pinia', 'RxJS', 'React Query',
      'Tailwind CSS', 'Bootstrap', 'Material UI', 'Chakra UI', 'shadcn/ui', 'Ant Design', 'Styled Components',
      'Storybook', 'Vite', 'Webpack', 'Babel', 'ESLint', 'Prettier', 'Three.js', 'D3.js', 'Chart.js', 'WebGL',
      'Web Components', 'PWA', 'SEO',
    ],
  },
  {
    id: 'backend',
    label: 'Back-end e APIs',
    tags: [
      'Node.js', 'Deno', 'Bun', 'Express', 'NestJS', 'Fastify', 'Koa', 'Hono', 'Django', 'Django REST Framework',
      'Flask', 'FastAPI', 'Spring Boot', 'Spring', 'Quarkus', 'Micronaut', 'Jakarta EE', '.NET', 'ASP.NET Core',
      'Entity Framework', 'Laravel', 'Symfony', 'Ruby on Rails', 'Phoenix', 'Gin', 'Fiber', 'Echo', 'Actix', 'Axum',
      'Ktor', 'gRPC', 'REST', 'WebSockets', 'Microsserviços', 'Serverless', 'OAuth', 'JWT', 'Prisma', 'Sequelize',
      'TypeORM', 'Hibernate', 'SQLAlchemy', 'Mongoose', 'tRPC', 'RabbitMQ', 'Celery', 'Swagger/OpenAPI',
    ],
  },
  {
    id: 'mobile',
    label: 'Mobile e desktop',
    tags: [
      'React Native', 'Expo', 'Flutter', 'Android', 'iOS', 'SwiftUI', 'Jetpack Compose', 'Xamarin', '.NET MAUI',
      'Ionic', 'Capacitor', 'Cordova', 'Electron', 'Tauri', 'Qt', 'GTK', 'WPF', 'WinForms', 'Kotlin Multiplatform',
    ],
  },
  {
    id: 'data',
    label: 'Dados e bancos de dados',
    tags: [
      'PostgreSQL', 'MySQL', 'MariaDB', 'SQLite', 'SQL Server', 'Oracle Database', 'MongoDB', 'Redis', 'Cassandra',
      'DynamoDB', 'Firestore', 'Neo4j', 'Elasticsearch', 'OpenSearch', 'ClickHouse', 'Snowflake', 'BigQuery', 'Redshift',
      'Databricks', 'Apache Spark', 'Hadoop', 'Hive', 'Kafka', 'Airflow', 'dbt', 'Flink', 'Apache Beam', 'Delta Lake',
      'DuckDB', 'Supabase', 'Firebase', 'PostGIS', 'pgvector', 'Pinecone', 'Weaviate', 'ChromaDB', 'ETL',
      'Data Warehouse', 'Data Lake', 'Modelagem de dados',
    ],
  },
  {
    id: 'ai',
    label: 'Ciência de dados e IA',
    tags: [
      'Pandas', 'NumPy', 'SciPy', 'Polars', 'Matplotlib', 'Seaborn', 'Plotly', 'scikit-learn', 'XGBoost', 'LightGBM',
      'CatBoost', 'TensorFlow', 'PyTorch', 'Keras', 'JAX', 'Hugging Face', 'Transformers', 'spaCy', 'NLTK', 'OpenCV',
      'YOLO', 'LangChain', 'LlamaIndex', 'OpenAI API', 'Claude API', 'Ollama', 'MLflow', 'Weights & Biases', 'ONNX',
      'Streamlit', 'Gradio', 'Jupyter', 'Google Colab', 'Kaggle', 'GeoPandas', 'Shapely', 'Statsmodels', 'Prophet',
      'Fine-tuning', 'Prompt engineering', 'Engenharia de features', 'MLOps', 'Séries temporais',
      'Sistemas de recomendação', 'Aprendizado por reforço', 'Redes neurais', 'Agentes de IA',
    ],
  },
  {
    id: 'cloud',
    label: 'Nuvem, DevOps e infraestrutura',
    tags: [
      'AWS', 'Google Cloud', 'Azure', 'Oracle Cloud', 'DigitalOcean', 'Heroku', 'Vercel', 'Netlify', 'Cloudflare',
      'Render', 'Fly.io', 'Docker', 'Docker Compose', 'Kubernetes', 'Helm', 'Terraform', 'Pulumi', 'Ansible', 'Chef',
      'Puppet', 'Vagrant', 'Nginx', 'Apache HTTP Server', 'Linux', 'Ubuntu', 'Debian', 'Windows Server', 'CI/CD',
      'GitHub Actions', 'GitLab CI', 'Jenkins', 'CircleCI', 'Argo CD', 'Prometheus', 'Grafana', 'Datadog', 'Sentry',
      'New Relic', 'ELK Stack', 'Observabilidade', 'Infraestrutura como código', 'AWS Lambda', 'Amazon S3', 'Amazon EC2',
    ],
  },
  {
    id: 'testing',
    label: 'Testes e qualidade',
    tags: [
      'Testes unitários', 'Testes de integração', 'Testes end-to-end', 'Testes de carga', 'Testes de usabilidade',
      'TDD', 'BDD', 'Jest', 'Vitest', 'Mocha', 'Cypress', 'Playwright', 'Selenium', 'Appium', 'Puppeteer',
      'Testing Library', 'JUnit', 'TestNG', 'Mockito', 'pytest', 'unittest', 'RSpec', 'Cucumber', 'Postman', 'Insomnia',
      'JMeter', 'k6', 'Locust', 'SonarQube', 'Code review', 'Testes manuais',
    ],
  },
  {
    id: 'security',
    label: 'Segurança',
    tags: [
      'Segurança da informação', 'Cibersegurança', 'Pentest', 'OWASP', 'Criptografia', 'Análise de malware',
      'Forense digital', 'SOC', 'SIEM', 'Wireshark', 'Burp Suite', 'Metasploit', 'Nmap', 'Kali Linux', 'Hardening',
      'IAM', 'LGPD', 'ISO 27001', 'CTF', 'Bug bounty', 'DevSecOps', 'Engenharia reversa',
    ],
  },
  {
    id: 'worktools',
    label: 'Ferramentas de trabalho',
    tags: [
      'Git', 'GitHub', 'GitLab', 'Bitbucket', 'VS Code', 'IntelliJ IDEA', 'PyCharm', 'Vim', 'Neovim', 'Jira',
      'Confluence', 'Trello', 'Notion', 'Asana', 'ClickUp', 'Slack', 'Miro', 'Figma', 'FigJam', 'Adobe XD', 'Sketch',
      'Canva', 'Photoshop', 'Illustrator', 'Premiere Pro', 'After Effects', 'DaVinci Resolve', 'Excel', 'Google Sheets',
      'Power BI', 'Tableau', 'Looker Studio', 'Metabase', 'Power Automate', 'Zapier', 'n8n', 'Google Analytics',
      'Overleaf', 'Zotero', 'Mendeley', 'Microsoft Office', 'Google Workspace', 'MS Project',
    ],
  },
  {
    id: 'hardware',
    label: 'Engenharia, hardware e jogos',
    tags: [
      'Arduino', 'Raspberry Pi', 'ESP32', 'STM32', 'FPGA', 'Eletrônica', 'Microcontroladores', 'RTOS', 'ROS',
      'PLC', 'Automação industrial', 'Impressão 3D', 'SolidWorks', 'Fusion 360', 'CATIA', 'Inventor',
      'ANSYS', 'Simulink', 'LabVIEW', 'KiCad', 'Proteus', 'Unity', 'Unreal Engine', 'Godot', 'Blender',
      'Maya', 'Game design', 'Realidade virtual', 'Realidade aumentada', 'Pixel art', 'Modelagem 3D',
    ],
  },
  {
    id: 'roles',
    label: 'Funções em tecnologia',
    tags: [
      'Full-stack', 'Front-end', 'Back-end', 'Mobile', 'DevOps', 'SRE', 'Platform engineering', 'Cloud engineering',
      'QA Tester', 'QA Analyst', 'Automação de testes', 'Engenharia de dados', 'Cientista de dados', 'Analista de dados',
      'Analista de BI', 'Engenharia de machine learning', 'Engenharia de IA', 'Pesquisador(a) de IA', 'UX/UI Design',
      'UX Research', 'UX Writing', 'Product Design', 'Gestão de produto', 'Product Owner', 'Scrum Master',
      'Agile Coach', 'Analista de sistemas', 'Analista de requisitos', 'Arquitetura de software',
      'Arquitetura de soluções', 'Tech Lead', 'Desenvolvimento de jogos', 'Analista de segurança',
      'Administração de redes', 'Administração de banco de dados', 'Suporte técnico', 'Desenvolvedor(a) blockchain',
      'Engenharia de sistemas embarcados', 'Developer Relations', 'Redação técnica',
    ],
  },
  {
    id: 'practices',
    label: 'Práticas e metodologias',
    tags: [
      'Scrum', 'Kanban', 'Metodologias ágeis', 'Design Thinking', 'Lean', 'OKRs', 'Clean Code', 'Clean Architecture',
      'Domain-Driven Design', 'SOLID', 'Design Patterns', 'Programação orientada a objetos', 'Programação funcional',
      'Estruturas de dados', 'Algoritmos', 'Programação competitiva', 'Arquitetura orientada a eventos', 'Monorepo',
      'Documentação técnica', 'Acessibilidade', 'Internacionalização', 'Performance web', 'Open source',
      'Gestão de projetos',
    ],
  },
  {
    id: 'areas',
    label: 'Áreas e temas',
    tags: [
      'Inteligência Artificial', 'Machine Learning', 'Deep Learning', 'IA Generativa', 'LLMs', 'RAG', 'NLP',
      'Visão Computacional', 'Processamento de imagens', 'Processamento de sinais', 'Robótica', 'IoT', 'Blockchain',
      'Web3', 'Computação em nuvem', 'Computação quântica', 'Computação gráfica', 'Computação distribuída',
      'Sistemas operacionais', 'Compiladores', 'Redes de computadores', 'Teoria da computação', 'Otimização',
      'Pesquisa operacional', 'Bioinformática', 'Biologia computacional', 'Geoprocessamento', 'Sensoriamento remoto',
      'Dados e Análise', 'Visualização de dados', 'Big Data', 'Estatística', 'Matemática aplicada',
      'Física computacional', 'Química computacional', 'Finanças quantitativas', 'Fintech', 'Healthtech',
      'Edtech', 'Agritech', 'Legaltech', 'Saúde digital', 'Educação', 'Sustentabilidade', 'Cidades inteligentes',
      'Energia renovável', 'Mobilidade urbana', 'Jogos sérios', 'Interação humano-computador', 'Ética em IA',
      'Empreendedorismo', 'Startups', 'Inovação', 'Pesquisa Acadêmica', 'Iniciação Científica',
      'Extensão universitária', 'Engenharia de Software', 'Sistemas de informação', 'E-commerce',
      'Monitoria acadêmica', 'Estágio', 'Trainee', 'Freelancer', 'Trabalho voluntário',
    ],
  },
  {
    id: 'soft',
    label: 'Competências pessoais',
    tags: [
      'Comunicação', 'Trabalho em equipe', 'Liderança', 'Resolução de problemas', 'Pensamento crítico', 'Criatividade',
      'Organização', 'Gestão do tempo', 'Oratória', 'Apresentações', 'Escrita acadêmica', 'Negociação', 'Mentoria',
      'Autonomia', 'Adaptabilidade', 'Visão espacial', 'Senso estético', 'Atenção a detalhes', 'Inglês', 'Espanhol',
      'Francês', 'Alemão', 'Italiano', 'Libras',
    ],
  },

  /* Architecture, urbanism and the built environment */
  {
    id: 'archDesign',
    label: 'Arquitetura: projeto',
    tags: [
      'Projeto arquitetônico', 'Estudo preliminar', 'Anteprojeto', 'Projeto executivo', 'Projeto legal',
      'Arquitetura de interiores', 'Arquitetura residencial', 'Arquitetura comercial', 'Arquitetura institucional',
      'Arquitetura hospitalar', 'Arquitetura escolar', 'Retrofit', 'Restauro', 'Patrimônio histórico',
      'Arquitetura efêmera', 'Arquitetura bioclimática', 'Arquitetura sustentável', 'Arquitetura vernacular',
      'Conforto ambiental', 'Conforto térmico', 'Iluminação natural', 'Luminotécnica', 'Acústica arquitetônica',
      'Paisagismo', 'Desenho universal', 'Teoria da arquitetura', 'História da arquitetura', 'Tecnologia da construção',
      'Sistemas construtivos', 'Construção em madeira', 'Construção com terra', 'Steel frame', 'Wood frame',
      'Mobiliário', 'Design de interiores', 'Concurso de arquitetura', 'Ateliê de projeto',
    ],
  },
  {
    id: 'archTools',
    label: 'Arquitetura: ferramentas',
    tags: [
      'AutoCAD', 'Revit', 'SketchUp', 'ArchiCAD', 'Rhino', 'Grasshopper', 'Lumion', 'Enscape', 'V-Ray', 'Twinmotion',
      'D5 Render', 'Corona Renderer', '3ds Max', 'Vectorworks', 'Promob', 'InDesign', 'Navisworks', 'Dynamo',
      'BIM', 'QGIS', 'ArcGIS', 'Google Earth Pro', 'Climate Studio', 'Ladybug', 'DIALux', 'Ecotect',
    ],
  },
  {
    id: 'urban',
    label: 'Urbanismo e planejamento',
    tags: [
      'Urbanismo', 'Planejamento urbano', 'Planejamento regional', 'Desenho urbano', 'Habitação social',
      'Regularização fundiária', 'Plano diretor', 'Urbanismo tático', 'Mobilidade ativa', 'Espaço público',
      'Infraestrutura verde', 'Estudo de impacto de vizinhança', 'Legislação urbanística', 'Cartografia',
      'Topografia', 'Paisagem urbana', 'Requalificação urbana', 'Participação comunitária',
    ],
  },
  {
    id: 'representation',
    label: 'Representação e expressão',
    tags: [
      'Desenho técnico', 'Desenho à mão livre', 'Croqui', 'Perspectiva', 'Geometria descritiva', 'Maquete física',
      'Maquete eletrônica', 'Renderização', 'Pós-produção de imagens', 'Diagramação de pranchas', 'Diagramas',
      'Fotografia de arquitetura', 'Portfólio de arquitetura', 'Modelagem paramétrica', 'Design computacional',
      'Fabricação digital', 'Corte a laser', 'Aquarela', 'Colagem digital',
    ],
  },
  {
    id: 'civil',
    label: 'Engenharia civil e construção',
    tags: [
      'Estruturas', 'Concreto armado', 'Concreto protendido', 'Estruturas metálicas', 'Estruturas de madeira',
      'Fundações', 'Geotecnia', 'Mecânica dos solos', 'Hidráulica', 'Hidrologia', 'Saneamento', 'Drenagem urbana',
      'Instalações prediais', 'Orçamento de obras', 'Gestão de obras', 'Planejamento de obras', 'Fiscalização de obras',
      'Compatibilização de projetos', 'Patologia das construções', 'Materiais de construção', 'Estradas e pavimentação',
      'Transportes', 'Eficiência energética', 'Certificação LEED', 'Normas ABNT', 'Segurança do trabalho',
      'Eberick', 'TQS', 'SAP2000', 'Ftool', 'Civil 3D', 'Primavera P6',
    ],
  },
  {
    id: 'builtRoles',
    label: 'Funções em arquitetura, design e engenharia',
    tags: [
      'Arquiteto(a)', 'Urbanista', 'Paisagista', 'Designer de interiores', 'Projetista', 'Desenhista técnico',
      'Modelador(a) BIM', 'Coordenador(a) BIM', 'Visualização arquitetônica', 'Orçamentista', 'Engenheiro(a) de obras',
      'Engenheiro(a) estrutural', 'Designer gráfico', 'Designer de produto', 'Ilustrador(a)', 'Fotógrafo(a)',
      'Diretor(a) de arte', 'Editor(a) de vídeo', 'Produtor(a) de conteúdo',
    ],
  },

  /* Design, communication and arts */
  {
    id: 'design',
    label: 'Design',
    tags: [
      'Design gráfico', 'Design de produto', 'Design editorial', 'Identidade visual', 'Branding', 'Tipografia',
      'Ilustração', 'Design de embalagem', 'Design de moda', 'Design de serviços', 'Design de superfície',
      'Design de informação', 'Design de interação', 'Motion design', 'Design de jogos', 'Ergonomia', 'Usabilidade',
      'Teoria das cores', 'Composição visual', 'Modelagem de moda', 'Estamparia', 'Procreate', 'CLO 3D', 'Keyshot',
      'Affinity Designer', 'CorelDRAW', 'Framer', 'Webflow',
    ],
  },
  {
    id: 'comms',
    label: 'Comunicação e audiovisual',
    tags: [
      'Fotografia', 'Direção de arte', 'Edição de vídeo', 'Roteiro', 'Produção audiovisual', 'Direção de fotografia',
      'Animação 2D', 'Animação 3D', 'Jornalismo', 'Jornalismo de dados', 'Reportagem', 'Social media', 'Copywriting',
      'Redação publicitária', 'Assessoria de imprensa', 'Relações públicas', 'Podcast', 'Rádio', 'Storytelling',
      'Marketing digital', 'Growth', 'Gestão de marca', 'Planejamento de comunicação', 'Lightroom', 'Final Cut Pro',
      'Cinema 4D', 'Audition', 'CapCut',
    ],
  },
  {
    id: 'arts',
    label: 'Artes e música',
    tags: [
      'Artes visuais', 'Escultura', 'Pintura', 'Gravura', 'Arte digital', 'Cenografia', 'Figurino', 'Curadoria',
      'Mediação cultural', 'Produção cultural', 'História da arte', 'Teatro', 'Dança', 'Performance',
      'Produção musical', 'Composição musical', 'Arranjo', 'Mixagem', 'Sound design', 'Ableton Live', 'FL Studio',
      'Logic Pro', 'Pro Tools', 'Finale', 'MuseScore',
    ],
  },

  /* Other engineering, sciences and business */
  {
    id: 'engineering',
    label: 'Outras engenharias',
    tags: [
      'Engenharia de produção', 'Lean manufacturing', 'Six Sigma', 'Logística', 'Cadeia de suprimentos',
      'Gestão da qualidade', 'Engenharia elétrica', 'Sistemas de potência', 'Engenharia mecânica', 'Termodinâmica',
      'Mecânica dos fluidos', 'Engenharia química', 'Processos químicos', 'Engenharia ambiental',
      'Gestão ambiental', 'Engenharia biomédica', 'Engenharia de materiais', 'Engenharia de controle e automação',
      'Engenharia aeroespacial', 'Engenharia naval', 'Engenharia de petróleo', 'Mecatrônica', 'Elementos finitos',
      'CFD', 'Manutenção industrial', 'Minitab',
    ],
  },
  {
    id: 'science',
    label: 'Ciências e pesquisa',
    tags: [
      'Biologia molecular', 'Microbiologia', 'Genética', 'Ecologia', 'Botânica', 'Zoologia', 'Química analítica',
      'Química orgânica', 'Física experimental', 'Astronomia', 'Epidemiologia', 'Saúde pública', 'Farmacologia',
      'Nutrição', 'Neurociência', 'Psicologia', 'Ciências sociais', 'Antropologia', 'História', 'Geografia',
      'Filosofia', 'Linguística', 'Pesquisa qualitativa', 'Pesquisa quantitativa', 'Revisão sistemática',
      'Metodologia científica', 'Trabalho de campo', 'Laboratório', 'Publicação científica', 'SPSS', 'NVivo',
      'GraphPad Prism', 'ImageJ', 'Origin',
    ],
  },
  {
    id: 'business',
    label: 'Negócios, direito e gestão',
    tags: [
      'Administração', 'Economia', 'Finanças', 'Contabilidade', 'Controladoria', 'Análise financeira',
      'Planejamento estratégico', 'Gestão de pessoas', 'Recursos humanos', 'Vendas', 'Atendimento ao cliente',
      'Pesquisa de mercado', 'Plano de negócios', 'Consultoria', 'Direito digital', 'Direito civil',
      'Direito empresarial', 'Direito ambiental', 'Compliance', 'Relações internacionais', 'Políticas públicas',
      'Gestão pública', 'Terceiro setor', 'SAP', 'Salesforce', 'HubSpot',
    ],
  },
];

export const TAG_CATALOG: string[] = TAG_GROUPS.flatMap((group) => group.tags);

/* ------------------------------------------------------------------ */
/* Course profiles                                                    */
/* ------------------------------------------------------------------ */

export type CourseProfile = {
  id: string;
  /** How the course is named in "Comuns em …". */
  label: string;
  /** Normalised words or phrases matched as whole words against the student's course. */
  keywords: string[];
  /** Groups whose tags rank first when searching. */
  groups: TagGroupId[];
  /** Shown as chips and as the first suggestions, in this order. */
  suggestions: string[];
};

/** Checked in order; the first match wins (so "Engenharia Civil" is caught before the general engineering profile). */
export const COURSE_PROFILES: CourseProfile[] = [
  {
    id: 'architecture',
    label: 'Arquitetura e Urbanismo',
    keywords: ['arquitetura', 'urbanismo', 'arq', 'au'],
    groups: ['archDesign', 'archTools', 'urban', 'representation', 'builtRoles', 'design'],
    suggestions: [
      'AutoCAD', 'Revit', 'SketchUp', 'Projeto arquitetônico', 'Maquete física', 'Renderização', 'BIM', 'Rhino',
      'Croqui', 'Paisagismo', 'Urbanismo', 'Lumion',
    ],
  },
  {
    id: 'computing',
    label: 'Computação e tecnologia',
    keywords: [
      'computacao', 'software', 'informatica', 'sistemas de informacao', 'ciencia de dados', 'dados',
      'inteligencia artificial', 'analise e desenvolvimento de sistemas', 'ads', 'redes de computadores',
      'seguranca da informacao', 'jogos digitais', 'tecnologia da informacao', 'ti', 'cibersecuranca',
      'sistemas para internet', 'banco de dados',
    ],
    groups: ['languages', 'query', 'frontend', 'backend', 'mobile', 'data', 'ai', 'cloud', 'testing', 'security', 'roles', 'practices'],
    suggestions: [
      'Python', 'JavaScript', 'TypeScript', 'Git', 'SQL', 'React', 'Node.js', 'Full-stack', 'Machine Learning',
      'Docker', 'QA Tester', 'Java',
    ],
  },
  {
    id: 'civil',
    label: 'Engenharia Civil',
    keywords: ['engenharia civil', 'civil', 'edificacoes', 'construcao civil'],
    groups: ['civil', 'archTools', 'representation', 'builtRoles', 'engineering'],
    suggestions: [
      'AutoCAD', 'Revit', 'BIM', 'Estruturas', 'Concreto armado', 'Orçamento de obras', 'Gestão de obras', 'MS Project',
      'Eberick', 'Geotecnia', 'Excel', 'Civil 3D',
    ],
  },
  {
    id: 'engineering',
    label: 'Engenharia',
    keywords: [
      'engenharia', 'mecanica', 'eletrica', 'eletronica', 'producao', 'mecatronica', 'automacao', 'controle',
      'biomedica', 'materiais', 'aeroespacial', 'naval', 'petroleo', 'quimica industrial',
    ],
    groups: ['engineering', 'hardware', 'civil', 'languages', 'ai', 'practices'],
    suggestions: [
      'MATLAB', 'Python', 'AutoCAD', 'SolidWorks', 'Excel', 'Arduino', 'Lean manufacturing', 'Six Sigma',
      'Simulink', 'ANSYS', 'Gestão de projetos', 'Elementos finitos',
    ],
  },
  {
    id: 'design',
    label: 'Design',
    keywords: ['design', 'desenho industrial', 'moda', 'interiores', 'produto', 'grafico'],
    groups: ['design', 'representation', 'comms', 'arts', 'builtRoles'],
    suggestions: [
      'Figma', 'Identidade visual', 'Branding', 'Tipografia', 'Illustrator', 'Photoshop', 'InDesign', 'Ilustração',
      'UX/UI Design', 'Design editorial', 'Design de produto', 'Motion design',
    ],
  },
  {
    id: 'communication',
    label: 'Comunicação',
    keywords: [
      'comunicacao', 'publicidade', 'propaganda', 'jornalismo', 'cinema', 'audiovisual', 'radio', 'tv',
      'marketing', 'relacoes publicas', 'midia', 'midias digitais', 'producao editorial',
    ],
    groups: ['comms', 'design', 'arts', 'business'],
    suggestions: [
      'Fotografia', 'Edição de vídeo', 'Copywriting', 'Social media', 'Roteiro', 'Premiere Pro', 'Canva',
      'Direção de arte', 'Storytelling', 'Marketing digital', 'Jornalismo', 'Podcast',
    ],
  },
  {
    id: 'arts',
    label: 'Artes',
    keywords: ['artes', 'arte', 'musica', 'teatro', 'danca', 'belas artes', 'artes visuais', 'artes cenicas', 'producao cultural'],
    groups: ['arts', 'comms', 'design'],
    suggestions: [
      'Artes visuais', 'Ilustração', 'Arte digital', 'Produção musical', 'Curadoria', 'Fotografia', 'Cenografia',
      'Procreate', 'Ableton Live', 'Produção cultural', 'História da arte', 'Pintura',
    ],
  },
  {
    id: 'science',
    label: 'Ciências',
    keywords: [
      'biologia', 'ciencias biologicas', 'biomedicina', 'biotecnologia', 'quimica', 'fisica', 'matematica',
      'estatistica', 'medicina', 'enfermagem', 'farmacia', 'nutricao', 'odontologia', 'fisioterapia',
      'veterinaria', 'saude', 'geologia', 'oceanografia', 'agronomia', 'ciencias ambientais',
    ],
    groups: ['science', 'ai', 'data', 'languages'],
    suggestions: [
      'Pesquisa Acadêmica', 'Iniciação Científica', 'Metodologia científica', 'Estatística', 'R', 'Python',
      'Laboratório', 'Publicação científica', 'Excel', 'Revisão sistemática', 'GraphPad Prism', 'Escrita acadêmica',
    ],
  },
  {
    id: 'humanities',
    label: 'Humanas',
    keywords: [
      'psicologia', 'ciencias sociais', 'sociologia', 'antropologia', 'historia', 'geografia', 'filosofia', 'letras',
      'pedagogia', 'licenciatura', 'servico social', 'museologia', 'biblioteconomia',
    ],
    groups: ['science', 'soft', 'comms'],
    suggestions: [
      'Pesquisa qualitativa', 'Pesquisa quantitativa', 'Escrita acadêmica', 'Metodologia científica',
      'Iniciação Científica', 'Educação', 'Oratória', 'Trabalho de campo', 'NVivo', 'Inglês', 'Extensão universitária',
      'Monitoria acadêmica',
    ],
  },
  {
    id: 'business',
    label: 'Negócios e direito',
    keywords: [
      'administracao', 'economia', 'ciencias economicas', 'contabeis', 'ciencias contabeis', 'direito', 'gestao',
      'relacoes internacionais', 'comercio exterior', 'financas', 'recursos humanos', 'logistica', 'turismo',
    ],
    groups: ['business', 'practices', 'worktools', 'data'],
    suggestions: [
      'Excel', 'Power BI', 'Gestão de projetos', 'Planejamento estratégico', 'Finanças', 'Análise financeira',
      'Empreendedorismo', 'Negociação', 'Pesquisa de mercado', 'Inglês', 'Oratória', 'Compliance',
    ],
  },
];

/** Used when the course is empty or matches no profile. */
export const SUGGESTED_TAGS = ['Python', 'JavaScript', 'React', 'Full-stack', 'Dados e Análise', 'Machine Learning', 'Git', 'QA Tester'];

export const MAX_TAGS = 12;
export const MAX_TAG_LENGTH = 32;

/** Lower-case and strip accents so "visao" finds "Visão Computacional". */
export const normalizeTag = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** Normalised words of a course name, padded with spaces so keywords match as whole words. */
const courseWords = (course: string) => ` ${normalizeTag(course).replace(/[^a-z0-9]+/g, ' ').trim()} `;

/** The profile for a free-text course name ("Arq. e Urbanismo" -> architecture), or null. */
export function courseProfileFor(course: string | null | undefined): CourseProfile | null {
  if (!course || !course.trim()) return null;
  const words = courseWords(course);
  return COURSE_PROFILES.find((profile) => profile.keywords.some((keyword) => words.includes(` ${keyword} `))) ?? null;
}

const groupTags = new Map(TAG_GROUPS.map((group) => [group.id, group.tags]));

/** Normalised tags that rank first for this profile. */
function courseTagSet(profile: CourseProfile | null): Set<string> {
  const set = new Set<string>();
  if (!profile) return set;
  for (const tag of profile.suggestions) set.add(normalizeTag(tag));
  for (const id of profile.groups) for (const tag of groupTags.get(id) ?? []) set.add(normalizeTag(tag));
  return set;
}

/** Suggestions for a course (or the general list), minus tags already picked. */
export function suggestedTagsFor(profile: CourseProfile | null, selected: string[] = []): string[] {
  const taken = new Set(selected.map(normalizeTag));
  return (profile?.suggestions ?? SUGGESTED_TAGS).filter((tag) => !taken.has(normalizeTag(tag)));
}

/**
 * Catalog tags matching `query`, minus the ones already picked. Ranking: the course's tags before the rest,
 * and within each, prefix or word-start matches before matches inside the name, in catalog order.
 * Nothing is hidden: tags outside the course still appear after the course's own.
 */
export function searchTags(
  query: string,
  selected: string[],
  limit = 8,
  profile: CourseProfile | null = null,
  catalog: string[] = TAG_CATALOG,
): string[] {
  const taken = new Set(selected.map(normalizeTag));
  const q = normalizeTag(query);
  if (!q) return suggestedTagsFor(profile, selected).slice(0, limit);

  const preferred = courseTagSet(profile);
  const featured = new Set(suggestedTagsFor(profile).map(normalizeTag));
  // Buckets: [suggested prefix, course prefix, course contains, other prefix, other contains].
  // The course's own suggestions (or the general ones) lead, so "re" shows React before ReScript.
  const buckets: string[][] = [[], [], [], [], []];
  for (const tag of catalog) {
    const name = normalizeTag(tag);
    if (taken.has(name)) continue;
    const startsWith = name.startsWith(q) || name.split(/[\s/.()-]+/).some((word) => word.startsWith(q));
    if (!startsWith && !name.includes(q)) continue;
    if (startsWith && featured.has(name)) buckets[0].push(tag);
    else if (preferred.has(name)) buckets[startsWith ? 1 : 2].push(tag);
    else buckets[startsWith ? 3 : 4].push(tag);
  }
  return buckets.flat().slice(0, limit);
}

/** The catalog spelling when the text matches a known tag exactly (ignoring case and accents). */
export function canonicalTag(text: string, catalog: string[] = TAG_CATALOG): string {
  const q = normalizeTag(text);
  return catalog.find((tag) => normalizeTag(tag) === q) ?? text.trim().replace(/\s+/g, ' ');
}
