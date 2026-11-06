# Plano de implementação — Sistema de Ocorrências do Condomínio

> Base: [PRD do Sistema de Ocorrências](./prd/sistema-ocorrencias-condominio.md)  
> Status: implementação local concluída; validação integrada e publicação dependem de configuração externa do Supabase.  
> Escopo: primeira versão para um único condomínio, sem funcionalidades além das especificadas no PRD.

## 1. Objetivo e resultado esperado

Entregar um sistema web responsivo para que:

- O administrador autenticado gerencie os moradores.
- Moradores previamente cadastrados entrem informando apenas o e-mail, registrem ocorrências e acompanhem todas as ocorrências do condomínio.
- Moradores e administradores consultem detalhes e comentem ocorrências.
- Apenas administradores alterem status.
- Um morador possa excluir ocorrências atribuídas ao e-mail usado no portal, em qualquer status.
- Exclusões permanentes removam também os comentários e as fotos associados.

O resultado deve preservar todas as regras e os critérios de aceite do PRD. Busca textual, notificações, edição de ocorrências ou moradores, relatórios, exportação, recuperação de dados e gestão de categorias permanecem fora do escopo.

## 2. Estado atual e premissas de execução

- A aplicação e os fluxos do condomínio foram implementados nas rotas `src/app`, com domínio, autenticação e acesso a dados em `src/lib`.
- A stack existente é Next.js 16, React 19, TypeScript e Tailwind CSS 4.
- O Supabase, a validação de domínio e Vitest estão configurados; `npm test` executa os testes unitários de domínio/fotos.
- O PRD determina Supabase Auth para a equipe, Postgres para os dados e Storage para fotos.
- A [referência visual](./DESIGN.md) define a identidade visual; a [tela de referência](./screen.png) inspira o painel administrativo, sem trazer funcionalidades que o PRD excluiu.
- A migração e os scripts SQL estão em `/supabase`. Não há credenciais ou projeto Supabase configurados neste ambiente; portanto, a migração ainda não foi aplicada e os fluxos integrados contra serviços reais não foram executados.

## 3. Arquitetura proposta

### Aplicação

- Manter Next.js, React, TypeScript e Tailwind CSS existentes; organizar as rotas em experiências distintas de administração e morador.
- Separar componentes de apresentação, validação de domínio e acesso a dados; reutilizar formulários, estados de carregamento/erro/vazio, confirmação destrutiva e indicadores de status.
- Tratar entradas como não confiáveis e validar no servidor todos os campos, categorias, status, identificadores e metadados de arquivos — validação no navegador é apenas feedback.
- Preservar os filtros ao abrir e voltar do detalhe, preferencialmente codificando-os na navegação/URL para que o estado seja reproduzível.

### Supabase e fronteira de confiança

- Supabase Auth autentica administradores por e-mail e senha; uma tabela de perfil/membership identifica quais usuários autenticados pertencem à equipe.
- A entrada do morador por e-mail não comprova identidade e não produz, por si só, uma identidade `auth.users` verificável. Portanto, operações de morador passam por uma camada de servidor que valida uma sessão própria, assinada e sem expiração automática (cookie `HttpOnly`, `Secure` em produção e `SameSite=Lax`), sem confiar em e-mail enviado livremente em cada mutação.
- A sessão do morador continua deliberadamente baseada em um e-mail autodeclarado e não expira automaticamente, conforme decisão registrada no PRD; ela não deve ser apresentada como verificação de identidade.
- O portal limita tentativas de acesso a cinco por janela de 15 minutos, usando chave derivada por HMAC sem persistir o IP original.
- Se a camada de servidor precisar de credencial privilegiada do Supabase para executar operações de morador, essa credencial fica exclusivamente no servidor. Toda operação deve verificar sessão, papel, vínculo com o registro e entrada; nunca enviar a credencial ao navegador.
- Ativar RLS nas tabelas expostas e conceder somente os privilégios necessários. As políticas e a camada de servidor devem ser testadas em conjunto; não confiar apenas em filtros da interface.
- O bucket de fotos deve ser privado. A aplicação entrega a foto apenas a usuários autorizados, com URLs temporárias quando necessário; não publicar links permanentes ou o bucket.

## 4. Modelo de dados conceitual

O esquema final deve ser criado por migrações versionadas no repositório, com constraints no banco além das validações da aplicação.

| Entidade | Campos e regras principais |
|---|---|
| `admin_profiles` | `user_id` vinculado a `auth.users`, identificando a conta administrativa única. Não permitir que um usuário autenticado sem perfil acesse operações administrativas. |
| `residents` | UUID, nome completo, e-mail normalizado e único, torre, apartamento, telefone opcional e datas pertinentes. Torre e apartamento devem ser texto para preservar formatos como letras e zeros à esquerda. |
| `incidents` | UUID, morador autor, título, descrição, categoria fixa, local em texto livre, status, chave/path da foto opcional e data de criação/atualização. Status inicial `aberta`; lista em ordem decrescente de criação. |
| `comments` | UUID, ocorrência, texto não vazio, data/hora e autor. Representar autoria de morador ou administrador sem ambiguidade (por exemplo, referências separadas com constraint que exija exatamente um autor). Ordenação crescente por data/hora. |
| Storage de fotos | Um objeto por ocorrência, referenciado por path opaco no registro da ocorrência; não armazenar URL pública permanente. |

### Constraints, índices e exclusões

- Unicidade de e-mail de morador após normalização consistente (trim e comparação sem distinção entre maiúsculas/minúsculas); validar colisões antes de criar a constraint.
- Constraints para as categorias e status permitidos e para campos obrigatórios; não permitir comentário vazio após normalização.
- Chaves estrangeiras explícitas. A exclusão de um morador apaga suas ocorrências e os comentários associados; a exclusão de uma ocorrência apaga seus comentários. Indexar as colunas de relacionamento e as usadas pelos filtros/ordenação.
- A exclusão no Postgres e a remoção no Storage não formam uma única transação. A aplicação remove cada foto antes dos registros e informa falhas sem confirmar a exclusão; se a foto já tiver sido removida e a atualização do registro falhar, o registro é mantido e a falha é exibida. Não há serviço externo de retry/monitoramento configurado neste ambiente.
- Não guardar senha de administrador em tabelas da aplicação; credenciais são responsabilidade do Supabase Auth.

## 5. Fases e entregáveis

### Fase 0 — Decisões, fundação e preparação

**Objetivo:** eliminar ambiguidades de segurança e preparar a base sem antecipar funcionalidades fora do recorte.

1. Resolver as decisões da seção 10, com prioridade para o bootstrap do primeiro administrador, sessão do morador e política de fotos.
2. Documentar as variáveis e a configuração do Supabase sem incluir valores secretos no repositório. A criação/configuração do projeto Supabase permanece pendente neste ambiente.
3. Adicionar dependências e clientes Supabase adequados aos contextos de servidor e navegador, mantendo segredo privilegiado restrito ao servidor.
4. Definir migrações iniciais, constraints, índices, RLS/grants, bucket privado e estratégia de limpeza de fotos.
5. Criar tipos/validações compartilhadas para campos, enumerações, filtros e erros do domínio.
6. Configurar testes e checks mínimos adequados à stack existente; atualmente o projeto não tem scripts de teste ou lint declarados.
7. Criar layout base administrativo e de morador conforme `docs/DESIGN.md`; adaptar idioma para português, tipografia Manrope/Inter, espaçamento, cores semânticas, foco visível e comportamento responsivo.

**Pronto quando:** migrations aplicam em ambiente limpo; credenciais estão fora do controle de versão; políticas foram verificadas com papéis reais de teste; a aplicação compila; decisões bloqueadoras estão resolvidas.

### Fase 1 — Acesso administrativo e cadastro de moradores (Specs 01 e 02)

#### Spec 01 — Acesso inicial e equipe

1. Implementar entrada e saída administrativas via Supabase Auth.
2. Implementar bootstrap de primeiro acesso conforme decisão aprovada; manter o painel inacessível enquanto a configuração inicial não estiver concluída.
3. Proteger rotas e operações no servidor, verificando autenticação e membership administrativo — esconder controles no navegador não é controle de acesso.
4. Implementar formulários com estados de envio, validação, falha e confirmação; não confirmar sucesso antes da operação persistir.

#### Spec 02 — Moradores

1. Criar listagem e formulário administrativo para nome completo, e-mail, torre, apartamento e telefone opcional.
2. Impedir duplicidade de e-mail também no banco, inclusive concorrência entre cadastros simultâneos.
3. Implementar exclusão com aviso explícito de remoção permanente do cadastro, ocorrências, comentários e fotos; cancelar não altera dados.
4. Tratar falhas de persistência/limpeza sem sucesso falso e sem deixar exclusões parciais silenciosas.

**Critérios de saída:** credencial local inicial não abre o painel antes da troca de senha; conta sem perfil não acessa administração; telefone pode ficar vazio; duplicidade é rejeitada; cancelamento de exclusão preserva cadastro e registros.

### Fase 2 — Acesso do morador e criação de ocorrência (Spec 03)

1. Criar entrada do portal por e-mail previamente cadastrado e orientar o usuário quando o e-mail não estiver disponível, conforme o comportamento descrito no PRD.
2. Criar e validar a sessão de morador no servidor; limitar tentativas abusivas sem alegar que a sessão prova titularidade.
3. Implementar formulário de ocorrência com título, descrição, categoria fixa, local e uma foto opcional.
4. Validar campos obrigatórios, categoria, formato e tamanho do arquivo tanto no cliente quanto no servidor/Storage.
5. Criar ocorrência com status `aberta`; se houver foto, coordenar upload e gravação do registro para não deixar ocorrência incompleta nem retornar sucesso parcial.
6. Preservar dados não sensíveis do formulário em erros para permitir correção ou nova tentativa.

**Critérios de saída:** e-mail cadastrado entra sem senha ou confirmação; e-mail não cadastrado não entra; ocorrência válida sem foto é criada aberta; entradas inválidas não gravam; falha não produz sucesso falso nem perde os dados preenchidos.

### Fase 3 — Listagem, filtros e detalhes compartilhados (Spec 04)

1. Implementar lista acessível a moradores e administradores com todas as ocorrências e ordenação da mais recente para a mais antiga.
2. Implementar filtros opcionais por status e categoria; filtros simultâneos usam interseção e valores inválidos são rejeitados.
3. Implementar detalhe com título, descrição, categoria, local, status, data, foto quando existente, comentários e nome, unidade, e-mail e telefone do autor.
4. Preservar filtros ao voltar do detalhe; informar lista vazia e detalhe removido; apresentar erro recuperável em falha de consulta.
5. Aplicar a mesma autorização no acesso por URL direta e em cada carregamento, não apenas na navegação interna.

**Critérios de saída:** os dois perfis veem a lista compartilhada e os dados de autor previstos; ordenação e combinação de filtros corretas; estado vazio e indisponibilidade claros; foto ausente não impede consulta.

### Fase 4 — Comentários, atualização de status e exclusão de ocorrência (Specs 05, 06 e 07)

#### Spec 05 — Comentários

1. Permitir que morador e administrador enviem comentário não vazio no detalhe.
2. Registrar autoria e data/hora; exibir do mais antigo para o mais recente.
3. Em erro, manter texto para nova tentativa e não apresentar o comentário como persistido; rejeitar envio se a ocorrência tiver sido removida.
4. Não implementar edição, exclusão individual, anexos ou reações.

#### Spec 06 — Status

1. Permitir apenas a administradores selecionar `aberta`, `em andamento` ou `resolvida`.
2. Aceitar transição de qualquer status para qualquer outro, inclusive reabertura.
3. Atualizar lista, filtros e detalhe após confirmação persistida; em falha, continuar exibindo o status salvo.
4. Não acrescentar aprovação, atribuição, notificações ou histórico de transições, que estão fora do escopo.

#### Spec 07 — Exclusão pelo morador

1. Mostrar a ação somente quando o e-mail associado à sessão corresponder ao autor da ocorrência; repetir a checagem no servidor.
2. Exigir confirmação explícita, avisando que a exclusão é permanente e remove foto e comentários.
3. Permitir exclusão em qualquer status; negar a exclusão de registro associado a outro e-mail.
4. Tornar ocorrência indisponível para todos após exclusão confirmada e executar limpeza idempotente de comentários/objeto de Storage.
5. Cobrir concorrência com comentário, status ou exclusão simultânea e tratar ocorrência já removida como indisponível.

**Critérios de saída:** comentários de ambos os perfis funcionam com autoria/data e preservação do texto em falha; só administradores alteram status; morador exclui apenas ocorrência vinculada à sessão e em qualquer status; confirmação e cancelamento têm efeitos distintos; nenhuma falha é apresentada como sucesso.

### Fase 5 — Validação integrada e publicação

1. Executar a matriz de aceite do PRD em ambiente de teste com administrador, morador cadastrado e e-mail não cadastrado.
2. Testar políticas de acesso por papel e acesso direto a rotas/operações; verificar que anon/browser não consegue contornar regras pelo cliente Supabase.
3. Testar upload, leitura autorizada, falha de upload, falha de gravação e limpeza/repetição após exclusões.
4. Verificar UX em dispositivos móveis e desktop, acessibilidade básica (teclado, rótulos, foco e mensagens), estados vazio/carregando/erro e consistência com o guia visual.
5. Executar build de produção e os testes configurados; corrigir erros antes de publicar.
6. Configurar variáveis/segredos e serviços no ambiente de publicação, aplicar migrations de forma controlada e provisionar o primeiro administrador pelo fluxo aprovado.
7. Fazer smoke test pós-publicação sem usar credenciais de exemplo; confirmar que dados e fotos não estão publicamente acessíveis.

## 6. Matriz de autorização

| Operação | Visitante | Morador com sessão | Administrador |
|---|---:|---:|---:|
| Abrir painel administrativo | Não | Não | Sim |
| Provisionar a conta administrativa única | Fora do app | Não | Não |
| Cadastrar/excluir morador | Não | Não | Sim |
| Entrar no portal por e-mail cadastrado | — | Sim | Conforme fluxo definido |
| Criar ocorrência | Não | Sim | Não previsto no PRD |
| Consultar todas as ocorrências e dados de autor | Não | Sim | Sim |
| Filtrar e abrir detalhes | Não | Sim | Sim |
| Comentar ocorrência | Não | Sim | Sim |
| Alterar status | Não | Não | Sim |
| Excluir ocorrência | Não | Somente a associada ao e-mail da sessão | Não especificado; não adicionar sem decisão |

O servidor e o banco precisam aplicar essas regras em toda operação, inclusive em chamadas diretas. A implementação não deve inferir permissão de um campo `role` enviado pelo navegador.

## 7. Dados, privacidade e comportamento destrutivo

- Nome, unidade, e-mail e telefone do autor aparecem para todos os moradores, conforme decisão explícita do PRD. Não acrescentar contatos a outras telas além das necessárias ao produto.
- O login por e-mail não verificado possibilita impersonação, comentário em nome de terceiro e exclusão de ocorrências atribuídas ao e-mail informado. Essa limitação é aceita no recorte, mas deve constar na documentação operacional e ser reavaliada antes de ampliar o produto.
- Limitar coleta e exposição ao escopo; não registrar senha, credenciais, tokens, conteúdo de fotos ou dados pessoais desnecessários em logs.
- Exclusão de morador implica apagamento permanente de seus dados, ocorrências e comentários; exclusão de ocorrência apaga seus comentários e foto. Não criar lixeira, recuperação ou retenção funcional sem alterar o PRD.
- Como banco e Storage são serviços separados, as ações removem as fotos antes dos registros e informam falhas. Não há monitoramento automático de limpeza pendente implementado; configurar um mecanismo operacional de retry antes de usar em produção.

## 8. Estratégia de validação

### Testes unitários

- Normalização de e-mail, campos obrigatórios e telefone opcional (implementados em `src/lib/validation.test.ts`).
- Categorias e status aceitos; comentário contendo apenas espaços é inválido.
- Validação da assinatura dos formatos de imagem aprovados e do limite/tipos (implementados em `src/lib/validation.test.ts`).
- Autorização, filtros, ordenação e persistência dependem de validação integrada com Supabase e não são cobertos pelos testes unitários atuais.

### Testes de integração

- Migrations, constraints, RLS e operações com as sessões administrativa e de morador.
- Bootstrap local, troca de senha, login administrativo e provisionamento manual da conta de produção.
- Cadastro duplicado concorrente; cascatas de exclusão e comentários com autoria de ambos os perfis.
- Criação com e sem foto; falhas em upload, gravação e exclusões.
- Esses testes ainda dependem de projeto/credenciais Supabase e não foram executados.

### Testes ponta a ponta e aceite

- Percorrer os três fluxos principais do PRD.
- Verificar cada critério da seção 9 do PRD, incluindo ações negadas, dados preservados em falhas, filtros combinados, reabertura, exclusões em todos os status e cancelamento de confirmações.
- Validar listas sem dados, filtros sem resultados, foto ausente, ocorrência removida e tentativa de comentário/exclusão concorrente com remoção.
- Verificar layout responsivo e acessibilidade básica nos fluxos de entrada, formulário, lista, detalhe e confirmação destrutiva.

## 9. Definition of Done global

- Todos os sete specs e seus critérios de aceite estão implementados, ou qualquer exceção foi explicitamente aprovada e refletida no PRD.
- Não há cadastro público de equipe; somente administradores autorizados realizam ações administrativas.
- As regras de autorização são verificadas no servidor e no banco conforme a arquitetura definida; nenhum segredo privilegiado está no cliente ou versionado.
- Categorias, status, visibilidade e exclusões seguem o PRD; funcionalidades fora do escopo não foram acrescentadas.
- Fotos ficam privadas e a política de formato/tamanho está comunicada antes do envio.
- Erros de acesso, gravação, upload, comentário, atualização e exclusão são explícitos; dados não enviados são preservados quando previsto; não há mensagens de sucesso prematuras.
- Migrações e configuração de Storage estão versionadas/documentadas, build de produção passa e testes críticos estão automatizados.
- Interface segue o guia visual e funciona em telas móveis e desktop.
- Segredos de produção e o primeiro administrador foram configurados fora do código-fonte.

## 10. Decisões resolvidas e pendências externas

As decisões de produto e implementação desta seção foram resolvidas:

- Há uma única conta administrativa; em desenvolvimento, o bootstrap local cria `admin@example.com` com senha temporária `admin` e exige troca. Em produção, a conta é provisionada manualmente no Supabase Auth e vinculada por SQL, sem senha universal e sem confirmação de e-mail.
- A sessão de morador é um cookie próprio assinado, `HttpOnly`, sem expiração automática, com logout explícito e limite de cinco tentativas de acesso por 15 minutos. O e-mail continua autodeclarado e não comprova identidade.
- Um mesmo e-mail pode existir no cadastro de morador e na conta administrativa.
- Fotos aceitas são JPEG, PNG e WebP até 5 MB, em bucket privado.
- Falhas de remoção de foto impedem apagar o registro; falhas posteriores à remoção são informadas, mantendo o registro quando possível.

**Pendências exclusivamente de ambiente/validação:** configurar projeto e credenciais Supabase; aplicar a migração; provisionar a conta administrativa de produção; executar testes integrados e de aceite; revisar visualmente em navegador e publicar.

**Validação executada localmente:** `npm test` (7 testes aprovados), `npx tsc --noEmit`, `npm run build` e smoke test de `/admin/login` (HTTP 200). A tela de acesso foi conferida em desktop e viewport móvel. Não foram executados testes contra banco, RLS, Auth ou Storage reais.

## 11. Ordem resumida de execução

1. Decisões de produto e arquitetura da seção 10 foram fechadas.
2. Implementar migration, RLS/grants, Storage privado e testes unitários (concluído no código; aplicação/teste real pendente).
3. Implementar bootstrap/login da conta administrativa única (Spec 01).
4. Implementar cadastro e exclusão de moradores (Spec 02).
5. Implementar sessão do morador e criação de ocorrência com foto opcional (Spec 03).
6. Implementar lista, filtros e detalhe compartilhados (Spec 04).
7. Implementar comentários (Spec 05).
8. Implementar atualização de status pela equipe (Spec 06).
9. Implementar exclusão da ocorrência pelo morador e limpeza associada (Spec 07).
10. Rodar matriz de aceite, build, validações de segurança/acessibilidade e smoke test de publicação.
