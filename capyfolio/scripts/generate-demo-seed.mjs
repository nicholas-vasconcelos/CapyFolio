// Generates scripts/demo-seed.sql: extra sample people, projects, events and posts with photos,
// plus the read-only demo account. Every row is is_sample = true and has a deterministic uuid,
// so running the SQL again updates the same rows instead of duplicating them.
// Usage (inside capyfolio/): node scripts/generate-demo-seed.mjs
// Then run scripts/demo-seed.sql once against the Supabase project (SQL editor or MCP execute_sql).
//
// Photos: people use randomuser.me portraits, everything else Unsplash (free licence).
// Mock people and their work are fictional; the universities are only where they "study".
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

// Must match src/lib/demo.ts.
const DEMO_EMAIL = 'demo@capyfolio.test';
const DEMO_PASSWORD = 'capyfolio-demo';

const uuid = (key) => {
  const h = createHash('md5').update(`capyfolio:demo-seed:${key}`).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-${((parseInt(h[16], 16) & 0x3) | 0x8).toString(16)}${h.slice(17, 20)}-${h.slice(20, 32)}`;
};
const q = (value) => (value === null || value === undefined ? 'null' : `'${String(value).replace(/'/g, "''")}'`);
const arr = (values) => (values && values.length ? `array[${values.map(q).join(', ')}]::text[]` : `'{}'::text[]`);
const json = (value) => `${q(JSON.stringify(value ?? []))}::jsonb`;

/* ------------------------------------------------------------------ */
/* Photos                                                              */
/* ------------------------------------------------------------------ */

// Unsplash ids checked by hand (contact sheet), grouped by what they show.
const P = {
  laptopCode: '1517694712202-14dd9538aa97',
  codeScreen: '1555066931-4365d14bab8c',
  worldMap: '1526778548025-fa2f459cd5c1',
  robotBench: '1485827404703-89b55fcc595e',
  robotWhite: '1581091226825-a6a2a5aee158',
  studentsCafe: '1522202176988-66273c2fd55f',
  labPipette: '1532187863486-abf9dbad1b69',
  dashboard: '1551288049-bebda4e38f71',
  analytics: '1460925895917-afdab827c52f',
  circuit: '1518770660439-4636190af475',
  pairCoding: '1531482615713-2afd69097998',
  openOffice: '1504384308090-c894fdcc538d',
  deskTop: '1519389950473-47ba0277781c',
  teamLaptops: '1522071820081-009f0129c71c',
  graduation: '1523240795612-9a054b0db644',
  libraryChat: '1524178232363-1fb2b075b655',
  lectureRoom: '1427504494785-3a9ca7044f45',
  libraryAisle: '1541339907198-e08756dedf3f',
  campus: '1562774053-701939374585',
  libraryHall: '1498243691581-b145c3f54a5a',
  engineerLab: '1581091226825-a6a2a5aee158',
  drafting: '1581092160562-40aa08e78837',
  goggles: '1581093588401-fbb62a02f120',
  cells: '1576086213369-97a306d36557',
  heartModel: '1530026405186-ed1f139313f8',
  brainModel: '1559757148-5c350d0d3c56',
  stethoscope: '1576091160550-2173dba999ef',
  flasks: '1532094349884-543bc11b234d',
  plasma: '1507413245164-6160d8298b31',
  neuron: '1564325724739-bae0bd08762c',
  powerLines: '1473341304170-971dccb5ac1e',
  windSunset: '1466611653911-95081537e5b7',
  solarSky: '1509391366360-2e959784a276',
  solarAerial: '1497435334941-8c899ee9e8e9',
  seedling: '1542601906990-b4d3fb778b09',
  fieldSunrise: '1500382017468-9049fed747ef',
  vegetables: '1464226184884-fa280b87c399',
  soil: '1416879595882-3373a0480b5b',
  imacDesk: '1483058712412-4245e9b90334',
  codeDark: '1488590528505-98d2b5aba04b',
  codePython: '1515879218367-8466d910aaa4',
  pcbClose: '1550751827-4bd374c3f58b',
  serverRack: '1558494949-ef010cbdcc31',
  networkCables: '1544197150-b99a580bb7a8',
  laptopPhone: '1563986768609-322da13575f3',
  asimo: '1535378917042-10a22c95931a',
  rcCar: '1561144257-e32e8efc6c4f',
  toyRobot: '1527430253228-e93688616381',
  meetingTable: '1517048676732-d65bc937f952',
  audience: '1540575467063-178a50c2df87',
  stageTalk: '1505373877841-8d25f7d46678',
  microphone: '1475721027785-f74eccf877e2',
  conferenceHall: '1511578314322-379afb476865',
  gallery: '1515187029135-18ee286d815b',
  workshopTable: '1528605248644-14dd04022da1',
  standup: '1556761175-5973dc0f32e7',
  postIts: '1552664730-d307ca884978',
  studyGroup: '1543269865-cbf427effbad',
  pitchTalk: '1517245386807-bb43f82c33c4',
  coworking: '1556761175-b413da4baf72',
  groupLaptop: '1531545514256-b1400bc00f31',
  notes: '1529070538774-1843cb3265df',
  booksApple: '1503676260728-1c00da094a0b',
  writing: '1434030216411-0b793f4b4173',
  openBook: '1456513080510-7bf3a84b82f8',
  studentFocus: '1513258496099-48168024aec0',
  bookStack: '1497633762265-9d179a990aa6',
  libraryLamps: '1481627834876-b7833e8f5570',
  libraryShelves: '1507842217343-583bb7270b66',
  auditorium: '1519452635265-7b1fbfd1e4e0',
  codeColor: '1461749280684-dccba630e2f6',
  laptopPlant: '1587620962725-abab7fe55159',
  monitors: '1580894894513-541e068a3e2b',
  serverWoman: '1573164713988-8665fc963095',
  solder: '1581092918056-0c4c3acd3789',
  microscopes: '1518152006812-edab29b069ac',
  vr: '1593508512255-86ab42a8e620',
  laptopMinimal: '1496181133206-80ce9b88a853',
  phoneApps: '1512941937669-90a1b58e7e9c',
  makerspace: '1559136555-9303baea8ebd',
  skyscrapers: '1508385082359-f38ae991e8f2',
  bigAudience: '1544531586-fde5298cdd40',
  friends: '1491438590914-bc09fcaaf77a',
  meetup: '1559223607-a43c990c692c',
  hackathon: '1576267423445-b2e0074d68a4',
  pills: '1585435557343-3b092031a831',
  hospitalLab: '1579154204601-01588f351e67',
  xray: '1530497610245-94d3c16cda28',
  designScreen: '1559028012-481c04fa702d',
  mountains: '1506905925346-21bda4d32df4',
  valley: '1470071459604-3b5ec3a7fe05',
  forest: '1441974231531-c6227db76b6e',
  rio: '1483729558449-99ef09a8c325',
  rioCableCar: '1544989164-31dc3c645987',
  city: '1477959858617-67f85cf4f1df',
};
const photo = (key, w = 1200) => {
  if (!P[key]) throw new Error(`Unknown photo ${key}`);
  return `https://images.unsplash.com/photo-${P[key]}?w=${w}&auto=format&fit=crop&q=80`;
};
const portrait = (gender, n) => `https://randomuser.me/api/portraits/${gender}/${n}.jpg`;

/* ------------------------------------------------------------------ */
/* Existing sample rows (seed.sql), referenced by id                    */
/* ------------------------------------------------------------------ */

const OLD = {
  ic: 'c21bb9e1-f8a7-47cf-84f2-109835f3ee13',
  gabriel: 'b6f3063e-e60e-49f5-bd47-2e551099e279',
  mariana: '03f897a3-2f3d-4314-bd11-e19cfb387623',
  anaClara: '07ccd120-1caf-4c08-8f99-631ae11f170d',
  tiago: '5a885de2-e187-4ab4-8fba-cdcd355142b5',
  rafael: 'fa02873d-5b68-49f4-8a23-819e8ad37d10',
  beatriz: '23929862-501c-4488-8cb3-392a5f284efc',
  arthur: '4fc6858c-87d0-4400-8673-e183eb4405c3',
  projAir: '3e7c8fc8-171b-4514-9686-83a230a95a1b',
  projRag: '442306d0-c2fb-437b-88f9-c19f54854605',
  projVision: 'b8d640a9-2ac8-463d-b71b-524c4030527e',
  projSabia: '0e0fb633-def2-4e05-ad05-b8ce24c74a6b',
  projBiodock: '6082a412-5e2c-4152-aea8-2a8b5c3046ab',
  projLlm: '90fba419-43f3-4f5a-9063-b354a0f79001',
  eventRag: '8412e4bb-41c9-472e-a264-5f7aec515870',
  eventSymposium: 'be1d9c2d-dfbf-4303-934b-ed0863e6a5cb',
  postAir: '3f58de1b-4417-48ff-9f34-af70682215a8',
  postRag: '7e18a74d-ee89-44c6-9dc0-6822ecbc8e1e',
  postVision: '341f8c82-34ee-4a1c-af1a-3250d494f184',
};

// Extra photos for the existing sample projects (the cover stays first).
const OLD_PROJECT_IMAGES = {
  [OLD.projAir]: ['worldMap', 'rio', 'dashboard'],
  [OLD.projRag]: ['codeDark', 'libraryShelves', 'monitors'],
  [OLD.projVision]: ['robotBench', 'rcCar', 'engineerLab'],
  [OLD.projSabia]: ['studentsCafe', 'writing', 'openBook'],
  [OLD.projBiodock]: ['labPipette', 'cells', 'microscopes'],
  [OLD.projLlm]: ['codeScreen', 'teamLaptops', 'analytics'],
};
const OLD_POST_IMAGES = {
  [OLD.postAir]: ['worldMap', 'rio'],
  [OLD.postRag]: ['stageTalk'],
  [OLD.postVision]: ['robotBench', 'rcCar', 'engineerLab'],
};
const OLD_EVENT_COVERS = {
  [OLD.eventRag]: { cover: 'microphone', starts: '2026-11-26 14:00', ends: '2026-11-26 18:00' },
  [OLD.eventSymposium]: { cover: 'conferenceHall', starts: '2026-12-09 09:00', ends: '2026-12-10 18:00' },
};
// Different hero colours, so profiles look personal.
const OLD_HERO_COLORS = {
  [OLD.gabriel]: 'green',
  [OLD.mariana]: 'gold-tint',
  [OLD.anaClara]: 'ink',
  [OLD.tiago]: 'gold',
  [OLD.rafael]: 'green-tint',
  [OLD.beatriz]: 'navy',
};

/* ------------------------------------------------------------------ */
/* People                                                              */
/* ------------------------------------------------------------------ */

const UNI = {
  UFF: 'Universidade Federal Fluminense (UFF)',
  UFRJ: 'Universidade Federal do Rio de Janeiro (UFRJ)',
  USP: 'Universidade de São Paulo (USP)',
  'PUC-Rio': 'Pontifícia Universidade Católica do Rio de Janeiro (PUC-Rio)',
  Ibmec: 'Ibmec Rio',
  UNICAMP: 'Universidade Estadual de Campinas (UNICAMP)',
  UFMG: 'Universidade Federal de Minas Gerais (UFMG)',
  UnB: 'Universidade de Brasília (UnB)',
  UFPE: 'Universidade Federal de Pernambuco (UFPE)',
  UFRGS: 'Universidade Federal do Rio Grande do Sul (UFRGS)',
  UFSC: 'Universidade Federal de Santa Catarina (UFSC)',
  UERJ: 'Universidade do Estado do Rio de Janeiro (UERJ)',
  'CEFET/RJ': 'Centro Federal de Educação Tecnológica (CEFET/RJ)',
};

/** key, name, portrait, uni, course, period, location, focus, tags, bio, hero, connections, level */
const PEOPLE = [
  ['demo', 'Júlia Andrade', ['women', 44], 'UFF', 'Ciência da Computação', '6º Período', 'Niterói, RJ', 'Visão Computacional & Design de Produto',
    ['Python', 'PyTorch', 'Figma', 'Visão Computacional', 'UX Research', 'React'],
    'Estudante de Ciência da Computação apaixonada por interfaces que entendem o mundo. Pesquiso visão computacional aplicada à acessibilidade urbana e participo da liga de design de produto da UFF.',
    'navy', 212, 'bachelor'],
  ['lucas', 'Lucas Ferreira', ['men', 32], 'UFRJ', 'Engenharia Elétrica', '8º Período', 'Rio de Janeiro, RJ', 'Energia Solar & Sistemas Embarcados',
    ['C', 'Arduino', 'Energia Solar', 'Sistemas Embarcados', 'MATLAB'],
    'Trabalho com microrredes solares para comunidades isoladas e gosto de transformar protótipos de bancada em soluções de campo.', 'gold', 143, 'bachelor'],
  ['camila', 'Camila Rocha', ['women', 68], 'USP', 'Ciências Biológicas', 'Mestrado', 'São Paulo, SP', 'Bioinformática & Genômica',
    ['R', 'Python', 'Genômica', 'Bioinformática', 'Estatística'],
    'Mestranda em bioinformática estudando a diversidade genética de abelhas nativas brasileiras e o impacto do desmatamento nas colônias.', 'green', 98, 'masters'],
  ['pedro', 'Pedro Henrique Lima', ['men', 46], 'UNICAMP', 'Engenharia de Computação', '7º Período', 'Campinas, SP', 'Robótica & Controle',
    ['ROS', 'C++', 'Robótica', 'Controle', 'Python'],
    'Capitão da equipe de robótica autônoma. Pesquiso navegação de robôs móveis em ambientes agrícolas.', 'ink', 176, 'bachelor'],
  ['larissa', 'Larissa Moura', ['women', 17], 'UFMG', 'Arquitetura e Urbanismo', '9º Período', 'Belo Horizonte, MG', 'Urbanismo & Dados Abertos',
    ['QGIS', 'Urbanismo', 'Dados Abertos', 'Rhino', 'Mobilidade'],
    'Estudo como dados abertos podem orientar o desenho de calçadas e praças mais seguras para mulheres.', 'green-tint', 121, 'bachelor'],
  ['rodrigo', 'Rodrigo Nascimento', ['men', 75], 'UnB', 'Ciência Política', 'Doutorado', 'Brasília, DF', 'Ciência de Dados & Políticas Públicas',
    ['Python', 'NLP', 'Políticas Públicas', 'SQL', 'Estatística'],
    'Doutorando aplicando processamento de linguagem natural a propostas legislativas. Ex-analista de dados em gestão pública.', 'navy', 264, 'doctorate'],
  ['fernanda', 'Fernanda Ribeiro', ['women', 31], 'UFPE', 'Design', '5º Período', 'Recife, PE', 'UX & Tecnologia Assistiva',
    ['Figma', 'UX Research', 'Acessibilidade', 'Prototipagem', 'Design'],
    'Designer em formação, focada em produtos digitais para pessoas com deficiência visual. Voluntária no laboratório de tecnologia assistiva.', 'gold-tint', 158, 'bachelor'],
  ['gustavo', 'Gustavo Almeida', ['men', 11], 'UFRGS', 'Ciência da Computação', '8º Período', 'Porto Alegre, RS', 'Segurança da Informação',
    ['Segurança', 'Linux', 'Redes', 'Go', 'Criptografia'],
    'Pesquisador em segurança de redes. Organizo o CTF universitário do sul e estudo detecção de intrusão com aprendizado de máquina.', 'ink', 189, 'bachelor'],
  ['isabela', 'Isabela Carvalho', ['women', 52], 'UFSC', 'Engenharia Mecânica', '6º Período', 'Florianópolis, SC', 'Manufatura Aditiva',
    ['SolidWorks', 'Impressão 3D', 'Materiais', 'Ansys', 'Engenharia Mecânica'],
    'Integrante da equipe Baja e pesquisadora de compósitos impressos em 3D com fibras naturais.', 'gold', 87, 'bachelor'],
  ['thiago', 'Thiago Barbosa', ['men', 59], 'CEFET/RJ', 'Sistemas de Informação', '4º Período', 'Rio de Janeiro, RJ', 'Desenvolvimento Mobile',
    ['Flutter', 'Kotlin', 'Firebase', 'Mobile', 'UX'],
    'Desenvolvedor mobile construindo apps para pequenos comércios da zona norte do Rio. Monitor de programação.', 'green', 134, 'technologist'],
  ['amanda', 'Amanda Costa', ['women', 79], 'UERJ', 'Medicina', '10º Período', 'Rio de Janeiro, RJ', 'Saúde Digital',
    ['Saúde Pública', 'Epidemiologia', 'R', 'Saúde Digital'],
    'Estudante de medicina interessada em triagem assistida por dados na atenção primária.', 'green-tint', 102, 'bachelor'],
  ['bruno', 'Bruno Teixeira', ['men', 36], 'PUC-Rio', 'Engenharia Civil', '9º Período', 'Rio de Janeiro, RJ', 'Estruturas & Sustentabilidade',
    ['Engenharia Civil', 'BIM', 'Revit', 'Sustentabilidade', 'Concreto'],
    'Pesquiso concretos com resíduos de construção e modelagem BIM para obras de habitação social.', 'navy', 95, 'bachelor'],
  ['leticia', 'Letícia Gomes', ['women', 22], 'Ibmec', 'Administração', '6º Período', 'Rio de Janeiro, RJ', 'Inovação & Empreendedorismo',
    ['Empreendedorismo', 'Growth', 'Excel', 'Pesquisa de Mercado'],
    'Cofundadora de uma startup de impacto em educação financeira. Coordeno a empresa júnior de consultoria.', 'gold', 241, 'bachelor'],
  ['vinicius', 'Vinícius Martins', ['men', 81], 'UFF', 'Física', 'Mestrado', 'Niterói, RJ', 'Física Computacional',
    ['Python', 'Julia', 'Física', 'Simulação', 'HPC'],
    'Mestrando em física computacional simulando plasmas de baixa temperatura. Entusiasta de computação de alto desempenho.', 'ink', 76, 'masters'],
  ['natalia', 'Natália Souza', ['women', 63], 'UFRJ', 'Engenharia Ambiental', '7º Período', 'Rio de Janeiro, RJ', 'Recursos Hídricos & Sensoriamento Remoto',
    ['Sensoriamento Remoto', 'Google Earth Engine', 'Python', 'Hidrologia'],
    'Monitoro a qualidade da água da Baía de Guanabara com imagens de satélite e sensores de baixo custo.', 'green', 119, 'bachelor'],
  ['diego', 'Diego Santos', ['men', 67], 'UFMG', 'Matemática Computacional', '5º Período', 'Belo Horizonte, MG', 'Otimização & Logística',
    ['Python', 'Otimização', 'Pesquisa Operacional', 'Gurobi'],
    'Gosto de problemas de roteamento. Desenvolvo modelos de otimização para coleta seletiva em cidades médias.', 'gold-tint', 64, 'bachelor'],
  ['carolina', 'Carolina Pires', ['women', 90], 'USP', 'Letras', '6º Período', 'São Paulo, SP', 'Linguística Computacional',
    ['NLP', 'Linguística', 'Python', 'Corpus'],
    'Construo corpora de português falado nas periferias de São Paulo para treinar modelos de fala mais inclusivos.', 'green-tint', 112, 'bachelor'],
  ['henrique', 'Henrique Araújo', ['men', 91], 'UnB', 'Engenharia Aeroespacial', '8º Período', 'Brasília, DF', 'CubeSats & Sistemas Espaciais',
    ['C', 'Sistemas Embarcados', 'Aeroespacial', 'Python', 'Telemetria'],
    'Engenheiro de software de voo do projeto de CubeSat da UnB. Sonho em ver um satélite universitário brasileiro em órbita.', 'navy', 205, 'bachelor'],
  ['marina', 'Marina Lopes', ['women', 8], 'UFSC', 'Ciência da Computação', 'Doutorado', 'Florianópolis, SC', 'IA Responsável',
    ['Machine Learning', 'Ética em IA', 'Python', 'Fairness'],
    'Doutoranda investigando vieses em modelos de crédito e como explicar decisões automatizadas para pessoas leigas.', 'ink', 187, 'doctorate'],
  ['rafaelaC', 'Rafaela Cunha', ['women', 2], 'UFPE', 'Engenharia Biomédica', '7º Período', 'Recife, PE', 'Dispositivos Médicos',
    ['Engenharia Biomédica', 'Arduino', 'Sinais Biológicos', 'Impressão 3D'],
    'Desenvolvo próteses de mão de baixo custo com sensores mioelétricos, em parceria com um centro de reabilitação.', 'gold', 133, 'bachelor'],
  ['joao', 'João Victor Prado', ['men', 22], 'UFRGS', 'Agronomia', '8º Período', 'Porto Alegre, RS', 'Agricultura de Precisão',
    ['Agronomia', 'Drones', 'Python', 'Sensoriamento Remoto'],
    'Uso drones e visão computacional para detectar pragas em lavouras familiares de arroz.', 'green', 71, 'bachelor'],
];

const ORGS = [
  ['ligaIa', 'Liga Acadêmica de IA — UFRJ', 'groupLaptop', 'UFRJ', 'Rio de Janeiro, RJ', 'Liga estudantil de inteligência artificial: grupos de estudo, palestras e projetos com a comunidade.'],
  ['hacklab', 'Laboratório Hacker — UNICAMP', 'hackathon', 'UNICAMP', 'Campinas, SP', 'Espaço maker e hackathons abertos para estudantes de todos os cursos.'],
];

const person = Object.fromEntries(PEOPLE.map(([key]) => [key, uuid(`person:${key}`)]));
const org = Object.fromEntries(ORGS.map(([key]) => [key, uuid(`org:${key}`)]));
const P_ALL = { ...person, ...org, ...{ gabriel: OLD.gabriel, mariana: OLD.mariana, anaClara: OLD.anaClara, tiago: OLD.tiago, rafael: OLD.rafael, beatriz: OLD.beatriz, arthur: OLD.arthur, ic: OLD.ic } };

const pid = (key) => {
  if (!P_ALL[key]) throw new Error(`Unknown person ${key}`);
  return P_ALL[key];
};

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

/** key, title, short, summary, results, methodology, area, type, status, period, date, tags, photos, authors, favorites */
const PROJECTS = [
  ['demoVision', 'Calçada Acessível: detecção de obstáculos em calçadas com visão computacional',
    'Modelo de visão computacional que identifica buracos, rampas e obstáculos em fotos de calçadas para mapear rotas acessíveis.',
    'O projeto treina um detector de objetos com fotos de calçadas de Niterói enviadas por voluntários. Cada detecção vira um ponto num mapa colaborativo que mostra quais trechos são seguros para cadeirantes e pessoas com deficiência visual. A prefeitura recebeu o primeiro relatório com 3 bairros mapeados.',
    ['Precisão média na detecção de obstáculos: 87%', 'Trechos de calçada mapeados: 42 km', 'Voluntários enviando fotos: 130'],
    'Coleta colaborativa de 6 mil fotos com aplicativo próprio; rotulagem em Label Studio; treino de YOLOv8 com aumento de dados; validação cruzada por bairro; publicação dos resultados em mapa web com Leaflet.',
    'Visão Computacional', 'Iniciação Científica', 'Em andamento', 'mar. 2026 - atual', '2026-03-10',
    ['Visão Computacional', 'Python', 'PyTorch', 'Acessibilidade', 'Mapas'], ['city', 'rio', 'monitors'], ['demo', 'fernanda'], 64],
  ['demoUx', 'Redesign do aplicativo de matrícula da universidade',
    'Pesquisa com 200 estudantes e novo protótipo do fluxo de matrícula, testado com usuários reais do campus.',
    'A matrícula online era a maior fonte de reclamações no centro acadêmico. Conduzimos entrevistas, mapeamos a jornada e redesenhamos o fluxo de escolha de disciplinas. O protótipo final reduziu pela metade o tempo para montar a grade em testes de usabilidade.',
    ['Tempo para montar a grade: -52%', 'Satisfação no teste de usabilidade: 4,6/5'],
    'Pesquisa qualitativa com entrevistas semiestruturadas; questionário com 200 respostas; mapa de jornada; protótipo navegável em Figma; dois ciclos de teste de usabilidade com 12 participantes.',
    'Design', 'Projeto de disciplina', 'Concluído', 'ago. 2025 - dez. 2025', '2025-12-12',
    ['Figma', 'UX Research', 'Design', 'Prototipagem'], ['designScreen', 'postIts', 'studyGroup'], ['demo'], 38],
  ['demoAr', 'Guia do campus em realidade aumentada',
    'Aplicativo que mostra, pela câmera do celular, salas, laboratórios e horários de atendimento no campus do Gragoatá.',
    'Calouros se perdem no campus nas primeiras semanas. O aplicativo reconhece fachadas dos prédios e sobrepõe informações úteis, como salas, laboratórios e horários de monitoria. Foi usado na semana de recepção de calouros de 2026.',
    ['Calouros que usaram na recepção: 340', 'Prédios reconhecidos: 14'],
    'Reconhecimento de imagem com ARCore; base de dados de salas em Firebase; testes de campo com calouros; ajustes de iluminação para uso noturno.',
    'Engenharia de Software', 'Projeto Prático', 'Concluído', 'jan. 2026 - mar. 2026', '2026-03-28',
    ['Kotlin', 'Realidade Aumentada', 'Mobile', 'Firebase'], ['phoneApps', 'campus', 'vr'], ['demo', 'thiago'], 51],
  ['solar', 'Microrrede solar para escolas rurais do interior fluminense',
    'Projeto e instalação de uma microrrede fotovoltaica com baterias e monitoramento remoto em uma escola rural.',
    'A escola sofria com quedas de energia que interrompiam aulas e estragavam merenda. Projetamos uma microrrede com painéis, baterias e um controlador próprio que envia dados pela rede celular. Hoje a escola tem energia estável mesmo em dias de tempestade.',
    ['Horas sem energia por mês: de 31 para 2', 'Economia na conta de luz: 68%', 'Custo do controlador: R$ 410'],
    'Levantamento de carga; dimensionamento com PVsyst; controlador com ESP32 e telemetria LoRa; instalação em mutirão com a comunidade; monitoramento por 6 meses.',
    'Engenharia Elétrica e Eletrônica', 'Projeto de Extensão', 'Concluído', 'fev. 2025 - out. 2025', '2025-10-20',
    ['Energia Solar', 'Sistemas Embarcados', 'ESP32', 'Sustentabilidade'], ['solarSky', 'solarAerial', 'powerLines'], ['lucas'], 92],
  ['bees', 'Genômica de abelhas sem ferrão na Mata Atlântica',
    'Sequenciamento e análise de diversidade genética de colônias de jataí em fragmentos de mata.',
    'Coletamos amostras de 60 colônias de abelhas jataí em fragmentos de Mata Atlântica com diferentes graus de isolamento. A análise mostra perda de diversidade genética nos fragmentos menores, o que orienta a criação de corredores ecológicos.',
    ['Colônias sequenciadas: 60', 'Marcadores genéticos analisados: 12 mil'],
    'Coleta em campo; extração de DNA; sequenciamento ddRAD; pipeline em Snakemake; análises populacionais em R (adegenet, hierfstat).',
    'Bioinformática', 'Dissertação', 'Em andamento', 'mar. 2025 - atual', '2025-11-02',
    ['Bioinformática', 'Genômica', 'R', 'Biodiversidade'], ['forest', 'labPipette', 'cells'], ['camila'], 47],
  ['agroBot', 'Robô autônomo para monitoramento de lavouras',
    'Robô terrestre que percorre linhas de plantio e mapeia a saúde das plantas com câmera multiespectral.',
    'Construímos um robô de baixo custo que navega entre linhas de cultivo usando GPS RTK e câmera. Ele gera mapas de vigor das plantas que ajudam pequenos produtores a aplicar insumos só onde é preciso.',
    ['Área monitorada por hora: 1,2 ha', 'Redução no uso de defensivos: 30%'],
    'Chassi em alumínio com motores de passo; ROS 2 com Nav2; GPS RTK; câmera multiespectral; testes em fazenda experimental da universidade.',
    'Robótica', 'Projeto de Engenharia', 'Em andamento', 'abr. 2025 - atual', '2026-02-14',
    ['ROS', 'Robótica', 'C++', 'Agricultura de Precisão'], ['robotBench', 'fieldSunrise', 'rcCar'], ['pedro', 'joao'], 81],
  ['safeStreets', 'Mapa de segurança urbana para mulheres em Belo Horizonte',
    'Cruzamento de dados abertos de iluminação, ocorrências e uso do solo para propor intervenções em praças.',
    'Combinamos dados de iluminação pública, ocorrências registradas e entrevistas com moradoras para identificar trechos críticos. O resultado é um caderno de propostas de desenho urbano entregue à secretaria de planejamento.',
    ['Pontos críticos mapeados: 118', 'Entrevistas realizadas: 64'],
    'Dados abertos da prefeitura; análise espacial em QGIS; oficinas participativas; propostas de projeto em Rhino.',
    'Arquitetura e Urbanismo', 'Trabalho de Conclusão de Curso', 'Em andamento', 'ago. 2025 - atual', '2026-01-20',
    ['QGIS', 'Urbanismo', 'Dados Abertos', 'Mobilidade'], ['city', 'skyscrapers', 'workshopTable'], ['larissa'], 59],
  ['legisNlp', 'Classificação automática de propostas legislativas',
    'Modelo de linguagem que classifica projetos de lei por tema e mede a similaridade entre propostas.',
    'Analisamos 40 mil projetos de lei da Câmara para entender quais temas crescem a cada legislatura. O modelo também encontra propostas quase idênticas apresentadas por diferentes parlamentares.',
    ['Projetos de lei analisados: 40 mil', 'F1 na classificação por tema: 0,91'],
    'Coleta pela API de dados abertos; pré-processamento com spaCy; ajuste fino de BERTimbau; análise de similaridade com embeddings.',
    'Inteligência Artificial', 'Tese', 'Em andamento', 'mar. 2024 - atual', '2025-09-15',
    ['NLP', 'Python', 'Políticas Públicas', 'BERT'], ['libraryShelves', 'codePython', 'analytics'], ['rodrigo'], 103],
  ['screenReader', 'Leitor de cardápios para pessoas com deficiência visual',
    'Aplicativo que lê cardápios fotografados em voz alta e organiza os itens por categoria e preço.',
    'Pessoas cegas relataram dificuldade para pedir em restaurantes sem cardápio acessível. O aplicativo reconhece o texto, separa pratos, preços e categorias e permite navegar por voz.',
    ['Participantes nos testes: 18', 'Acerto na leitura de preços: 96%'],
    'Entrevistas com usuários; OCR com ML Kit; navegação por voz; testes com o laboratório de tecnologia assistiva.',
    'Design', 'Projeto de Extensão', 'Concluído', 'mar. 2025 - nov. 2025', '2025-11-28',
    ['Acessibilidade', 'UX Research', 'Mobile', 'OCR'], ['phoneApps', 'designScreen', 'friends'], ['fernanda', 'demo'], 77],
  ['ids', 'Detecção de intrusão em redes universitárias com aprendizado de máquina',
    'Sistema que analisa tráfego de rede do campus e alerta sobre comportamentos suspeitos em tempo real.',
    'Treinamos modelos com tráfego anonimizado da rede do campus para identificar varreduras e ataques de força bruta. O protótipo já roda em paralelo ao firewall do instituto.',
    ['Ataques detectados no piloto: 1.240', 'Falsos positivos: 2,1%'],
    'Captura com Zeek; engenharia de atributos; modelos de floresta aleatória e autoencoders; painel em Grafana.',
    'Redes e Segurança', 'Iniciação Científica', 'Em andamento', 'jun. 2025 - atual', '2026-01-08',
    ['Segurança', 'Redes', 'Machine Learning', 'Linux'], ['serverRack', 'networkCables', 'serverWoman'], ['gustavo'], 69],
  ['composite', 'Compósitos impressos em 3D com fibra de bananeira',
    'Filamento de impressão 3D reforçado com fibra de bananeira para peças leves e resistentes.',
    'Testamos misturas de PLA com fibra de bananeira tratada e comparamos resistência e peso com o PLA puro. As peças foram usadas no protótipo do carro Baja da equipe.',
    ['Ganho de rigidez: 22%', 'Redução de massa da peça: 9%'],
    'Tratamento alcalino da fibra; extrusão do filamento; impressão de corpos de prova; ensaios de tração e flexão.',
    'Engenharia Mecânica', 'Iniciação Científica', 'Concluído', 'mar. 2025 - set. 2025', '2025-09-30',
    ['Impressão 3D', 'Materiais', 'SolidWorks', 'Sustentabilidade'], ['makerspace', 'drafting', 'engineerLab'], ['isabela'], 44],
  ['localShop', 'Aplicativo de pedidos para comércios de bairro',
    'App gratuito para pequenos comércios receberem pedidos pelo celular sem pagar taxas de plataforma.',
    'Comerciantes da zona norte pagavam até 27% de taxa para aplicativos de entrega. Desenvolvemos um app simples em que o próprio comércio publica o cardápio e recebe pedidos por mensagem.',
    ['Comércios usando o app: 23', 'Pedidos por mês: 1.800'],
    'Entrevistas com comerciantes; desenvolvimento em Flutter; backend em Firebase; acompanhamento semanal com os usuários.',
    'Engenharia de Software', 'Projeto de Extensão', 'Em andamento', 'jul. 2025 - atual', '2026-02-02',
    ['Flutter', 'Mobile', 'Firebase', 'Empreendedorismo'], ['phoneApps', 'laptopPhone', 'coworking'], ['thiago', 'leticia'], 58],
  ['triage', 'Triagem de risco cardiovascular na atenção primária',
    'Ferramenta de apoio à decisão que estima risco cardiovascular a partir de dados de prontuário.',
    'Agentes de saúde não tinham uma forma rápida de priorizar visitas. O painel estima o risco de cada paciente a partir de dados do prontuário e sugere quem deve ser visitado primeiro.',
    ['Pacientes avaliados no piloto: 2.300', 'Sensibilidade para alto risco: 0,88'],
    'Base anonimizada de prontuários; modelo de regressão logística calibrado; painel em Shiny; avaliação com equipe de saúde da família.',
    'Saúde', 'Iniciação Científica', 'Em andamento', 'abr. 2025 - atual', '2025-12-03',
    ['Saúde Digital', 'R', 'Epidemiologia', 'Saúde Pública'], ['stethoscope', 'heartModel', 'hospitalLab'], ['amanda'], 66],
  ['greenConcrete', 'Concreto com resíduos de construção para habitação social',
    'Dosagem de concreto com agregado reciclado e avaliação de custo para casas populares.',
    'Substituímos parte da brita por agregado reciclado de demolições e avaliamos resistência e custo. A mistura final atende às normas para blocos de vedação e reduz o custo em 18%.',
    ['Redução de custo do bloco: 18%', 'Resíduo reaproveitado por m³: 420 kg'],
    'Caracterização dos agregados; dosagem experimental; ensaios de compressão; modelagem BIM de uma casa protótipo.',
    'Engenharia Civil', 'Trabalho de Conclusão de Curso', 'Concluído', 'fev. 2025 - dez. 2025', '2025-12-15',
    ['Engenharia Civil', 'BIM', 'Sustentabilidade', 'Concreto'], ['drafting', 'city', 'workshopTable'], ['bruno'], 41],
  ['finEdu', 'Educação financeira gamificada para o ensino médio',
    'Jogo de celular que ensina orçamento e juros para estudantes de escolas públicas.',
    'Criamos um jogo em que o estudante administra a renda de uma família fictícia por 12 meses. Aplicado em 4 escolas, o jogo melhorou o desempenho em um teste de conhecimentos financeiros.',
    ['Estudantes participantes: 480', 'Melhora no teste de conhecimentos: +34%'],
    'Pesquisa com professores; design de jogo; desenvolvimento em Unity; aplicação em sala com pré e pós-teste.',
    'Educação', 'Projeto de Extensão', 'Concluído', 'mar. 2025 - nov. 2025', '2025-11-20',
    ['Educação', 'Empreendedorismo', 'Gamificação'], ['studentsCafe', 'phoneApps', 'booksApple'], ['leticia'], 72],
  ['plasmaSim', 'Simulação de plasmas de baixa temperatura em GPU',
    'Código de partículas em GPU que acelera em 40 vezes simulações de descargas elétricas em gases.',
    'Reescrevemos um código de simulação de plasma para rodar em GPU. O ganho de velocidade permitiu estudar regimes antes inviáveis, com aplicações em tratamento de superfícies.',
    ['Aceleração em relação à CPU: 40x', 'Partículas simuladas: 200 milhões'],
    'Método particle-in-cell; implementação em Julia com CUDA.jl; validação com resultados experimentais; execução no cluster da universidade.',
    'Ciência de Dados', 'Dissertação', 'Em andamento', 'mar. 2025 - atual', '2025-10-05',
    ['Julia', 'HPC', 'Física', 'Simulação'], ['plasma', 'neuron', 'monitors'], ['vinicius'], 39],
  ['guanabara', 'Monitoramento da Baía de Guanabara por satélite',
    'Série histórica de turbidez e clorofila da baía estimada com imagens Sentinel-2 e validada com sensores.',
    'Montamos uma série de cinco anos de qualidade da água da Baía de Guanabara a partir de imagens de satélite. Sensores de baixo custo instalados com pescadores validam as estimativas.',
    ['Imagens processadas: 1.900', 'Erro médio na turbidez: 11%'],
    'Google Earth Engine; correção atmosférica; modelos de regressão com dados de campo; boias com sensores de baixo custo.',
    'Sustentabilidade', 'Iniciação Científica', 'Em andamento', 'ago. 2025 - atual', '2026-02-20',
    ['Sensoriamento Remoto', 'Google Earth Engine', 'Python', 'Hidrologia'], ['rio', 'rioCableCar', 'valley'], ['natalia', 'gabriel'], 84],
  ['routing', 'Roteirização da coleta seletiva em cidades médias',
    'Modelo de otimização que redesenha as rotas de caminhões de coleta seletiva e reduz quilômetros rodados.',
    'Com dados de pontos de coleta de uma cidade de 200 mil habitantes, otimizamos as rotas dos caminhões. A proposta reduz a distância percorrida e permite atender bairros hoje sem coleta.',
    ['Redução da distância percorrida: 23%', 'Novos bairros atendidos: 6'],
    'Modelagem como problema de roteamento com janelas de tempo; resolução com Gurobi e heurísticas; validação com motoristas.',
    'Dados e Análise', 'Iniciação Científica', 'Concluído', 'mar. 2025 - out. 2025', '2025-10-30',
    ['Otimização', 'Python', 'Pesquisa Operacional', 'Sustentabilidade'], ['city', 'analytics', 'dashboard'], ['diego'], 33],
  ['speechCorpus', 'Corpus de português falado nas periferias de São Paulo',
    'Coleta e transcrição de 120 horas de fala para treinar reconhecedores de voz mais inclusivos.',
    'Reconhecedores de voz erram mais com sotaques periféricos. Gravamos e transcrevemos conversas com consentimento de moradores e mostramos que o ajuste fino com esse corpus reduz bastante os erros.',
    ['Horas de fala transcritas: 120', 'Redução da taxa de erro de palavras: 37%'],
    'Gravações em oficinas comunitárias; transcrição com revisão dupla; ajuste fino de Whisper; avaliação por região.',
    'Inteligência Artificial', 'Iniciação Científica', 'Em andamento', 'fev. 2025 - atual', '2025-12-18',
    ['NLP', 'Linguística', 'Python', 'Reconhecimento de Fala'], ['microphone', 'notes', 'friends'], ['carolina'], 61],
  ['cubesat', 'Software de voo para CubeSat universitário',
    'Sistema embarcado que controla energia, comunicação e câmera de um nanossatélite de 1U.',
    'O CubeSat da UnB precisava de um software de voo confiável. Escrevemos o sistema que gerencia energia, telemetria e a câmera, testado em câmara térmica e em voo de balão estratosférico.',
    ['Altitude no voo de balão: 31 km', 'Pacotes de telemetria recebidos: 98%'],
    'FreeRTOS em microcontrolador ARM; testes em hardware-in-the-loop; câmara térmica; voo de balão com recuperação.',
    'Engenharia Elétrica e Eletrônica', 'Projeto de Engenharia', 'Em andamento', 'mar. 2024 - atual', '2026-01-30',
    ['Sistemas Embarcados', 'C', 'Aeroespacial', 'Telemetria'], ['plasma', 'circuit', 'solder'], ['henrique'], 112],
  ['fairCredit', 'Explicações de decisões de crédito para pessoas leigas',
    'Estudo com usuários sobre como explicar decisões de modelos de crédito de forma justa e compreensível.',
    'Testamos quatro formatos de explicação de decisões de crédito com 300 participantes. Explicações contrafactuais curtas foram as mais compreendidas e as que mais aumentaram a confiança.',
    ['Participantes do estudo: 300', 'Compreensão com explicação contrafactual: 81%'],
    'Modelos de crédito treinados em base pública; geração de explicações SHAP e contrafactuais; experimento online entre sujeitos.',
    'Inteligência Artificial', 'Tese', 'Em andamento', 'mar. 2023 - atual', '2025-08-22',
    ['Ética em IA', 'Machine Learning', 'Fairness', 'Python'], ['codePython', 'meetingTable', 'analytics'], ['marina'], 95],
  ['prosthesis', 'Prótese de mão mioelétrica de baixo custo',
    'Prótese impressa em 3D controlada por sinais musculares, custando menos de 5% de uma prótese comercial.',
    'Em parceria com um centro de reabilitação, desenvolvemos uma prótese de mão impressa em 3D que abre e fecha com sinais dos músculos do antebraço. Três pacientes testaram o protótipo por um mês.',
    ['Custo de materiais: R$ 780', 'Movimentos reconhecidos: 4', 'Pacientes no teste: 3'],
    'Captação de sinais EMG; classificação com Arduino; projeto mecânico em Fusion 360; impressão em PETG; testes de uso com terapeutas.',
    'Saúde', 'Projeto de Engenharia', 'Em andamento', 'fev. 2025 - atual', '2026-03-02',
    ['Engenharia Biomédica', 'Impressão 3D', 'Arduino', 'Sinais Biológicos'], ['robotWhite', 'makerspace', 'solder'], ['rafaelaC'], 128],
  ['droneRice', 'Detecção de pragas em arrozais com drones',
    'Imagens de drone e um classificador leve identificam focos de pragas em lavouras familiares.',
    'Pequenos produtores de arroz perdem parte da safra porque descobrem pragas tarde. Voos semanais com drone e um classificador que roda no celular mostram os focos no mapa da propriedade.',
    ['Propriedades atendidas: 11', 'Acurácia na detecção de pragas: 89%'],
    'Voos com drone de baixo custo; ortomosaicos em OpenDroneMap; classificador MobileNet; aplicativo offline para o produtor.',
    'Visão Computacional', 'Trabalho de Conclusão de Curso', 'Em andamento', 'ago. 2025 - atual', '2026-02-26',
    ['Drones', 'Visão Computacional', 'Agronomia', 'Python'], ['fieldSunrise', 'vegetables', 'soil'], ['joao', 'pedro'], 49],
  ['hackathonKit', 'Kit de sensores abertos para hackathons de cidade inteligente',
    'Placas, firmware e tutoriais para equipes montarem sensores urbanos em um fim de semana.',
    'Nos hackathons, as equipes perdiam metade do tempo montando hardware. O kit traz placas prontas, firmware e tutoriais, e já foi usado por 40 equipes em três eventos.',
    ['Equipes que usaram o kit: 40', 'Tempo médio de montagem: 25 min'],
    'Placa própria com ESP32; firmware em MicroPython; documentação aberta; oficinas antes dos eventos.',
    'Engenharia Elétrica e Eletrônica', 'Projeto de Extensão', 'Concluído', 'jan. 2025 - ago. 2025', '2025-08-30',
    ['ESP32', 'Sistemas Embarcados', 'Cidades Inteligentes', 'Python'], ['hackathon', 'circuit', 'pcbClose'], ['hacklab', 'lucas'], 57],
];

const project = Object.fromEntries(PROJECTS.map(([key]) => [key, uuid(`project:${key}`)]));

/* ------------------------------------------------------------------ */
/* Events                                                              */
/* ------------------------------------------------------------------ */

/** key, title, category, status, starts, ends, location, city, organizer, modality, tags, short, about, cover, speakers, schedule, attendees */
const EVENTS = [
  ['hackRio', 'Hackathon Cidades Resilientes', 'Hackathon', 'Inscrições abertas', '2026-11-28 09:00', '2026-11-29 18:00',
    'Centro de Tecnologia da UFRJ', 'Rio de Janeiro', 'Liga Acadêmica de IA — UFRJ', 'Presencial',
    ['Dados Abertos', 'Cidades Inteligentes', 'Sustentabilidade'],
    '36 horas para criar soluções com dados abertos para enchentes, calor e mobilidade no Rio.',
    'Equipes de até cinco pessoas recebem bases de dados da cidade e mentoria de pesquisadores. Os três melhores projetos ganham incubação por seis meses.',
    'hackathon', [['Natália Souza', 'Mentora de dados ambientais', 'natalia'], ['Gabriel Costa', 'Mentor de geoprocessamento', 'gabriel']],
    [['09:00', 'Abertura e formação de equipes'], ['13:00', 'Mentorias'], ['16:00', 'Apresentações finais']], 186],
  ['iaWeek', 'Semana de Inteligência Artificial da UFSC', 'Semana acadêmica', 'Inscrições abertas', '2026-12-01 09:00', '2026-12-05 18:00',
    'Auditório do CTC', 'Florianópolis', 'Universidade Federal de Santa Catarina (UFSC)', 'Híbrido',
    ['Inteligência Artificial', 'Ética em IA', 'Machine Learning'],
    'Cinco dias de palestras, minicursos e pôsteres sobre IA responsável e aplicações no Brasil.',
    'A semana reúne pesquisadores, estudantes e empresas. Haverá minicursos de PyTorch, mesa sobre regulação de IA e sessão de pôsteres de iniciação científica.',
    'auditorium', [['Marina Lopes', 'Doutoranda em IA Responsável', 'marina'], ['Rodrigo Nascimento', 'Pesquisador em NLP', 'rodrigo']],
    [['09:00', 'Abertura'], ['10:30', 'Minicurso de PyTorch'], ['14:00', 'Mesa: regulação de IA no Brasil']], 412],
  ['robotics', 'Torneio Universitário de Robótica Autônoma', 'Competição', 'Inscrições abertas', '2026-12-12 08:00', '2026-12-13 17:00',
    'Ginásio da UNICAMP', 'Campinas', 'Laboratório Hacker — UNICAMP', 'Presencial',
    ['Robótica', 'ROS', 'Visão Computacional'],
    'Equipes de todo o país disputam provas de navegação, manipulação e futebol de robôs.',
    'O torneio tem três modalidades e uma sessão de demonstração aberta ao público. Equipes estreantes recebem mentoria técnica antes da competição.',
    'toyRobot', [['Pedro Henrique Lima', 'Capitão da equipe anfitriã', 'pedro'], ['Tiago Mendes', 'Juiz técnico', 'tiago']],
    [['08:00', 'Credenciamento'], ['10:00', 'Provas de navegação'], ['15:00', 'Finais de futebol de robôs']], 254],
  ['uxDay', 'Encontro de UX e Acessibilidade', 'Workshop', 'Inscrições abertas', '2026-11-21 14:00', '2026-11-21 18:00',
    'Centro de Artes e Comunicação da UFPE', 'Recife', 'Universidade Federal de Pernambuco (UFPE)', 'Presencial',
    ['UX Research', 'Acessibilidade', 'Design'],
    'Oficina prática de testes de usabilidade com pessoas com deficiência.',
    'Os participantes planejam e conduzem um teste de usabilidade com acompanhamento de especialistas. Traga seu notebook e um protótipo, se tiver.',
    'postIts', [['Fernanda Ribeiro', 'Designer e pesquisadora', 'fernanda']],
    [['14:00', 'Boas-vindas'], ['14:30', 'Planejamento do teste'], ['16:00', 'Testes com participantes']], 64],
  ['energy', 'Seminário de Transição Energética', 'Seminário', 'Inscrições abertas', '2026-12-03 09:00', '2026-12-03 17:00',
    'Online', 'Online', 'Universidade Federal do Rio de Janeiro (UFRJ)', 'Online',
    ['Energia Solar', 'Sustentabilidade', 'Engenharia Elétrica'],
    'Pesquisas sobre energia solar, eólica e microrredes em comunidades brasileiras.',
    'Seminário online com apresentações de projetos de extensão e pesquisa em energia limpa, seguido de debate com gestores públicos.',
    'windSunset', [['Lucas Ferreira', 'Pesquisador em microrredes', 'lucas']],
    [['09:00', 'Abertura'], ['10:00', 'Painel: energia em comunidades isoladas'], ['14:00', 'Apresentações de projetos']], 338],
  ['bioinfo', 'Escola de Verão em Bioinformática', 'Curso', 'Inscrições abertas', '2027-01-18 09:00', '2027-01-22 17:00',
    'Instituto de Biociências da USP', 'São Paulo', 'Universidade de São Paulo (USP)', 'Presencial',
    ['Bioinformática', 'Genômica', 'R', 'Python'],
    'Uma semana de aulas práticas de análise genômica para estudantes de graduação.',
    'Curso intensivo com aulas práticas em servidores da universidade: controle de qualidade, montagem de genomas e análises populacionais.',
    'microscopes', [['Camila Rocha', 'Monitora de genômica', 'camila'], ['Beatriz Vasconcelos', 'Monitora de química computacional', 'beatriz']],
    [['09:00', 'Linux para bioinformática'], ['14:00', 'Prática: controle de qualidade de leituras']], 80],
  ['ctf', 'CTF Universitário do Sul', 'Competição', 'Inscrições abertas', '2026-11-29 10:00', '2026-11-29 22:00',
    'Online', 'Online', 'Universidade Federal do Rio Grande do Sul (UFRGS)', 'Online',
    ['Segurança', 'Redes', 'Criptografia'],
    'Competição de segurança no formato capture the flag, aberta a estudantes de todo o Brasil.',
    'Desafios de web, criptografia, engenharia reversa e forense. Equipes de até quatro pessoas. Haverá uma oficina introdutória na semana anterior.',
    'serverRack', [['Gustavo Almeida', 'Organizador', 'gustavo']],
    [['10:00', 'Abertura dos desafios'], ['22:00', 'Encerramento e placar final']], 297],
  ['startup', 'Feira de Startups Universitárias', 'Feira', 'Inscrições abertas', '2026-12-10 10:00', '2026-12-10 19:00',
    'Campus Centro do Ibmec', 'Rio de Janeiro', 'Ibmec Rio', 'Presencial',
    ['Empreendedorismo', 'Inovação', 'Startups'],
    'Estudantes apresentam suas startups para investidores, aceleradoras e empresas.',
    'Mais de 30 startups universitárias em estandes, rodada de pitches de 3 minutos e mentorias rápidas com investidores-anjo.',
    'pitchTalk', [['Letícia Gomes', 'Cofundadora de startup de educação financeira', 'leticia'], ['Arthur', 'Pesquisador em LLMs', 'arthur']],
    [['10:00', 'Abertura da feira'], ['14:00', 'Rodada de pitches'], ['18:00', 'Premiação']], 365],
  ['space', 'Jornada de Engenharia Aeroespacial', 'Palestra', 'Encerrado', '2026-10-15 18:00', '2026-10-15 21:00',
    'Auditório da Faculdade de Tecnologia da UnB', 'Brasília', 'Universidade de Brasília (UnB)', 'Híbrido',
    ['Aeroespacial', 'Sistemas Embarcados', 'CubeSats'],
    'Como estudantes brasileiros estão construindo satélites e foguetes na universidade.',
    'Palestras sobre o projeto de CubeSat da UnB, voos de balão estratosférico e oportunidades de estágio no setor espacial.',
    'stageTalk', [['Henrique Araújo', 'Engenheiro de software de voo', 'henrique']],
    [['18:00', 'Abertura'], ['18:30', 'O CubeSat da UnB'], ['20:00', 'Perguntas']], 221],
  ['health', 'Simpósio de Saúde Digital', 'Simpósio', 'Inscrições abertas', '2027-02-05 09:00', '2027-02-06 17:00',
    'Hospital Universitário Pedro Ernesto', 'Rio de Janeiro', 'Universidade do Estado do Rio de Janeiro (UERJ)', 'Presencial',
    ['Saúde Digital', 'Epidemiologia', 'Inteligência Artificial'],
    'Dados, IA e dispositivos médicos a serviço da atenção primária.',
    'Dois dias de palestras e apresentações de trabalhos sobre triagem, prontuário eletrônico, telessaúde e dispositivos de baixo custo.',
    'hospitalLab', [['Amanda Costa', 'Pesquisadora em saúde digital', 'amanda'], ['Rafaela Cunha', 'Engenheira biomédica', 'rafaelaC']],
    [['09:00', 'Conferência de abertura'], ['11:00', 'Sessão de pôsteres'], ['14:00', 'Mesa: IA na atenção primária']], 178],
];
const event = Object.fromEntries(EVENTS.map(([key]) => [key, uuid(`event:${key}`)]));

/* ------------------------------------------------------------------ */
/* Posts                                                               */
/* ------------------------------------------------------------------ */

/** key, author, category, hoursAgo, content, photos, relatedProject, relatedEvent, likes, comments [[author, text]] */
const POSTS = [
  ['p1', 'demo', 'Visão Computacional', 2,
    'Primeira saída de campo do Calçada Acessível! Passamos a manhã fotografando calçadas no centro de Niterói com 20 voluntários. O modelo já reconhece rampas quebradas e buracos com boa precisão. Próximo passo: levar o mapa para a prefeitura.',
    ['city', 'rio', 'monitors'], 'demoVision', null, 48,
    [['fernanda', 'Que manhã boa! As fotos das rampas ficaram ótimas para o conjunto de treino.'], ['gabriel', 'Se precisarem cruzar com dados de relevo, me chama. Tenho as camadas de Niterói prontas.'], ['larissa', 'Isso conversa muito com o meu TCC em BH. Bora trocar uma ideia?']]],
  ['p2', 'lucas', 'Pesquisa Acadêmica', 4,
    'Seis meses depois da instalação, a escola rural de Cachoeiras de Macacu não ficou um dia sem aula por falta de energia. Os dados de telemetria estão abertos no repositório do projeto. Obrigado a toda a comunidade que ajudou no mutirão!',
    ['solarSky', 'solarAerial'], 'solar', null, 132,
    [['natalia', 'Que resultado incrível, Lucas!'], ['henrique', 'Qual rádio vocês usaram na telemetria? LoRa funcionou bem com a vegetação?'], ['lucas', 'LoRa a 915 MHz com antena externa. Chegou a 6 km sem problemas.']]],
  ['p3', 'ligaIa', 'Palestra Oficial', 6,
    'Inscrições abertas para o Hackathon Cidades Resilientes! 36 horas, bases de dados da cidade do Rio e mentoria de pesquisadores. Equipes de até cinco pessoas, de qualquer curso.',
    ['hackathon', 'groupLaptop'], null, 'hackRio', 87,
    [['thiago', 'Já montei equipe com o pessoal do CEFET!'], ['demo', 'Alguém de design procurando equipe? Tô dentro.']]],
  ['p4', 'camila', 'Pesquisa Acadêmica', 9,
    'Voltando do campo com 60 colônias de jataí amostradas. Agora começa a parte de laboratório: extração de DNA e preparação das bibliotecas. Abelhas sem ferrão são incríveis e merecem mais pesquisa no Brasil.',
    ['forest', 'labPipette', 'cells'], 'bees', null, 76,
    [['beatriz', 'Que trabalho bonito, Camila. Vocês vão disponibilizar os dados brutos?'], ['camila', 'Sim! Tudo vai para o SRA quando o artigo sair.']]],
  ['p5', 'pedro', 'Engenharia de Software', 12,
    'O robô de monitoramento fez a primeira volta completa na fazenda experimental sem intervenção humana. 1,2 hectare mapeado em uma hora. Vídeo e código no perfil do projeto.',
    ['robotBench', 'fieldSunrise'], 'agroBot', null, 154,
    [['joao', 'Agora falta testar na lavoura de arroz lá do sul!'], ['tiago', 'Que estabilidade na navegação. Vocês estão usando Nav2 puro?'], ['pedro', 'Nav2 com um planejador próprio para seguir as linhas de plantio.']]],
  ['p6', 'fernanda', 'Pesquisa Acadêmica', 20,
    'Testamos o leitor de cardápios com 18 pessoas cegas e com baixa visão. A maior lição: menos botões, mais atalhos por voz. Vem aí a versão 2, muito mais simples.',
    ['phoneApps', 'friends'], 'screenReader', null, 98,
    [['demo', 'Foi muito bonito acompanhar esses testes.'], ['amanda', 'Vocês pensaram em levar para farmácias e bulas também?']]],
  ['p7', 'hacklab', 'Palestra Oficial', 26,
    'Inscrições abertas para o Torneio Universitário de Robótica Autônoma! Três modalidades: navegação, manipulação e futebol de robôs. Equipes estreantes ganham mentoria antes do torneio.',
    ['toyRobot', 'rcCar'], null, 'robotics', 121,
    [['pedro', 'Equipe da casa confirmada!'], ['tiago', 'A CapyVision vai com tudo esse ano.']]],
  ['p8', 'rodrigo', 'Dados e Análise', 30,
    'Analisando 40 mil projetos de lei: o tema que mais cresceu na última legislatura foi segurança pública, seguido por proteção de dados. Os gráficos completos estão na tese, capítulo 4.',
    ['analytics', 'libraryShelves'], 'legisNlp', null, 143,
    [['marina', 'Você testou se o modelo trata bem propostas com texto muito curto?'], ['rodrigo', 'Boa pergunta. Abaixo de 50 palavras o F1 cai para 0,78. Está nas limitações.']]],
  ['p9', 'gustavo', 'Engenharia de Software', 34,
    'Nosso detector de intrusão pegou 1.240 tentativas de ataque em um mês de piloto na rede do instituto. Quase todas eram varreduras automáticas, mas três eram ataques direcionados.',
    ['serverRack', 'networkCables'], 'ids', null, 89,
    [['vinicius', 'Assustador e fascinante ao mesmo tempo.']]],
  ['p10', 'isabela', 'Pesquisa Acadêmica', 40,
    'Peças impressas com fibra de bananeira aprovadas nos ensaios! 22% mais rígidas que o PLA puro. Elas já estão no carro Baja da equipe para a competição de dezembro.',
    ['makerspace', 'engineerLab', 'drafting'], 'composite', null, 67,
    [['bruno', 'Que ideia boa usar resíduo agrícola.'], ['rafaelaC', 'Será que funciona para peças de prótese? Bora testar juntas.']]],
  ['p11', 'thiago', 'Engenharia de Software', 46,
    '23 comércios do Méier e de Madureira já recebem pedidos pelo nosso app, sem taxa nenhuma. A padaria do Seu Antônio dobrou as vendas de fim de semana.',
    ['laptopPhone', 'coworking'], 'localShop', null, 112,
    [['leticia', 'Orgulho desse projeto!'], ['demo', 'Que história boa. Manda um abraço para o Seu Antônio.']]],
  ['p12', 'amanda', 'Pesquisa Acadêmica', 52,
    'Apresentei hoje o painel de risco cardiovascular para a equipe de saúde da família. Os agentes já sugeriram três melhorias. Pesquisa boa é a que sai do papel e chega na ponta.',
    ['stethoscope', 'hospitalLab'], 'triage', null, 95,
    [['rafaelaC', 'Arrasou, Amanda!']]],
  ['p13', 'natalia', 'Dados e Análise', 60,
    'Cinco anos de imagens de satélite mostram que a turbidez da Baía de Guanabara aumenta até 40% depois de chuvas fortes. Agora estamos instalando boias com pescadores de São Gonçalo para validar.',
    ['rio', 'rioCableCar', 'valley'], 'guanabara', null, 168,
    [['gabriel', 'Esse cruzamento com as estações do ar ficou muito bom.'], ['lucas', 'Se precisarem de energia solar para as boias, estamos aqui.'], ['natalia', 'Vou te chamar, Lucas!']]],
  ['p14', 'leticia', 'Pesquisa Acadêmica', 72,
    'Resultado do jogo de educação financeira em 4 escolas públicas: melhora de 34% no teste de conhecimentos. E o melhor: os estudantes pediram para continuar jogando depois da aula.',
    ['studentsCafe', 'booksApple'], 'finEdu', null, 104,
    [['carolina', 'Que lindo ver isso funcionando em sala.']]],
  ['p15', 'henrique', 'Pesquisa Acadêmica', 80,
    'Nosso CubeSat subiu 31 km num balão estratosférico e mandou 98% dos pacotes de telemetria. Próxima parada: órbita!',
    ['plasma', 'circuit'], 'cubesat', null, 211,
    [['vinicius', 'Que foto da curvatura da Terra!'], ['pedro', 'Parabéns à equipe toda.'], ['demo', 'Arrepiei aqui.']]],
  ['p16', 'demo', 'Pesquisa Acadêmica', 96,
    'Fechando o semestre com o redesign do aplicativo de matrícula. Nos testes, o tempo para montar a grade caiu pela metade. Obrigada a todo mundo que respondeu a pesquisa!',
    ['designScreen', 'postIts'], 'demoUx', null, 73,
    [['fernanda', 'Ficou lindo, Júlia. Vou usar como referência no meu próximo projeto.'], ['thiago', 'Manda para a reitoria!']]],
  ['p17', 'marina', 'Pesquisa Acadêmica', 110,
    'Estudo com 300 pessoas: explicações contrafactuais curtas ("se sua renda fosse X, o crédito seria aprovado") foram as mais compreendidas. Transparência também é design.',
    ['meetingTable', 'codePython'], 'fairCredit', null, 126,
    [['rodrigo', 'Isso deveria virar recomendação regulatória.']]],
  ['p18', 'rafaelaC', 'Pesquisa Acadêmica', 130,
    'Três pacientes testaram nossa prótese de mão por um mês. O feedback mais emocionante: "consegui segurar o copo do meu filho". Custo de materiais: R$ 780.',
    ['robotWhite', 'makerspace', 'solder'], 'prosthesis', null, 298,
    [['amanda', 'Que trabalho necessário.'], ['isabela', 'Vamos testar a fibra de bananeira nas próximas peças!'], ['demo', 'Que orgulho de ver isso.']]],
  ['p19', 'carolina', 'Dados e Análise', 150,
    'Fechamos 120 horas de fala transcrita com moradores de Itaquera, Capão Redondo e Brasilândia. O reconhecedor ajustado com esse corpus errou 37% menos. Sotaque não é ruído.',
    ['microphone', 'notes'], 'speechCorpus', null, 117,
    [['rodrigo', 'Vocês pretendem abrir o corpus?'], ['carolina', 'Sim, com licença de uso acadêmico e consentimento renovado.']]],
  ['p20', 'joao', 'Visão Computacional', 170,
    'Primeiros voos de drone nas lavouras de arroz em Camaquã. O classificador roda direto no celular do produtor, sem internet.',
    ['fieldSunrise', 'vegetables'], 'droneRice', null, 58,
    [['pedro', 'Bora integrar com o robô terrestre!']]],
  ['p21', 'ic', 'Palestra Oficial', 190,
    'Lembrete: a palestra "RAG e LLMs: aplicações e desafios na pesquisa acadêmica" acontece dia 26 de novembro, no auditório do Instituto de Computação. Vagas limitadas.',
    ['stageTalk', 'audience'], null, OLD.eventRag, 64, []],
  ['p22', 'bruno', 'Pesquisa Acadêmica', 210,
    'Blocos de concreto com 420 kg de resíduo reaproveitado por metro cúbico, atendendo à norma e 18% mais baratos. Habitação social pode e deve ser sustentável.',
    ['drafting', 'workshopTable'], 'greenConcrete', null, 52,
    [['larissa', 'Isso precisa chegar nos programas habitacionais.']]],
  ['p23', 'vinicius', 'Dados e Análise', 240,
    'Reescrevemos o código de simulação de plasma em Julia com CUDA e ficou 40 vezes mais rápido. 200 milhões de partículas numa única GPU.',
    ['plasma', 'neuron'], 'plasmaSim', null, 81,
    [['henrique', 'Julia na física está crescendo muito.']]],
  ['p24', 'diego', 'Dados e Análise', 270,
    'Nova rota da coleta seletiva entrou em teste: 23% menos quilômetros e seis bairros que nunca tiveram coleta agora vão ter.',
    ['city', 'dashboard'], 'routing', null, 47, []],
  ['p25', 'larissa', 'Pesquisa Acadêmica', 300,
    'Oficina participativa na Praça Raul Soares com 30 moradoras. O mapa coletivo mostra que a iluminação é só parte do problema: falta movimento e comércio aberto à noite.',
    ['workshopTable', 'city'], 'safeStreets', null, 91,
    [['demo', 'Que metodologia bonita.']]],
  ['p26', 'hacklab', 'Palestra Oficial', 330,
    'O kit de sensores abertos já foi usado por 40 equipes em três hackathons. Tudo documentado e livre para qualquer universidade usar.',
    ['hackathon', 'pcbClose'], 'hackathonKit', null, 73, []],
  ['p27', 'gustavo', 'Palestra Oficial', 360,
    'O CTF Universitário do Sul está chegando! Desafios de web, cripto, reversa e forense. Inscrições gratuitas, equipes de até quatro pessoas.',
    ['serverRack'], null, 'ctf', 66,
    [['vinicius', 'Bora montar equipe da física, alguém?']]],
  ['p28', 'marina', 'Palestra Oficial', 400,
    'Semana de IA da UFSC confirmada de 1 a 5 de dezembro, com mesa sobre regulação de IA no Brasil e sessão de pôsteres de IC. Mandem seus trabalhos!',
    ['auditorium', 'bigAudience'], null, 'iaWeek', 102, []],
  ['p29', 'demo', 'Engenharia de Software', 430,
    'O guia em realidade aumentada do campus foi usado por 340 calouros na semana de recepção. Ninguém mais perdido procurando o bloco D!',
    ['phoneApps', 'campus'], 'demoAr', null, 88,
    [['thiago', 'Foi divertido demais construir isso junto.']]],
  ['p30', 'leticia', 'Palestra Oficial', 460,
    'Feira de Startups Universitárias no Ibmec em 10 de dezembro. Mais de 30 startups, rodada de pitches e mentoria com investidores. Bora?',
    ['pitchTalk', 'meetup'], null, 'startup', 77, []],
  ['p31', 'lucas', 'Palestra Oficial', 500,
    'Vou apresentar a microrrede solar no Seminário de Transição Energética, online, dia 3 de dezembro. Quem quiser assistir, o link está no evento.',
    ['windSunset'], null, 'energy', 41, []],
  ['p32', 'tiago', 'Visão Computacional', 540,
    'Treino de sábado no laboratório. A CapyVision agora roda a 120 quadros por segundo com o novo rastreador.',
    ['rcCar', 'robotBench'], OLD.projVision, null, 59, []],
  ['p33', 'anaClara', 'Dados e Análise', 600,
    'Fechei a avaliação da arquitetura RAG com 2 mil perguntas sobre teses brasileiras. As citações agora apontam para o parágrafo exato da fonte.',
    ['libraryLamps', 'codeDark'], OLD.projRag, null, 93, []],
  ['p34', 'beatriz', 'Pesquisa Acadêmica', 650,
    'Mais 40 moléculas da biodiversidade brasileira entraram na triagem virtual. Duas mostraram afinidade promissora com o alvo. Agora é validar em bancada.',
    ['flasks', 'microscopes'], OLD.projBiodock, null, 71, []],
  ['p35', 'mariana', 'Dados e Análise', 700,
    'Os mapas de qualidade do ar agora atualizam de hora em hora. Teste no seu bairro e me conta se faz sentido com o que você sente na rua.',
    ['worldMap', 'dashboard'], OLD.projAir, null, 84, []],
  ['p36', 'rafael', 'Pesquisa Acadêmica', 760,
    'O SabiáEdu passou de mil textos revisados! Os comentários mais comuns: parágrafos longos demais e referências sem padrão. Clássico.',
    ['writing', 'openBook'], OLD.projSabia, null, 62, []],
  ['p37', 'arthur', 'Engenharia de Software', 820,
    'Integramos LLMs no fluxo de triagem de chamados da equipe e o tempo de primeira resposta caiu bastante. Escrevi um resumo do que funcionou e do que não funcionou.',
    ['teamLaptops', 'codeScreen'], OLD.projLlm, null, 55, []],
  ['p38', 'henrique', 'Palestra Oficial', 900,
    'Obrigado a todos que foram na Jornada de Engenharia Aeroespacial! Os slides e a gravação estão na página do evento.',
    ['stageTalk', 'bigAudience'], null, 'space', 96, []],
  ['p39', 'amanda', 'Palestra Oficial', 950,
    'Submissões abertas para o Simpósio de Saúde Digital da UERJ, em fevereiro. Trabalhos de graduação são muito bem-vindos.',
    ['hospitalLab', 'xray'], null, 'health', 58, []],
  ['p40', 'camila', 'Palestra Oficial', 1000,
    'A Escola de Verão em Bioinformática da USP abriu inscrições. Uma semana de aulas práticas, com bolsas de hospedagem para quem vem de fora.',
    ['microscopes', 'labPipette'], null, 'bioinfo', 69, []],
];

/* ------------------------------------------------------------------ */
/* SQL                                                                 */
/* ------------------------------------------------------------------ */

const out = [];
const emit = (sql) => out.push(sql.trim() + '\n');

emit(`-- Generated by scripts/generate-demo-seed.mjs. Do not edit by hand.
begin;`);

// Demo account. The profile_claims row makes handle_new_user attach the auth user to the prepared profile.
const demoProfile = person.demo;
const demoAuthId = uuid('auth:demo');

for (const [key, name, [gender, n], uni, course, period, location, focus, tags, bio, hero, connections, level] of PEOPLE) {
  const id = person[key];
  const isDemo = key === 'demo';
  emit(`insert into public.profiles (id, is_sample, claimed, name, focus, institution, short_institution, course, period, location, bio, tags, avatar_url, connections_base, hero_color, education_level, education_status, email_confirmed, github, linkedin, badges)
values ('${id}', true, false, ${q(name)}, ${q(focus)}, ${q(UNI[uni])}, ${q(uni)}, ${q(course)}, ${q(period)}, ${q(location)}, ${q(bio)}, ${arr(tags)}, ${q(portrait(gender, n))}, ${connections}, ${q(hero)}, ${q(level)}, 'in_progress', true,
  ${q(`github.com/${name.toLowerCase().normalize('NFD').replace(/[^a-z ]/g, '').split(' ').join('')}`)}, ${q(`linkedin.com/in/${name.toLowerCase().normalize('NFD').replace(/[^a-z ]/g, '').split(' ').join('-')}`)},
  ${arr(isDemo ? ['academic', 'tech', 'career', 'verified'] : [])})
on conflict (id) do update set name = excluded.name, focus = excluded.focus, institution = excluded.institution, short_institution = excluded.short_institution,
  course = excluded.course, period = excluded.period, location = excluded.location, bio = excluded.bio, tags = excluded.tags, avatar_url = excluded.avatar_url,
  connections_base = excluded.connections_base, hero_color = excluded.hero_color, education_level = excluded.education_level, badges = excluded.badges;`);
}

for (const [key, name, cover, uni, location, bio] of ORGS) {
  emit(`insert into public.profiles (id, is_sample, is_organization, name, focus, institution, short_institution, location, bio, tags, avatar_url, connections_base, hero_color, email_confirmed)
values ('${org[key]}', true, true, ${q(name)}, 'Organização estudantil', ${q(UNI[uni])}, ${q(uni)}, ${q(location)}, ${q(bio)}, '{}'::text[], ${q(photo(cover, 300))}, 300, 'green', true)
on conflict (id) do update set name = excluded.name, bio = excluded.bio, avatar_url = excluded.avatar_url;`);
}

for (const [oldId, hero] of Object.entries(OLD_HERO_COLORS)) {
  emit(`update public.profiles set hero_color = ${q(hero)} where id = '${oldId}';`);
}

const shortUni = (key) => {
  const entry = PEOPLE.find(([k]) => k === key) ?? ORGS.find(([k]) => k === key);
  return entry ? (PEOPLE.includes(entry) ? entry[3] : entry[3]) : null;
};
const projectRows = [];
const authorRows = [];
for (const [key, title, short, summary, results, methodology, area, type, status, period, date, tags, photos, authors, favorites] of PROJECTS) {
  const id = project[key];
  const images = photos.map((name) => photo(name));
  projectRows.push(`('${id}', '${pid(authors[0])}', true, ${q(title)}, ${q(short)}, ${q(summary)}, ${arr(results)}, ${q(methodology)}, ${q(shortUni(authors[0]))}, ${q(area)}, ${q(type)}, ${q(status)}, '${date}', ${q(period)}, ${arr(tags)}, 'standard', ${q(images[0])}, ${arr(images)}, ${favorites}, timestamp '${date} 12:00')`);
  authors.forEach((author, position) => authorRows.push(`('${id}', '${pid(author)}', ${position})`));
}
emit(`insert into public.projects (id, created_by, is_sample, title, short_description, summary, key_results, methodology, institution, area, type, status, project_date, period, tags, visual_type, media_url, images, favorites_base, created_at) values
${projectRows.join(',\n')}
on conflict (id) do nothing;`);
emit(`insert into public.project_authors (project_id, profile_id, position) values
${authorRows.join(',\n')}
on conflict do nothing;`);

for (const [oldId, photos] of Object.entries(OLD_PROJECT_IMAGES)) {
  const images = photos.map((name) => photo(name));
  emit(`update public.projects set images = ${arr(images)}, media_url = ${q(images[0])}, visual_type = 'standard' where id = '${oldId}';`);
}

// Featured projects.
const FEATURED = { demo: 'demoVision', lucas: 'solar', camila: 'bees', pedro: 'agroBot', larissa: 'safeStreets', rodrigo: 'legisNlp', fernanda: 'screenReader',
  gustavo: 'ids', isabela: 'composite', thiago: 'localShop', amanda: 'triage', bruno: 'greenConcrete', leticia: 'finEdu', vinicius: 'plasmaSim',
  natalia: 'guanabara', diego: 'routing', carolina: 'speechCorpus', henrique: 'cubesat', marina: 'fairCredit', rafaelaC: 'prosthesis', joao: 'droneRice' };
for (const [who, what] of Object.entries(FEATURED)) {
  emit(`update public.profiles set featured_project_id = '${project[what]}' where id = '${person[who]}';`);
}

const eventRows = [];
for (const [key, title, category, status, starts, ends, location, city, organizer, modality, tags, short, about, cover, speakers, schedule, attendees] of EVENTS) {
  const speakerJson = speakers.map(([name, role, who], i) => ({ id: `s${i + 1}`, name, role, avatar: undefined, profileId: pid(who) }));
  // Speaker avatars come from the people list.
  for (const speaker of speakerJson) {
    const entry = PEOPLE.find(([k]) => pid(k) === speaker.profileId);
    speaker.avatar = entry ? portrait(entry[2][0], entry[2][1]) : undefined;
    delete speaker.profileId;
  }
  const scheduleJson = schedule.map(([time, itemTitle]) => ({ time, title: itemTitle }));
  eventRows.push(`('${event[key]}', true, ${q(title)}, ${q(category)}, ${q(status)}, (timestamp '${starts}' at time zone 'America/Sao_Paulo'), (timestamp '${ends}' at time zone 'America/Sao_Paulo'),
  ${q(location)}, ${q(city)}, ${q(organizer)}, ${q(modality)}, ${arr(tags)}, ${q(short)}, ${q(about)}, ${json(speakerJson)}, ${json(scheduleJson)}, ${attendees}, ${q(photo(cover))})`);
}
emit(`insert into public.events (id, is_sample, title, category, status, starts_at, ends_at, location, city, organizer, modality, tags, short_description, about_text, speakers, schedule, attendees_base, cover_url) values
${eventRows.join(',\n')}
on conflict (id) do nothing;`);

for (const [oldId, { cover, starts, ends }] of Object.entries(OLD_EVENT_COVERS)) {
  emit(`update public.events set cover_url = ${q(photo(cover))}, status = 'Inscrições abertas',
  starts_at = (timestamp '${starts}' at time zone 'America/Sao_Paulo'), ends_at = (timestamp '${ends}' at time zone 'America/Sao_Paulo') where id = '${oldId}';`);
}

const ref = (value, table) => {
  if (!value) return 'null';
  if (/^[0-9a-f-]{36}$/.test(value)) return `'${value}'`;
  return `'${table[value]}'`;
};

const postRows = [];
const commentRows = [];
for (const [key, author, category, hoursAgo, content, photos, relProject, relEvent, likes, comments] of POSTS) {
  const id = uuid(`post:${key}`);
  postRows.push(`('${id}', '${pid(author)}', true, ${q(category)}, ${q(content)}, ${ref(relProject, project)}, ${ref(relEvent, event)}, ${likes}, ${arr(photos.map((name) => photo(name)))}, now() - interval '${hoursAgo} hours')`);
  comments.forEach(([who, text], i) => {
    commentRows.push(`('${uuid(`comment:${key}:${i}`)}', '${id}', '${pid(who)}', ${q(text)}, now() - interval '${hoursAgo} hours' + interval '${(i + 1) * 17} minutes')`);
  });
}
emit(`insert into public.posts (id, author_id, is_sample, category, content, related_project_id, related_event_id, likes_base, images, created_at) values
${postRows.join(',\n')}
on conflict (id) do nothing;`);
emit(`insert into public.comments (id, post_id, author_id, text, created_at) values
${commentRows.join(',\n')}
on conflict (id) do nothing;`);

for (const [oldId, photos] of Object.entries(OLD_POST_IMAGES)) {
  emit(`update public.posts set images = ${arr(photos.map((name) => photo(name)))} where id = '${oldId}';`);
}

// Demo account: favourites, registrations and connections so the pages are not empty.
const DEMO_FAVORITES = ['solar', 'screenReader', 'guanabara', 'prosthesis', 'cubesat'];
const DEMO_EVENTS = ['hackRio', 'uxDay', 'startup'];
const DEMO_CONNECTIONS = ['fernanda', 'thiago', 'gabriel', 'larissa', 'natalia', 'lucas', 'marina'];
emit(`delete from public.project_favorites where profile_id = '${demoProfile}';
delete from public.event_registrations where profile_id = '${demoProfile}';
delete from public.connections where profile_id = '${demoProfile}';`);
for (const key of DEMO_FAVORITES) emit(`insert into public.project_favorites (project_id, profile_id) values ('${project[key]}', '${demoProfile}') on conflict do nothing;`);
for (const key of DEMO_EVENTS) emit(`insert into public.event_registrations (event_id, profile_id) values ('${event[key]}', '${demoProfile}') on conflict do nothing;`);
for (const key of DEMO_CONNECTIONS) emit(`insert into public.connections (profile_id, target_id) values ('${demoProfile}', '${pid(key)}') on conflict do nothing;`);

// The auth user. app_metadata.demo = true turns on the read-only policies (migration 20261111120100).
emit(`insert into public.profile_claims (profile_id, email) values ('${demoProfile}', '${DEMO_EMAIL}') on conflict (profile_id) do nothing;
update public.profiles set claimed = false, user_id = null where id = '${demoProfile}' and user_id is null;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current)
select '00000000-0000-0000-0000-000000000000', '${demoAuthId}', 'authenticated', 'authenticated', '${DEMO_EMAIL}',
  extensions.crypt('${DEMO_PASSWORD}', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"],"demo":true}'::jsonb, '{"name":"Júlia Andrade"}'::jsonb,
  now(), now(), '', '', '', '', ''
where not exists (select 1 from auth.users where email = '${DEMO_EMAIL}');

insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), '${demoAuthId}', '${demoAuthId}', 'email',
  jsonb_build_object('sub', '${demoAuthId}', 'email', '${DEMO_EMAIL}', 'email_verified', true), now(), now(), now()
where not exists (select 1 from auth.identities where user_id = '${demoAuthId}');

-- In case the claim did not fire (account created before the profile existed).
delete from public.profiles where user_id = '${demoAuthId}' and id <> '${demoProfile}';
update public.profiles set user_id = '${demoAuthId}', claimed = true, email_confirmed = true where id = '${demoProfile}';`);

emit('commit;');

const target = join(here, 'demo-seed.sql');
writeFileSync(target, out.join('\n'));
console.log(`Wrote ${target}: ${PEOPLE.length} people, ${ORGS.length} organisations, ${PROJECTS.length} projects, ${EVENTS.length} events, ${POSTS.length} posts.`);
