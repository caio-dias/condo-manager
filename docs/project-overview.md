# Visão geral do projeto

Última atualização: 2026-11-06

## Produto

O CondoManager — Residencial Aurora é uma aplicação web para moradores relatarem ocorrências do condomínio e para a administração acompanhar e tratar esses relatos.

## Perfis e funcionalidades

### Moradores

- Acessam o portal informando o e-mail previamente cadastrado pela administração.
- Consultam e filtram ocorrências por status e categoria.
- Registram ocorrências com título, descrição, categoria e local; foto é opcional.
- Acompanham detalhes disponíveis e trocam comentários com a administração.

### Administração

- Acessa o painel com e-mail e senha do Supabase Auth.
- Cadastra e remove moradores.
- Consulta e filtra ocorrências por status e categoria.
- Atualiza o status e adiciona comentários nas ocorrências.
- A conta inicial exige troca de senha antes de usar o painel.

## Dados principais

- **Morador:** nome, e-mail, torre, apartamento e telefone opcional.
- **Ocorrência:** morador, título, descrição, categoria, local, status, foto opcional e datas de criação/atualização.
- **Comentário:** texto associado a uma ocorrência e a exatamente um autor (morador ou administração).
- **Perfil administrativo:** associa uma conta do Supabase Auth ao painel e registra se a troca inicial de senha ainda é necessária.

Categorias: Manutenção / infraestrutura, Limpeza, Ruído / convivência, Segurança, Áreas comuns e Outro. Status: Aberta, Em andamento e Resolvida.

## Rotas principais

| Caminho | Uso |
| --- | --- |
| `/` | Seleção do portal de morador ou administração |
| `/resident/access` | Acesso do morador pelo e-mail cadastrado |
| `/resident/incidents` | Lista e filtros de ocorrências |
| `/resident/incidents/new` | Cadastro de ocorrência |
| `/resident/incidents/[id]` | Detalhes e comentários |
| `/admin/login` | Login administrativo e configuração inicial local |
| `/admin/change-password` | Troca obrigatória de senha |
| `/admin/incidents` | Lista e gestão de ocorrências |
| `/admin/incidents/[id]` | Detalhes, status e comentários |
| `/admin/residents` | Cadastro e gestão de moradores |

## Limites atuais

- A versão suporta uma única conta administrativa.
- O acesso do morador é baseado no e-mail declarado, sem verificação independente de titularidade.
- As sessões de morador não expiram automaticamente.
- Fotos aceitas são JPEG, PNG ou WebP, com limite de 5 MB.

Para configuração e segurança do banco, consulte [`../supabase/README.md`](../supabase/README.md). O PRD e o plano de implementação estão em [`prd/sistema-ocorrencias-condominio.md`](prd/sistema-ocorrencias-condominio.md) e [`plano-implementacao-sistema-ocorrencias-condominio.md`](plano-implementacao-sistema-ocorrencias-condominio.md).
