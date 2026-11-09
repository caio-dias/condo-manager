# PRD — Exclusão de comentários

> Tipo: PRD de feature · Data: 2026-11-09
>
> **Status:** Aguardando implementação
>
> Este PRD de feature prevalece sobre a exclusão individual de comentários marcada como fora de escopo no [PRD do sistema](./sistema-ocorrencias-condominio.md). As demais regras do produto permanecem inalteradas.

## 1. Visão geral

Adicionar a moradores e à administração a possibilidade de excluir comentários individuais das conversas de ocorrências. A remoção será permanente, sujeita a confirmação e limitada pelas permissões de cada perfil.

## 2. Problema que resolve

Depois de publicar um comentário, o autor não consegue corrigir uma mensagem enviada por engano, duplicada ou com informação que não deveria ter sido publicada. A administração também não consegue remover comentários inadequados das conversas. Isso pode deixar informação incorreta ou imprópria visível para quem acompanha a ocorrência.

## 3. Público-alvo

- **Moradores com sessão ativa:** podem remover os próprios comentários.
- **Administração autenticada:** pode remover comentários de qualquer autor.

## 4. Objetivo do recorte atual

Permitir a remoção segura e explícita de comentários individuais, preservando a conversa e a ocorrência, aplicando autorização conforme o perfil e informando claramente quando a remoção não puder ser concluída.

## 5. Funcionalidades

**Essenciais:**

- Mostrar a ação de exclusão junto ao autor e à data dos comentários que o usuário pode remover.
- Permitir que moradores removam os próprios comentários em qualquer ocorrência visível.
- Permitir que a administração remova comentários de moradores ou da própria administração.
- Pedir confirmação antes de remover permanentemente.
- Atualizar a conversa e a contagem de comentários após a remoção concluída.
- Informar falhas sem confirmar uma exclusão que não foi concluída.

**Desejáveis:**

- Nenhuma nesta entrega; manter o recorte limitado à exclusão individual.

## 6. Fora do escopo

- Editar o conteúdo de um comentário.
- Restaurar comentários ou manter uma lixeira, marcador de remoção ou histórico do conteúdo excluído.
- Notificar o autor quando a administração remover seu comentário.
- Registrar quem removeu um comentário ou quando a remoção ocorreu.
- Excluir comentários em lote.
- Alterar ou reforçar a autenticação dos moradores.

## 7. Regras de negócio

- Um morador pode excluir somente os comentários publicados por sua sessão, inclusive em ocorrências de outros moradores que consiga consultar.
- A administração autenticada pode excluir qualquer comentário.
- Um morador não pode excluir comentários publicados por outro morador ou pela administração; a restrição também se aplica à solicitação da ação, não apenas à exibição do controle.
- O controle “Excluir” aparece junto ao autor e à data somente para perfis autorizados.
- A exclusão exige confirmação explícita. Cancelar a confirmação não altera o comentário.
- Confirmada a exclusão, o comentário é removido permanentemente, sem prazo de expiração e sem possibilidade de restauração.
- A exclusão não remove nem altera a ocorrência ou os demais comentários.
- A conversa permanece aberta após a exclusão; a lista e sua contagem refletem o resultado confirmado.
- Se não restarem comentários, a conversa apresenta um estado vazio informativo e contagem zero, conforme o requisito do PRD do sistema.
- A administração não precisa informar um motivo, não gera notificação ao autor e não mantém registro de auditoria nesta entrega.
- A sessão do morador continua baseada em e-mail não verificado. Quem souber o e-mail pode se passar pelo morador e excluir comentários atribuídos a ele; essa limitação existente é aceita neste recorte e não significa que a identidade foi verificada.

## 8. Fluxos principais

### Fluxo 1 — Morador exclui o próprio comentário

1. O morador abre uma ocorrência visível e consulta a conversa.
2. Nos comentários escritos por ele, escolhe “Excluir”.
3. O sistema pede confirmação e informa que a ação é permanente.
4. Se cancelar, o comentário permanece sem alterações.
5. Se confirmar e a exclusão for concluída, o comentário desaparece, a contagem é atualizada e o morador permanece no detalhe da ocorrência.
6. Se a ação falhar, o sistema informa o erro e não apresenta a remoção como concluída.

### Fluxo 2 — Administração remove um comentário

1. A administração autenticada abre o detalhe de uma ocorrência e consulta a conversa.
2. Escolhe “Excluir” em qualquer comentário.
3. O sistema pede confirmação e informa que a ação é permanente.
4. Se cancelar, o comentário permanece sem alterações.
5. Se confirmar e a exclusão for concluída, o comentário desaparece e a contagem é atualizada; não há notificação ao autor.
6. Se a ação falhar, o sistema informa o erro e não apresenta a remoção como concluída.

## 9. Critérios de aceite

- Um morador vê a ação “Excluir” nos próprios comentários, mas não nos comentários de outras pessoas ou da administração.
- Uma solicitação de exclusão feita por morador para comentário de outra pessoa é negada, mesmo que a ação seja chamada sem usar o controle exibido na tela.
- A administração autenticada vê a ação “Excluir” em todos os comentários da ocorrência.
- Um usuário que cancela a confirmação mantém o comentário e a contagem inalterados.
- Após a confirmação de uma exclusão permitida, o comentário deixa de aparecer para os perfis que consultam aquela ocorrência e a contagem exibida corresponde à conversa atualizada.
- A exclusão de um comentário não remove a ocorrência nem modifica os outros comentários.
- Se o comentário já não estiver disponível quando a exclusão for solicitada, o sistema informa que ele não está mais disponível e não mostra uma confirmação falsa de sucesso.
- Se houver falha ao excluir, o sistema informa que a operação não foi concluída e não apresenta sucesso prematuro.
- Quando a exclusão remove o último comentário, a contagem passa a zero e a conversa apresenta um estado vazio informativo.
- A exclusão não gera notificação ao autor nem registro de auditoria.

## 10. Stack

Manter a stack existente do CondoManager: Next.js com React e TypeScript, Supabase para persistência e Tailwind CSS para a interface.

## 11. Justificativa da stack

A funcionalidade pertence às conversas já exibidas nos detalhes de ocorrências e não exige novo serviço ou tecnologia. Reutilizar a stack atual mantém a experiência e a operação integradas às áreas de morador e administração.

## 12. Fases de construção

### Fase 1 — Exclusão individual de comentários

Objetivo: permitir que cada perfil remova comentários conforme suas permissões, com confirmação e tratamento explícito de sucesso, cancelamento e falha.

Specs:

- Spec 01 — Excluir comentário de uma conversa

## 13. Specs funcionais detalhadas

### Spec 01 — Excluir comentário de uma conversa

- **Fase:** Fase 1 — Exclusão individual de comentários
- **Objetivo (o quê):** Permitir a remoção individual e permanente de comentários em uma ocorrência. A ação deve respeitar as permissões de morador e administração e atualizar a conversa somente quando a remoção estiver concluída.
- **Intenção (por quê):** Dar ao autor uma forma de corrigir uma publicação própria e permitir que a administração modere conteúdo inadequado, evitando que mensagens erradas, duplicadas ou impróprias permaneçam na conversa.
- **Contexto:** O CondoManager já exibe comentários no detalhe de ocorrências, em áreas separadas para moradores e administração. Ambos os perfis podem consultar e publicar comentários; moradores podem comentar ocorrências visíveis. O PRD do sistema anterior excluía a exclusão individual, regra que esta spec passa a substituir para o comportamento aqui descrito.
- **Atores:** Morador com sessão ativa; administrador autenticado.
- **Descrição do comportamento:** A conversa oferece a ação “Excluir” ao lado do autor e da data dos comentários que o perfil pode remover. O morador recebe a ação apenas nos comentários atribuídos à sua sessão, em qualquer ocorrência visível. A administração recebe a ação para todos os comentários. Antes de excluir, o sistema pede confirmação e deixa claro que a remoção é permanente e não pode ser desfeita. Cancelar não altera os dados. Ao confirmar uma ação permitida, o sistema remove o comentário e atualiza a conversa e a contagem, mantendo o usuário no detalhe da ocorrência. Uma ação não autorizada, comentário indisponível ou falha não pode ser apresentada como sucesso. Quando a conversa fica sem comentários, ela informa que não há comentários.
- **Entradas e saídas:** A entrada é a solicitação de exclusão de um comentário no contexto de uma ocorrência, feita por um morador ou administrador com sessão válida. A saída é a conversa atualizada e a contagem correspondente após sucesso, ou uma mensagem explícita quando a ação for cancelada, não autorizada, indisponível ou malsucedida.
- **Dados/entidades envolvidos (conceitual):** Comentário, texto, autor, data de publicação e ocorrência associada. A autoria deve permitir distinguir comentários de moradores e da administração.
- **Estados e transições:** Um comentário disponível permanece inalterado enquanto a confirmação não for aceita. Após confirmação e exclusão concluída, deixa de existir e de aparecer na conversa. O cancelamento preserva o estado original. Se a exclusão não for concluída, o sistema não deve informar sucesso.
- **Regras de negócio:** Moradores excluem apenas os próprios comentários, inclusive em ocorrências de terceiros que possam consultar; administração autenticada exclui qualquer comentário; não há prazo para exclusão; toda exclusão exige confirmação e é permanente; não há restauração, notificação ao autor ou auditoria da ação. A autenticação do morador permanece baseada em e-mail não verificado, com o risco de representação indevida já aceito no produto.
- **Validações:** Antes de aceitar a exclusão, verificar que o usuário possui uma sessão válida, que o comentário ainda está disponível e que o perfil tem permissão para removê-lo. A administração deve estar autenticada. O morador só pode remover um comentário atribuído à sua sessão. A permissão não depende apenas de o controle estar visível na interface.
- **Fluxo do usuário (passo a passo):**
  1. O usuário abre o detalhe de uma ocorrência e localiza um comentário que pode remover.
  2. Seleciona “Excluir”.
  3. O sistema informa que a exclusão é permanente e pede confirmação.
  4. O usuário cancela ou confirma a ação.
  5. Ao cancelar, o sistema fecha a confirmação e preserva a conversa.
  6. Ao confirmar, o sistema valida disponibilidade e permissão, tenta excluir e informa o resultado.
  7. Em caso de sucesso, remove o comentário da conversa, atualiza a contagem e mostra o estado vazio informativo se não houver outros comentários.
- **Casos de borda e erros:** Se o usuário cancelar, não há alteração. Se o comentário já tiver sido removido ou a ocorrência não estiver mais disponível, informar que o conteúdo não está mais disponível, sem sucesso falso. Se o morador tentar excluir comentário alheio, negar a ação e preservar o conteúdo. Se a sessão for inválida, informar que é necessário acessar novamente. Se ocorrer falha de persistência, informar que a exclusão não foi concluída e não apresentar sucesso prematuro. A ausência de comentários após uma remoção deve ser apresentada como um estado vazio informativo.
- **Impacto no existente:** Acrescenta exclusão individual às conversas atuais de moradores e administração e altera a regra anterior que proibia essa ação. Não altera a publicação, edição de comentários, exclusão de ocorrências ou autenticação.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um morador com sessão válida e um comentário próprio em qualquer ocorrência visível, quando escolhe excluir e confirma, então o comentário desaparece e a contagem é atualizada.
  - Dado um morador consultando comentário de outro autor, quando visualiza a conversa, então não recebe a ação de exclusão para esse comentário.
  - Dado um morador que solicita a exclusão de um comentário alheio, quando o sistema valida a ação, então a nega e preserva o comentário.
  - Dado um administrador autenticado e um comentário disponível, quando confirma a exclusão, então o comentário desaparece e a contagem é atualizada, independentemente do autor.
  - Dado qualquer usuário diante da confirmação, quando cancela, então o comentário permanece inalterado.
  - Dado um comentário já removido ou indisponível, quando uma exclusão é solicitada, então o sistema informa a indisponibilidade sem afirmar que realizou uma nova exclusão.
  - Dado que a persistência da exclusão falha, quando o sistema apresenta o resultado, então informa que a operação não foi concluída sem mostrar sucesso prematuro.
  - Dado que o comentário removido era o último da conversa, quando a remoção termina, então a contagem é zero e a conversa mostra um estado vazio informativo.
- **Definição de pronto:** Moradores e administração conseguem excluir apenas os comentários permitidos; a confirmação pode ser cancelada sem efeitos; a exclusão confirmada é permanente; a conversa e a contagem refletem o resultado; estados vazios e erros são apresentados claramente; nenhuma falha ou falta de permissão é apresentada como sucesso.
- **Dependências:** A experiência existente de detalhe de ocorrência, consulta de comentários e sessões de morador e administração.
- **Fora do escopo desta spec:** Editar comentários, restaurar ou manter marcadores de conteúdo removido, apagar comentários em lote, notificar autores, auditar exclusões e mudar a autenticação do morador.

## 14. Ordem recomendada de implementação

1. Spec 01 — Excluir comentário de uma conversa

Como a entrega contém uma única spec, não há dependências entre fases. A spec reúne autorização, confirmação, exclusão e atualização da conversa para que o comportamento seja entregue e validado de ponta a ponta.
