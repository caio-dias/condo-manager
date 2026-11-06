# CondoManager — Residencial Aurora

Aplicação web para registrar e acompanhar ocorrências de um condomínio.

Última atualização: 2026-11-06

## Funcionalidades

- Administração: login, troca obrigatória da senha inicial, cadastro e remoção de moradores, listagem e filtragem de ocorrências, atualização de status e comentários.
- Moradores: acesso pelo e-mail cadastrado, listagem e filtragem de ocorrências, criação de ocorrências com foto opcional e comentários.
- Ocorrências usam categorias e status definidos pelo sistema; fotos são armazenadas em bucket privado.

Veja a [visão geral do produto](./docs/project-overview.md) e a [arquitetura](./docs/architecture.md) para mais detalhes.

## Desenvolvimento local

1. Instale as dependências com `npm ci`.
2. Copie `.env.example` para `.env.local` e preencha:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESIDENT_SESSION_SECRET` (segredo aleatório com pelo menos 32 caracteres)
3. Aplique a migração em [`supabase/migrations`](./supabase/migrations).
4. Para criar a conta administrativa temporária, defina `ENABLE_LOCAL_ADMIN_BOOTSTRAP=true`, inicie o app e use **Preparar acesso local** na tela administrativa. A senha temporária é `admin` e deve ser substituída antes de liberar o painel.
5. Desative o bootstrap depois de criar a conta.

Inicie o servidor:

```sh
npm run dev
```

Acesse `http://localhost:3000`.

## Testes e build

```sh
npm test
npm run build
```

## Supabase e produção

Há uma única conta administrativa nesta versão. Em produção, crie-a no Supabase Auth e vincule-a com o script [`supabase/bootstrap-admin.example.sql`](./supabase/bootstrap-admin.example.sql). Nunca habilite o bootstrap `admin/admin` em produção nem exponha a service-role key.

Consulte [`supabase/README.md`](./supabase/README.md) para configuração local, provisionamento da conta administrativa, política de fotos e decisões de segurança.

## Stack

- Next.js 16, React 19, TypeScript e Tailwind CSS 4.
- Supabase Auth, Postgres e Storage.

## Documentação

- [Visão geral do produto](./docs/project-overview.md)
- [Arquitetura e decisões técnicas](./docs/architecture.md)
- [PRD](./docs/prd/sistema-ocorrencias-condominio.md) e [plano de implementação](./docs/plano-implementacao-sistema-ocorrencias-condominio.md)
- [Configuração do Supabase](./supabase/README.md)
