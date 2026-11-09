# Plano de implementação — Exclusão de comentários

> Base: [PRD da feature de exclusão de comentários](./prd/feature-exclusao-de-comentarios.md)
>
> Status: implementado
>
> Escopo: exclusão individual de comentários por moradores e administração, conforme as permissões e os critérios de aceite do PRD.

## 1. Objetivo e resultado esperado

Permitir que:

- Moradores removam permanentemente os próprios comentários em qualquer ocorrência visível.
- Administradores autenticados removam comentários de qualquer autor.
- Cada exclusão exija confirmação explícita.
- A conversa e a contagem sejam atualizadas após sucesso.
- Tentativas sem permissão, comentários indisponíveis e falhas sejam informados sem sucesso falso.

Não implementar edição, restauração, notificações, auditoria ou alterações na autenticação dos moradores.

## 2. Estado atual e premissas

- Os detalhes de ocorrência nas áreas de administração e morador já carregam e exibem comentários, incluindo `id`, `incident_id`, `resident_author_id` e `admin_author_id`.
- Os comentários são ordenados por data crescente, e a contagem é derivada da lista carregada.
- As ações de comentário ficam em `src/app/_actions/incidents.ts`. Ações existentes usam Zod para validar identificadores, verificam a sessão no servidor, usam o cliente Supabase privilegiado somente no servidor e invalidam os dois detalhes de ocorrência.
- O componente `CommentForm` demonstra o padrão de Client Component com `useActionState`. `ResidentDeleteButton` demonstra confirmação nativa e apresentação de feedback para uma ação destrutiva.
- A tabela `comments` já tem chave primária, referências de autoria, referência à ocorrência e política que exige exatamente um autor. As chaves estrangeiras já tratam remoções em cascata de ocorrências e moradores.
- A migration habilita RLS e revoga acesso direto às tabelas para `anon` e `authenticated`; portanto, a nova mutação deve permanecer numa Server Action com verificações explícitas de sessão e autoria.
- Não é necessária alteração de schema ou nova migration: o recorte só remove linhas existentes e não adiciona dados de auditoria ou exclusão lógica.
- O PRD anterior descrevia exclusão individual como fora de escopo. O novo PRD de feature prevalece especificamente para esse comportamento; as outras regras do produto permanecem vigentes.

## 3. Abordagem

### Persistência e autorização

Implementar duas Server Actions específicas para manter as fronteiras de autorização explícitas:

1. A ação do morador valida o ID da ocorrência e do comentário, obtém a sessão do morador no servidor e executa a exclusão condicionada simultaneamente ao ID do comentário, ID da ocorrência e `resident_author_id` igual ao morador autenticado pela sessão.
2. A ação administrativa exige `requireAdminForAction()`, valida os IDs e executa a exclusão condicionada ao ID do comentário e à ocorrência.
3. Ambas devem confirmar que uma linha foi removida. Nenhuma linha correspondente deve resultar em mensagem de indisponibilidade/permissão, nunca em sucesso.
4. Erros de persistência devem ser registrados no servidor e retornar uma mensagem explícita de falha.
5. Em caso de sucesso, invalidar os detalhes da ocorrência nas duas áreas (`/admin/incidents/[id]` e `/resident/incidents/[id]`) para que os dois perfis vejam a conversa atualizada.

As condições de autoria devem fazer parte da própria operação de exclusão do morador, além da ocultação do controle na interface. Isso evita depender de uma checagem apenas visual ou de uma consulta de autorização separada da mutação. O cliente Supabase de service role não pode ser importado ou enviado ao navegador.

### Interface

Adicionar um controle de exclusão reutilizável nas linhas da conversa:

- Na administração, exibir o controle para todos os comentários.
- No portal do morador, exibir somente quando `resident_author_id` corresponder ao ID da sessão carregada pela página.
- Posicionar “Excluir” junto ao autor/data do comentário, conforme o PRD.
- Pedir confirmação com texto que explicite a permanência da ação. Cancelar deve impedir o envio do formulário.
- Usar o padrão existente de ação pendente e feedback de erro. Após sucesso, atualizar a lista e a contagem, sem deixar uma mensagem de erro presa a um comentário que já não existe.
- Se não houver mais comentários, mostrar uma mensagem de conversa vazia e a contagem zero.

A autorização no servidor é obrigatória mesmo quando o botão está oculto. Um morador pode tentar invocar a Server Action diretamente ou manipular os campos enviados.

## 4. Etapas de implementação

### Etapa 1 — Ações de exclusão e autorização

1. Acrescentar ações de exclusão de comentário em `src/app/_actions/incidents.ts`, separadas por perfil.
2. Validar IDs externos com `idSchema` antes de consultar ou alterar dados.
3. Na ação do morador, exigir sessão válida e condicionar a exclusão a `resident_author_id` igual ao ID da sessão.
4. Na ação administrativa, exigir `requireAdminForAction()` antes da mutação.
5. Condicionar ambas as ações ao comentário e à ocorrência informados, confirmar a exclusão efetiva, registrar erros de banco e retornar estado de erro/sucesso conforme os padrões existentes.
6. Invalidar os detalhes da ocorrência para administração e morador após a exclusão confirmada.

**Saída:** nenhuma chamada pode remover comentário sem autorização no servidor, e uma falha ou ausência de linha não é apresentada como sucesso.

### Etapa 2 — Controle de exclusão nos detalhes

1. Criar um componente de ação reutilizável em `src/components/`, já que as duas páginas de detalhe precisam do mesmo fluxo visual e de confirmação.
2. Receber do Server Component a ação apropriada ao perfil e os identificadores necessários, seguindo o padrão usado por `CommentForm`.
3. Integrar o controle à área de autor/data de cada comentário em `src/app/admin/incidents/[id]/page.tsx` e `src/app/resident/incidents/[id]/page.tsx`.
4. Na página administrativa, disponibilizar a ação para cada comentário. Na página do morador, renderizá-la apenas para comentários próprios.
5. Tratar conversa sem comentários com estado vazio informativo nas duas áreas e manter a contagem correta.
6. Adicionar apenas os estilos estritamente necessários a `src/app/globals.css`, respeitando os estilos existentes de conversa e botões.

**Saída:** os controles aparecem junto aos comentários autorizados, pedem confirmação e preservam a navegação no detalhe da ocorrência.

### Etapa 3 — Testes e documentação

1. Adicionar testes para as regras de autorização e os resultados observáveis da ação, usando as ferramentas já existentes no projeto. Cobrir pelo menos morador próprio, morador tentando comentário alheio, administrador, comentário indisponível e erro de persistência.
2. Verificar a UI nos dois detalhes: visibilidade por autoria, cancelamento da confirmação, remoção confirmada, contagem, estado vazio e feedback de erro.
3. Atualizar a descrição de funcionalidades em `README.md` e `docs/project-overview.md` para indicar que moradores removem comentários próprios e a administração remove qualquer comentário.
4. Não alterar o PRD geral antigo para reescrever seu histórico; manter a precedência registrada no PRD da feature.

**Saída:** os critérios de aceite estão cobertos e a documentação atual do produto não omite a nova capacidade.

## 5. Matriz de autorização

| Operação                                                  | Visitante |               Morador com sessão | Administração autenticada |
| --------------------------------------------------------- | --------: | -------------------------------: | ------------------------: |
| Excluir comentário próprio                                |       Não |                              Sim |                       Sim |
| Excluir comentário de outro morador                       |       Não |                              Não |                       Sim |
| Excluir comentário administrativo                         |       Não |                              Não |                       Sim |
| Excluir comentário em ocorrência visível de outro morador |       Não | Sim, se o comentário for próprio |                       Sim |

A condição do morador usa o ID da sessão já validada, não o nome, e-mail ou identificador de autor enviado pelo formulário. O risco existente de sessão de morador baseada em e-mail não verificado permanece aceito e deve continuar documentado.

## 6. Verificação

### Testes automatizados

- `npm test`
- `npm run typecheck`
- `npm run build`

Os testes devem comprovar a regra de autorização no servidor e os estados de sucesso/erro. Se não houver ambiente Supabase de teste configurado, não declarar cobertura de integração real com Postgres; validar esse fluxo manualmente quando houver credenciais de teste disponíveis.

### Verificação manual com Supabase configurado

1. Entrar como morador e excluir um comentário próprio em ocorrência própria.
2. Entrar como morador e excluir um comentário próprio em ocorrência de outro morador.
3. Confirmar que comentários de outros moradores e da administração não mostram controle de exclusão ao morador.
4. Tentar acionar a ação do morador para comentário de outro autor e confirmar que o banco não o remove.
5. Entrar como administração e excluir comentários de morador e de administração.
6. Cancelar a confirmação nos dois perfis e verificar que conteúdo e contagem permanecem.
7. Excluir o último comentário e verificar o estado vazio e a contagem zero.
8. Recarregar a ocorrência nas duas áreas e confirmar que a exclusão está persistida.
9. Induzir falha de persistência ou usar um comentário inexistente e verificar que não há sucesso falso.
10. Confirmar que a chave `SUPABASE_SERVICE_ROLE_KEY` e o cliente administrativo permanecem exclusivamente no servidor.

## 7. Riscos e cuidados

- **Ação Server Action invocada diretamente:** não confiar na presença ou ausência do botão; validar identidade e autoria na mutação.
- **Identificador adulterado:** validar os IDs e associar o comentário à ocorrência enviada. A exclusão do morador deve ainda impor o autor obtido da sessão.
- **Clique duplo ou comentário já removido:** tratar ausência de linha afetada como indisponibilidade, sem sucesso falso.
- **Cache entre perfis:** invalidar as duas rotas de detalhe após sucesso.
- **Sessão de morador por e-mail não verificado:** alguém que saiba o e-mail pode se passar pelo morador e remover comentários atribuídos a ele. O PRD aceita explicitamente essa limitação.
- **Acesso privilegiado ao banco:** o cliente de service role ignora RLS; cada ação deve completar suas verificações de sessão, perfil e autoria antes de mutar.

## 8. Fora do escopo de implementação

- Migration ou mudança de schema, RLS e grants.
- Edição de comentários, lixeira, exclusão lógica, recuperação ou auditoria.
- Notificações, justificativa obrigatória ou exclusão em lote.
- Mudança de autenticação ou de sessão dos moradores.
