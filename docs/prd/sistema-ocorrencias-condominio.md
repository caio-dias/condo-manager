# PRD — Sistema de Ocorrências do Condomínio

> Tipo: PRD inicial · Data: 2026-11-03
> **Status:** Aguardando validação integrada
>
> <!-- Valores: "Aguardando implementação" | "Aguardando validação integrada" | "Implementada". -->

## 1. Visão geral

Sistema web para centralizar ocorrências de um único condomínio. Moradores previamente cadastrados poderão informar problemas, acompanhar as ocorrências do condomínio, comentar e excluir as próprias solicitações. Administradores poderão consultar e acompanhar todas as ocorrências, atualizar seus status e cadastrar ou excluir moradores.

O projeto atual é apenas um ponto de partida sem funcionalidades de condomínio. Este PRD define o produto inicial, aproveitando a stack já presente e adicionando os serviços Supabase escolhidos para autenticação da equipe, banco de dados e armazenamento de fotos.

## 2. Problema que resolve

As ocorrências hoje ficam espalhadas em conversas de WhatsApp e contatos por telefone, podendo se perder e dificultando o acompanhamento e a manutenção de um histórico centralizado.

## 3. Público-alvo

- **Moradores cadastrados:** relatam problemas e acompanham as ocorrências do condomínio.
- **Administradores/funcionários autorizados:** organizam os cadastros de moradores, acompanham ocorrências, comentam e atualizam status.

O recorte atende um único condomínio. Todos os usuários da equipe têm o mesmo perfil de administrador e as mesmas permissões.

## 4. Objetivo do recorte atual

Oferecer um canal único para registrar e acompanhar ocorrências, com categoria, local, descrição, foto opcional, status e comentários, substituindo registros dispersos em WhatsApp e telefone.

## 5. Funcionalidades

**Essenciais:**

- Autenticação por e-mail e senha para administradores, sem cadastro público de equipe.
- Uma única conta de administrador nesta versão. Em desenvolvimento local, o primeiro acesso pode ser configurado com `admin@example.com` / `admin`, com troca obrigatória da senha; em produção, a conta é provisionada no Supabase com credenciais próprias, sem senha universal.
- Cadastro e exclusão de moradores pela equipe, com nome completo, e-mail, torre, apartamento e telefone opcional.
- Acesso do morador informando o e-mail previamente cadastrado, sem senha nem confirmação de titularidade.
- Criação de ocorrência pelo morador, com título, descrição, categoria, local em texto livre e uma foto opcional.
- Lista e detalhes de todas as ocorrências visíveis tanto aos moradores quanto aos administradores, com filtros por status e categoria.
- Comentários de moradores e administradores nas ocorrências.
- Alteração do status pela equipe entre aberta, em andamento e resolvida.
- Exclusão permanente, pelo morador, de qualquer ocorrência atribuída ao e-mail informado, em qualquer status.
- Exibição, para todos os moradores, do nome, unidade, e-mail e telefone do autor junto à ocorrência.

**Desejáveis:**

- Não há funcionalidades adicionais desejáveis neste recorte.

## 6. Fora do escopo

- Atendimento a múltiplos condomínios.
- Confirmação de identidade do morador por senha, link ou código enviado por e-mail.
- Cadastro, edição ou recuperação de dados pelo próprio morador.
- Edição de ocorrências depois de criadas.
- Gestão das categorias pela equipe; a lista inicial é fixa.
- Notificações por e-mail, push, WhatsApp ou SMS.
- Relatórios analíticos, exportação, busca textual ou painel de indicadores.
- Exclusão ou edição individual de comentários.
- Recuperação de ocorrências, moradores ou comentários excluídos.
- Diferentes níveis de permissão para funcionários.
- Criação ou convite de contas administrativas adicionais.

## 7. Regras de negócio

### Decisões confirmadas

- O sistema atende um condomínio.
- Moradores precisam estar previamente cadastrados por um administrador.
- O e-mail é o único dado informado para entrar no portal de moradores; não há verificação de titularidade.
- Moradores podem ver todas as ocorrências e seus dados de autor, incluindo e-mail e telefone.
- Categorias iniciais: manutenção/infraestrutura, limpeza, ruído/convivência, segurança, áreas comuns e outro.
- O local da ocorrência é texto livre.
- O telefone do morador é opcional; nome completo, e-mail, torre e apartamento são obrigatórios.
- Moradores podem comentar e excluir ocorrências atribuídas ao e-mail informado, mesmo quando resolvidas.
- Há exatamente uma conta administrativa nesta versão; ela pode consultar, comentar, mudar status, cadastrar e excluir moradores.
- Excluir um morador também exclui suas ocorrências e comentários associados.
- Em desenvolvimento local, o bootstrap pode criar `admin@example.com` com a senha temporária `admin`; a senha precisa ser substituída antes de abrir o painel. Em produção, a única conta é provisionada manualmente no Supabase com e-mail e senha próprios, sem confirmação de e-mail e sem senha padrão.
- Não há criação de contas administrativas adicionais nesta versão. O mesmo e-mail pode existir no cadastro de morador e na conta administrativa, pois os portais e as sessões são separados.
- A sessão do morador não expira automaticamente; o morador pode encerrá-la saindo do portal. Tentativas de acesso ao portal são limitadas a cinco por janela de 15 minutos por endereço de origem.
- Fotos aceitas: JPEG, PNG ou WebP, até 5 MB por imagem. O bucket é privado.
- Ao excluir ocorrência ou morador, a foto associada precisa ser removida antes da exclusão do registro. Se a remoção da foto falhar, o registro é mantido. Se a foto for removida e a atualização/exclusão no banco falhar, o registro é mantido sem foto quando possível e o sistema informa a falha.

### Limitações aceitas

- O e-mail não confirmado não comprova a identidade do morador. Quem informar o e-mail cadastrado de outra pessoa poderá se passar por ela, comentar em seu nome e excluir ocorrências atribuídas àquele endereço.
- Como todas as ocorrências e os dados de contato do autor são visíveis a todos os moradores, e-mail e telefone poderão ser vistos por pessoas que não são seus titulares. Esse risco de privacidade foi explicitamente aceito para este recorte.
- A senha temporária `admin` só existe no bootstrap local de desenvolvimento e deve ser substituída antes de abrir o painel. Não existe senha universal nem bootstrap administrativo em produção.

### Regras de implementação confirmadas

- A ocorrência começa no status **aberta**; administradores podem selecionar qualquer um dos três status a qualquer momento, inclusive reabrir uma ocorrência resolvida.
- A exclusão de uma ocorrência remove permanentemente sua foto e seus comentários. A exclusão de um morador remove seus dados pessoais e os registros associados, sem possibilidade de restauração.
- A lista de ocorrências é apresentada da mais recente para a mais antiga; quando mais de um filtro for usado, todos devem ser aplicados em conjunto.
- Uma ocorrência aceita no máximo uma foto. Formatos e limite definidos: JPEG, PNG ou WebP, até 5 MB; a interface informa essas condições antes do envio.

## 8. Fluxos principais

### Fluxo 1 — Acesso do administrador

1. Em desenvolvimento local, o responsável habilita explicitamente o bootstrap e prepara a conta `admin@example.com` com a senha temporária `admin`.
2. O sistema exige a troca da senha antes de liberar o painel.
3. Em produção, a conta única é criada diretamente no Supabase Auth com credenciais próprias e vinculada ao perfil administrativo por script SQL.
4. Não há cadastro público nem criação de contas administrativas adicionais.

### Fluxo 2 — Cadastro e acesso do morador

1. Um administrador cadastra o morador com nome completo, e-mail, torre, apartamento e telefone opcional.
2. O morador informa no portal o e-mail cadastrado.
3. Se o e-mail existir, o sistema permite o acesso sem enviar código ou link de confirmação.
4. Se não existir, o sistema informa que o acesso não está disponível e orienta o morador a procurar a administração.

### Fluxo 3 — Registrar e acompanhar uma ocorrência

1. O morador acessa o portal com o e-mail previamente cadastrado.
2. Preenche título, descrição, categoria e local; pode anexar uma foto.
3. O sistema registra a ocorrência como aberta e a exibe na lista do condomínio.
4. Moradores e administradores podem filtrar a lista por status e categoria, abrir os detalhes e consultar os comentários.
5. Moradores e administradores adicionam comentários; administradores também atualizam o status.
6. O morador pode excluir uma ocorrência atribuída ao e-mail usado no portal, mesmo se ela já estiver resolvida.

## 9. Critérios de aceite

- A conta local temporária não consegue abrir o painel antes de substituir a senha.
- Em produção, somente a conta administrativa provisionada pode abrir o painel; não há cadastro público nem criação de contas administrativas adicionais.
- Um administrador consegue cadastrar um morador com os campos obrigatórios e deixar telefone em branco.
- Um e-mail já cadastrado não pode ser usado para criar um segundo cadastro de morador.
- Um morador com e-mail cadastrado entra sem senha ou confirmação; um e-mail não cadastrado não recebe acesso.
- Uma ocorrência válida é criada com status aberta, mesmo sem foto.
- Uma ocorrência inválida não é gravada; os campos que precisam de correção são indicados e o conteúdo preenchido é preservado.
- Moradores e administradores conseguem listar, filtrar por status e categoria e abrir qualquer ocorrência.
- O detalhe da ocorrência exibe os dados do autor escolhidos para este recorte, inclusive e-mail e telefone.
- Moradores e administradores conseguem adicionar comentários não vazios a uma ocorrência.
- Apenas administradores conseguem mudar status; moradores não conseguem mudar o status de ocorrências.
- Um morador consegue excluir uma ocorrência atribuída ao e-mail informado em qualquer status; não consegue excluir uma ocorrência atribuída a outro e-mail.
- A exclusão de uma ocorrência remove seus comentários e sua foto; a exclusão de um morador remove as ocorrências e comentários associados.
- Em falhas de acesso, gravação, comentário, atualização ou exclusão, o sistema informa que a operação não foi concluída e preserva os dados ainda não enviados quando aplicável.

## 10. Stack

- **Aplicação web:** Next.js 16, React 19, TypeScript e Tailwind CSS 4, já presentes no projeto.
- **Serviços de backend:** Supabase para autenticação da equipe, banco de dados e armazenamento de fotos.

**Referências de UI e layout:**

- [Guia de design](../DESIGN.md) é a referência visual principal para identidade, cores, tipografia, espaçamento, componentes e comportamento responsivo.
- [Tela de referência](../screen.png) inspira o layout do dashboard administrativo de ocorrências: navegação lateral, área de conteúdo, filtros e listagem em tabela.
- A imagem é uma referência visual, não uma exigência de reproduzir todas as informações ou ações nela. Indicadores, busca textual, configurações e outros itens que aparecem na tela continuam fora do escopo, salvo se forem incluídos explicitamente nas funcionalidades deste PRD.

## 11. Justificativa da stack

O projeto já está iniciado com Next.js, React, TypeScript e Tailwind CSS, então manter essa base evita uma troca de tecnologia sem necessidade. O Supabase foi escolhido para reunir autenticação administrativa, persistência de dados e armazenamento das fotos em um serviço, sem introduzir uma API ou infraestrutura separada neste recorte.

## 12. Fases de construção

### Fase 1 — Acesso e cadastros

Objetivo: permitir que a conta administrativa acesse o painel e prepare os cadastros de moradores necessários ao portal.

Specs:

- Spec 01 — Acesso administrativo
- Spec 02 — Cadastro e exclusão de moradores

### Fase 2 — Registro e consulta de ocorrências

Objetivo: habilitar o registro de ocorrências e a consulta compartilhada pelos moradores e administradores.

Specs:

- Spec 03 — Acesso do morador e criação de ocorrência
- Spec 04 — Listagem, filtros e detalhes de ocorrência

### Fase 3 — Acompanhamento e encerramento

Objetivo: permitir a conversa sobre uma ocorrência, a atualização de seu andamento e sua remoção quando solicitada pelo autor.

Specs:

- Spec 05 — Comentários em ocorrências
- Spec 06 — Atualização de status pela equipe
- Spec 07 — Exclusão de ocorrência pelo morador

## 13. Specs funcionais detalhadas

### Spec 01 — Acesso administrativo

- **Fase:** Fase 1 — Acesso e cadastros
- **Objetivo (o quê):** Permitir o acesso restrito ao painel por uma única conta administrativa.
- **Intenção (por quê):** A equipe precisa de um espaço de trabalho que não seja acessível pelo portal de moradores e que concentre as ações administrativas do condomínio.
- **Contexto:** O projeto atual é um ponto de partida sem autenticação ou funcionalidades de condomínio. O acesso administrativo usa Supabase Auth com e-mail e senha. Todos os usuários da equipe têm as mesmas permissões.
- **Atores:** Responsável pela configuração inicial; administrador autenticado; pessoa tentando acessar sem conta autorizada.
- **Descrição do comportamento:** Em desenvolvimento local, o bootstrap explicitamente habilitado cria `admin@example.com` com senha temporária `admin`; a troca da senha é exigida antes de abrir o painel. Em produção, a única conta é provisionada no Supabase Auth com e-mail e senha próprios e vinculada ao perfil administrativo por script SQL. A confirmação de e-mail não é exigida. Não há cadastro público nem criação de contas administrativas adicionais.
- **Entradas e saídas:** Entram e-mail e senha do administrador. O sistema produz uma sessão administrativa ou uma mensagem de erro explícita.
- **Dados/entidades envolvidos (conceitual):** Conta administrativa: identificador de acesso, e-mail, credencial de autenticação e situação de acesso.
- **Estados e transições:** Conta local ainda não preparada → bootstrap local habilitado → senha temporária trocada → acesso administrativo ativo. Em produção, conta provisionada no Supabase → perfil administrativo vinculado → acesso administrativo ativo.
- **Regras de negócio:** O bootstrap local só funciona em desenvolvimento quando habilitado por variável de ambiente e nunca libera o painel antes da troca de senha. Produção não usa senha padrão. Há exatamente um perfil administrativo e não há cadastro público.
- **Validações:** Credenciais são obrigatórias; e-mail precisa ter formato válido; a senha própria deve cumprir a política informada pelo sistema; o perfil administrativo é único.
- **Fluxo do usuário (passo a passo):**
  1. Em desenvolvimento, o responsável habilita o bootstrap e prepara a conta temporária.
  2. Informa e confirma uma senha própria.
  3. O sistema grava a nova credencial antes de liberar o painel.
  4. Em produção, o responsável provisiona a conta no Supabase Auth e executa o script que vincula o perfil.
- **Casos de borda e erros:** Credencial incorreta não cria sessão; e-mail ou senha inválidos são indicados sem sucesso falso; falha ao salvar a senha ou vincular o perfil impede o acesso; não existe recuperação por cadastro público.
- **Impacto no existente:** Acrescenta autenticação administrativa ao projeto inicial e substitui o acesso público da página inicial por uma área protegida e um ponto de entrada para moradores.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado que o bootstrap local ainda não foi concluído, quando ele é habilitado em desenvolvimento, então cria somente a conta temporária `admin@example.com` e exige troca de senha.
  - Dado que a senha inicial ainda não foi substituída, quando alguém tenta abrir o painel, então o painel não é exibido.
  - Dado o perfil administrativo provisionado em produção, quando o usuário informa credenciais válidas, então acessa o painel sem confirmação de e-mail.
  - Dado um visitante sem a conta administrativa, quando tenta abrir o painel, então o sistema nega o acesso e não oferece cadastro público.
- **Definição de pronto:** O bootstrap local exige troca de senha; a conta de produção é provisionada sem senha universal; somente o perfil administrativo único acessa o painel; erros não são apresentados como sucesso.
- **Dependências:** Nenhuma.
- **Fora do escopo desta spec:** Perfis de permissão distintos, convite por e-mail, recuperação de senha por autoatendimento e autenticação de moradores.

### Spec 02 — Cadastro e exclusão de moradores

- **Fase:** Fase 1 — Acesso e cadastros
- **Objetivo (o quê):** Permitir que administradores criem e excluam os cadastros que habilitam moradores a usar o portal.
- **Intenção (por quê):** Como não há cadastro público de moradores, a equipe precisa registrar previamente quem está autorizado a entrar pelo e-mail cadastrado.
- **Contexto:** Reutiliza o acesso administrativo da Spec 01. O morador não cria nem edita o próprio cadastro. A exclusão do cadastro também apaga ocorrências e comentários associados.
- **Atores:** Administrador autenticado.
- **Descrição do comportamento:** O administrador cadastra o nome completo, e-mail, torre e apartamento do morador; o telefone pode ser deixado em branco. O cadastro passa a permitir a entrada no portal pelo e-mail informado. O administrador pode excluir um cadastro. Antes da exclusão, o sistema informa que os registros associados também serão removidos e pede confirmação. Após a confirmação, remove os dados pessoais, ocorrências e comentários associados, sem opção de recuperação.
- **Entradas e saídas:** Entram nome completo, e-mail, torre, apartamento e, opcionalmente, telefone. A saída é a confirmação de cadastro ou exclusão; em erro, o sistema informa que a operação não foi concluída.
- **Dados/entidades envolvidos (conceitual):** Morador: nome completo, endereço de e-mail, torre, apartamento e telefone opcional; ocorrências e comentários associados ao morador.
- **Estados e transições:** Cadastro inexistente → cadastrado e apto a acessar o portal → excluído junto aos registros associados.
- **Regras de negócio:** Apenas administradores podem criar ou excluir moradores. O e-mail deve ser único. Não há edição de cadastro nesta versão. Excluir o morador também exclui suas ocorrências e comentários associados permanentemente.
- **Validações:** Nome, e-mail, torre e apartamento são obrigatórios; telefone é opcional; e-mail precisa ter formato válido e não pode pertencer a outro morador.
- **Fluxo do usuário (passo a passo):**
  1. O administrador abre a área de moradores.
  2. Preenche os dados obrigatórios e, se disponível, o telefone.
  3. O sistema valida os campos e confirma o cadastro.
  4. Para excluir, o administrador escolhe o cadastro, lê o aviso sobre a remoção associada e confirma.
- **Casos de borda e erros:** E-mail duplicado ou inválido impede o cadastro; campo obrigatório vazio é identificado; cancelar a confirmação não exclui nada; falha ao excluir não pode apagar apenas parte dos dados e ainda informar sucesso; cadastro inexistente apresenta erro explícito.
- **Impacto no existente:** Acrescenta o cadastro de moradores e fornece os registros que o portal usa para reconhecer um e-mail. Não há cadastro de moradores no ponto de partida.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um administrador autenticado, quando informa nome, e-mail, torre e apartamento válidos, então o morador é cadastrado mesmo que telefone esteja vazio.
  - Dado que um e-mail já pertence a um morador, quando o administrador tenta reutilizá-lo, então o sistema impede a duplicidade.
  - Dado um morador com ocorrências e comentários associados, quando o administrador confirma a exclusão, então o cadastro e os registros associados são removidos permanentemente.
  - Dado que o administrador cancela o aviso de exclusão, quando retorna à lista, então o cadastro continua disponível.
- **Definição de pronto:** Administradores conseguem cadastrar e excluir moradores respeitando campos obrigatórios, e a exclusão confirmada remove os registros associados sem oferecer recuperação.
- **Dependências:** Spec 01 — requer uma sessão administrativa para restringir o gerenciamento de cadastros.
- **Fora do escopo desta spec:** Edição de moradores, autoatendimento, importação em lote e recuperação de dados excluídos.

### Spec 03 — Acesso do morador e criação de ocorrência

- **Fase:** Fase 2 — Registro e consulta de ocorrências
- **Objetivo (o quê):** Permitir que um morador cadastrado entre pelo e-mail e registre uma ocorrência com as informações necessárias para entendimento e encaminhamento.
- **Intenção (por quê):** Substituir relatos dispersos por um registro centralizado, categorizado e acompanhado desde sua abertura.
- **Contexto:** Usa os cadastros da Spec 02. O acesso é deliberadamente sem senha, link ou código de confirmação; portanto, o e-mail informado identifica um cadastro, mas não comprova que a pessoa seja sua titular.
- **Atores:** Morador cadastrado; pessoa que informa um e-mail não cadastrado.
- **Descrição do comportamento:** O morador informa seu e-mail. Se houver cadastro correspondente, entra no portal sem etapa de confirmação; caso contrário, não entra e recebe orientação para procurar a administração. No portal, pode abrir uma ocorrência preenchendo título, descrição, categoria, local em texto livre e, opcionalmente, uma foto. Ao salvar com sucesso, a ocorrência começa como aberta e fica disponível para consulta conforme a Spec 04.
- **Entradas e saídas:** E-mail previamente cadastrado; título e descrição; uma categoria da lista fixa; local em texto livre; uma imagem opcional. A saída é o registro da ocorrência e sua confirmação, ou uma mensagem de validação/erro.
- **Dados/entidades envolvidos (conceitual):** Ocorrência: título, descrição, categoria, local, foto opcional, data de criação, autor e status.
- **Estados e transições:** Formulário vazio → preenchido → validado → ocorrência aberta. Uma tentativa inválida ou falha de gravação mantém o usuário no formulário sem criar uma ocorrência parcial.
- **Regras de negócio:** Título, descrição, categoria e local são obrigatórios; foto é opcional; a lista de categorias é fixa; o status inicial é aberta. O autor fica associado ao cadastro correspondente ao e-mail informado, sem prova de titularidade.
- **Validações:** Texto obrigatório não pode estar vazio; categoria deve pertencer à lista; o anexo deve ser uma imagem aceita e respeitar o limite que o produto informar antes do envio.
- **Fluxo do usuário (passo a passo):**
  1. O morador informa o e-mail cadastrado.
  2. O sistema permite acesso apenas se localizar esse e-mail.
  3. O morador escolhe criar ocorrência e preenche título, descrição, categoria e local.
  4. Opcionalmente, anexa uma foto e envia.
  5. O sistema confirma a criação e apresenta a ocorrência como aberta.
- **Casos de borda e erros:** E-mail não cadastrado não recebe acesso; campos obrigatórios inválidos são apontados; formato ou tamanho de imagem não aceito gera orientação para corrigir o anexo; falha de armazenamento ou gravação não cria ocorrência incompleta e preserva os dados já preenchidos; falha de acesso é informada sem revelar dados de outro morador.
- **Impacto no existente:** Acrescenta acesso de moradores e registro de ocorrências, inexistentes no projeto atual.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um e-mail cadastrado, quando o morador o informa, então entra no portal sem senha ou confirmação.
  - Dado um e-mail que não está cadastrado, quando alguém tenta entrar, então o acesso é negado e é exibida orientação para procurar a administração.
  - Dado um formulário válido sem foto, quando o morador envia, então é criada uma ocorrência com status aberta.
  - Dado um formulário com campo obrigatório inválido, quando o morador envia, então a ocorrência não é gravada e o sistema indica o que corrigir.
  - Dado que a gravação falha, quando o sistema informa o erro, então não exibe uma confirmação de criação.
- **Definição de pronto:** O e-mail cadastrado permite entrada sem confirmação; e-mails desconhecidos são barrados; uma ocorrência válida é criada com status inicial aberto; falhas e validações são explícitas.
- **Dependências:** Spec 02 — requer um cadastro de morador para associar a ocorrência ao e-mail informado.
- **Fora do escopo desta spec:** Confirmação de identidade, edição posterior de ocorrência, múltiplas fotos, notificações e categorias configuráveis.

### Spec 04 — Listagem, filtros e detalhes de ocorrência

- **Fase:** Fase 2 — Registro e consulta de ocorrências
- **Objetivo (o quê):** Oferecer a moradores e administradores uma visão compartilhada das ocorrências, com filtros e detalhes suficientes para acompanhar cada caso.
- **Intenção (por quê):** Tornar visível o histórico que hoje fica disperso e permitir que moradores acompanhem o andamento sem depender de conversas individuais.
- **Contexto:** Moradores entram conforme a Spec 03; administradores entram conforme a Spec 01. A lista inclui ocorrências de todo o condomínio. O nome, unidade, e-mail e telefone do autor são visíveis aos moradores junto à ocorrência por decisão confirmada.
- **Atores:** Morador com acesso ao portal; administrador autenticado.
- **Descrição do comportamento:** O sistema apresenta ocorrências da mais recente para a mais antiga. Usuários podem filtrar por status e categoria, isoladamente ou em conjunto; os resultados devem atender a todos os filtros ativos. Cada item permite abrir detalhes com título, descrição, categoria, local, status, data, foto quando houver, comentários e os dados de autor definidos para este recorte. Quando não houver resultados, o sistema explica que nenhum registro corresponde aos filtros.
- **Entradas e saídas:** Entram os filtros opcionais de status e categoria e a identificação da ocorrência aberta. Saem a lista correspondente, mensagem de lista vazia ou detalhes completos.
- **Dados/entidades envolvidos (conceitual):** Ocorrência e seus dados de autor, status, categoria, foto e comentários associados.
- **Estados e transições:** Lista sem filtros → lista filtrada → detalhe da ocorrência → retorno à lista mantendo os filtros da sessão de navegação.
- **Regras de negócio:** Moradores veem todas as ocorrências e os dados de autor, incluindo contato; administradores veem todas as ocorrências. Filtros combinados usam interseção. A consulta não permite editar a ocorrência.
- **Validações:** Filtros só aceitam status e categoria disponíveis; ocorrência inexistente ou indisponível gera mensagem clara, não uma tela vazia que pareça válida.
- **Fluxo do usuário (passo a passo):**
  1. O usuário autorizado abre a lista.
  2. Seleciona status e/ou categoria, se desejar.
  3. Consulta os resultados ou a mensagem de lista vazia.
  4. Abre uma ocorrência para ver os detalhes e comentários.
  5. Retorna à lista sem perder os filtros selecionados.
- **Casos de borda e erros:** Não haver ocorrências ou nenhum resultado de filtro apresenta estado vazio; filtro inválido é rejeitado; falha ao carregar lista ou detalhe apresenta erro recuperável; foto ausente não impede a leitura dos demais detalhes.
- **Impacto no existente:** Substitui a página inicial genérica por experiências de consulta de moradores e equipe.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado que existem ocorrências, quando um morador ou administrador abre a lista, então vê ocorrências de todo o condomínio em ordem da mais recente para a mais antiga.
  - Dado que status e categoria estão selecionados, quando a lista é filtrada, então cada resultado corresponde aos dois critérios.
  - Dado que uma ocorrência tem autor cadastrado, quando um morador abre sua lista ou detalhes, então vê nome, unidade, e-mail e telefone do autor.
  - Dado que nenhum item corresponde aos filtros, quando a consulta termina, então o sistema mostra uma mensagem de lista vazia.
  - Dado que uma ocorrência foi excluída, quando alguém tenta abrir seu detalhe, então o sistema informa que ela não está mais disponível.
- **Definição de pronto:** Moradores e administradores consultam a mesma lista, filtram por status/categoria e abrem detalhes completos com estados vazios e erros explícitos.
- **Dependências:** Spec 01 e Spec 03 — requer acesso administrativo e ocorrências registradas.
- **Fora do escopo desta spec:** Busca textual, paginação definida por usuário, exportação, indicadores e ocultação de dados pessoais do autor.

### Spec 05 — Comentários em ocorrências

- **Fase:** Fase 3 — Acompanhamento e encerramento
- **Objetivo (o quê):** Permitir que moradores e administradores adicionem comentários aos detalhes de uma ocorrência.
- **Intenção (por quê):** Manter perguntas e atualizações no mesmo histórico do problema, reduzindo informações espalhadas em conversas externas.
- **Contexto:** Os comentários aparecem no detalhe da Spec 04. Moradores podem comentar qualquer ocorrência visível; administradores também podem comentar.
- **Atores:** Morador com acesso ao portal; administrador autenticado.
- **Descrição do comportamento:** O usuário escreve um comentário não vazio e o envia. Em sucesso, o comentário aparece associado à ocorrência, identificado pelo nome do autor e pela data/hora. Os comentários são exibidos do mais antigo para o mais recente. Não é possível editar ou excluir um comentário individual nesta versão.
- **Entradas e saídas:** Texto do comentário e identificação da ocorrência; a saída é o comentário gravado e exibido ou uma mensagem explícita de validação/erro.
- **Dados/entidades envolvidos (conceitual):** Comentário: texto, autor, data/hora e ocorrência associada.
- **Estados e transições:** Comentário em edição → enviado → registrado e exibido. Falha de envio mantém o texto disponível para nova tentativa.
- **Regras de negócio:** Moradores e administradores podem comentar ocorrências existentes. Comentários vazios não são aceitos. A exclusão da ocorrência ou do morador pode remover comentários associados conforme as regras das Specs 02 e 07.
- **Validações:** Texto precisa conter conteúdo não vazio; ocorrência precisa continuar disponível no momento do envio.
- **Fluxo do usuário (passo a passo):**
  1. O usuário abre os detalhes de uma ocorrência.
  2. Escreve um comentário.
  3. Envia o comentário.
  4. O sistema confirma e o exibe no histórico ou informa o erro e mantém o texto para nova tentativa.
- **Casos de borda e erros:** Texto vazio é rejeitado; ocorrência excluída antes do envio não recebe comentário; falha de gravação não limpa o comentário nem mostra sucesso; ausência de comentários exibe um estado vazio informativo.
- **Impacto no existente:** Acrescenta conversa persistente às ocorrências, inexistente no projeto inicial.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um morador ou administrador em uma ocorrência disponível, quando envia texto não vazio, então o comentário aparece associado a ela com autor e data/hora.
  - Dado um campo de comentário vazio, quando o usuário tenta enviar, então o sistema não grava o comentário e informa a validação.
  - Dado que a ocorrência foi removida antes do envio, quando o usuário envia, então o sistema informa que não foi possível comentar.
  - Dado que ocorre uma falha ao salvar, quando o sistema apresenta o erro, então o texto permanece disponível e não aparece como comentário confirmado.
- **Definição de pronto:** Ambos os perfis conseguem comentar; comentários têm autoria e data; envio inválido ou com falha não produz sucesso falso.
- **Dependências:** Spec 04 — requer a consulta e abertura do detalhe da ocorrência.
- **Fora do escopo desta spec:** Edição/exclusão individual de comentários, anexos em comentários, reações e notificações.

### Spec 06 — Atualização de status pela equipe

- **Fase:** Fase 3 — Acompanhamento e encerramento
- **Objetivo (o quê):** Permitir que administradores atualizem o status de uma ocorrência entre aberta, em andamento e resolvida.
- **Intenção (por quê):** Dar à equipe um modo simples de comunicar que a solicitação foi recebida, está sendo tratada ou foi concluída.
- **Contexto:** O status aparece na lista e nos detalhes da Spec 04. A equipe tem um único perfil administrativo; moradores não alteram status.
- **Atores:** Administrador autenticado; morador que consulta o andamento.
- **Descrição do comportamento:** No detalhe de uma ocorrência, o administrador seleciona um dos três status. Em sucesso, o sistema atualiza o status e o apresenta imediatamente na lista, nos filtros e no detalhe. A equipe pode selecionar qualquer status, inclusive retornar uma ocorrência resolvida para aberta. Moradores podem ver a alteração, mas não controlar o campo.
- **Entradas e saídas:** Identificação da ocorrência e novo status; a saída é o status atualizado, ou uma mensagem de erro sem alteração aparente.
- **Dados/entidades envolvidos (conceitual):** Ocorrência: status atual e momento da última atualização de status.
- **Estados e transições:** Aberta ↔ em andamento ↔ resolvida; qualquer um dos três status pode ser selecionado a partir de qualquer outro por um administrador.
- **Regras de negócio:** Apenas administradores alteram status. Valores permitidos: aberta, em andamento e resolvida. Ocorrências novas começam abertas. Alterar status não apaga comentários nem dados da ocorrência.
- **Validações:** Ocorrência precisa existir; novo status deve pertencer à lista; o usuário deve estar autenticado como administrador.
- **Fluxo do usuário (passo a passo):**
  1. O administrador abre o detalhe da ocorrência.
  2. Seleciona o novo status.
  3. Confirma a alteração.
  4. O sistema atualiza o status e o apresenta nas consultas subsequentes.
- **Casos de borda e erros:** Morador tentando alterar status recebe acesso negado; ocorrência excluída não é atualizada; status inválido é rejeitado; falha ao salvar mantém o status anterior e exibe erro.
- **Impacto no existente:** Acrescenta acompanhamento de status, que não existe no ponto de partida.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um administrador em uma ocorrência aberta, quando escolhe em andamento, então o novo status aparece no detalhe e nas listas.
  - Dado uma ocorrência resolvida, quando um administrador a altera para aberta, então o sistema permite a reabertura.
  - Dado um morador consultando uma ocorrência, quando tenta alterar seu status, então a ação não é permitida.
  - Dado uma falha na atualização, quando o sistema informa o erro, então o status previamente salvo continua sendo exibido.
- **Definição de pronto:** Administradores conseguem atualizar qualquer ocorrência entre os três status; moradores não conseguem; filtros e detalhes refletem a última alteração confirmada.
- **Dependências:** Spec 04 — requer uma ocorrência disponível em seus detalhes.
- **Fora do escopo desta spec:** Fluxos de aprovação, atribuição a funcionários, prazos, histórico completo de alterações e notificações de mudança.

### Spec 07 — Exclusão de ocorrência pelo morador

- **Fase:** Fase 3 — Acompanhamento e encerramento
- **Objetivo (o quê):** Permitir que um morador exclua permanentemente uma ocorrência atribuída ao e-mail usado para entrar no portal.
- **Intenção (por quê):** Atender à decisão de permitir que o morador remova suas próprias solicitações, inclusive quando não são mais necessárias.
- **Contexto:** A autoria é associada ao e-mail informado, mas não confirmada por senha, link ou código. Portanto, essa regra não comprova a titularidade do e-mail; essa limitação foi aceita neste recorte.
- **Atores:** Morador com acesso ao portal; outro morador que consulta a ocorrência; administrador que consulta a lista.
- **Descrição do comportamento:** O morador solicita exclusão de uma ocorrência associada ao e-mail informado no acesso. O sistema apresenta uma confirmação que explica que a operação é permanente e remove a ocorrência, sua foto e comentários associados após a confirmação. A exclusão é permitida em qualquer status. A ocorrência deixa de aparecer para todos os usuários.
- **Entradas e saídas:** Identificação da ocorrência, e-mail associado à sessão do portal e confirmação explícita; a saída é a remoção permanente ou mensagem de erro.
- **Dados/entidades envolvidos (conceitual):** Ocorrência, autor identificado pelo e-mail informado, foto e comentários associados.
- **Estados e transições:** Disponível → solicitação de exclusão pendente de confirmação → excluída permanentemente; cancelamento mantém o registro disponível.
- **Regras de negócio:** Apenas o e-mail associado à ocorrência pode solicitar sua exclusão pelo portal; status não restringe a exclusão; a exclusão remove foto e comentários; não existe restauração. Como o e-mail não é verificado, qualquer pessoa que o informe pode se passar pelo autor.
- **Validações:** A ocorrência precisa existir e estar associada ao e-mail da sessão; exclusão só prossegue após confirmação explícita.
- **Fluxo do usuário (passo a passo):**
  1. O morador abre uma ocorrência associada ao e-mail informado.
  2. Escolhe excluir e lê o aviso de remoção permanente.
  3. Confirma ou cancela.
  4. Se confirmar, o sistema remove o registro e seus dados associados; se cancelar, mantém tudo sem alteração.
- **Casos de borda e erros:** E-mail diferente não pode excluir a ocorrência; tentativa de excluir item já removido informa que ele não está mais disponível; cancelar não altera dados; falha de exclusão não pode remover apenas parte do registro e ainda informar sucesso.
- **Impacto no existente:** Acrescenta exclusão de ocorrências; não há registros existentes no projeto inicial.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado uma ocorrência associada ao e-mail informado no portal, quando o morador confirma a exclusão, então ocorrência, foto e comentários deixam de estar disponíveis a todos.
  - Dado uma ocorrência em qualquer status, quando seu autor confirmado apenas pelo e-mail a exclui, então o status não impede a operação.
  - Dado uma ocorrência associada a outro e-mail, quando o morador tenta excluí-la, então o sistema nega a operação.
  - Dado o aviso de exclusão, quando o morador cancela, então a ocorrência e seus dados permanecem disponíveis.
- **Definição de pronto:** A exclusão exige confirmação, remove o registro e seus dados associados, é permitida em qualquer status e nega ocorrências associadas a outro e-mail.
- **Dependências:** Spec 03 e Spec 04 — requer ocorrência criada, acesso do morador e detalhe disponível.
- **Fora do escopo desta spec:** Lixeira, recuperação, exclusão por administrador de uma ocorrência isolada e comprovação de titularidade do e-mail.

## 14. Ordem recomendada de implementação

1. Spec 01 — Acesso administrativo
2. Spec 02 — Cadastro e exclusão de moradores
3. Spec 03 — Acesso do morador e criação de ocorrência
4. Spec 04 — Listagem, filtros e detalhes de ocorrência
5. Spec 05 — Comentários em ocorrências
6. Spec 06 — Atualização de status pela equipe
7. Spec 07 — Exclusão de ocorrência pelo morador

Essa ordem estabelece primeiro o acesso e os cadastros necessários, depois permite criar e consultar ocorrências e, por fim, implementa as ações de acompanhamento e exclusão que dependem desses fluxos.
