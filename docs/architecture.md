# Arquitetura e decisões técnicas

Última atualização: 2026-11-06

## Stack

- **Next.js 16.4.4** com App Router e Server Actions.
- **React 19.3.0**, **TypeScript 5** e **Tailwind CSS 4**.
- **Supabase:** Auth, Postgres e Storage; integração via `@supabase/ssr` e `@supabase/supabase-js`.
- **Validação:** Zod 4. **Testes:** Vitest 4.

## Organização do código

| Caminho | Responsabilidade |
| --- | --- |
| `src/app/` | Páginas e layouts públicos, administrativos e do morador |
| `src/app/_actions/` | Server Actions para autenticação, moradores e ocorrências |
| `src/components/` | Componentes compartilhados de listas, filtros, formulários e feedback |
| `src/lib/domain.ts` | Categorias, status e tipos de domínio |
| `src/lib/validation.ts` | Schemas de validação de entrada |
| `src/lib/data.ts` | Consultas de moradores e ocorrências, incluindo comentários e URLs de fotos assinadas |
| `src/lib/auth.ts` | Validação de sessão e autorização administrativa |
| `src/lib/resident-session.ts` | Criação, validação e remoção da sessão do morador |
| `src/lib/supabase/` | Clientes Supabase para servidor e operações administrativas |
| `src/proxy.ts` | Atualização de sessão Supabase nas rotas administrativas |
| `supabase/migrations/` | Esquema, restrições, índices, RLS e configuração do Storage |

## Fluxos de autenticação

### Administração

O administrador autentica-se pelo Supabase Auth. O perfil correspondente em `admin_profiles` autoriza o acesso; páginas e ações no servidor verificam esse perfil. Na configuração local, um bootstrap opcional cria uma conta temporária e exige a troca de senha antes de liberar o painel. Em produção, a conta é provisionada no Supabase Auth e vinculada ao perfil por script SQL.

### Moradores

O morador informa o e-mail cadastrado. A aplicação limita tentativas a cinco por janela de 15 minutos, usando uma chave HMAC derivada do IP, e emite um token assinado em cookie `HttpOnly`, `SameSite=Lax` e `Secure` em produção. A sessão não tem expiração automática. O e-mail informado não comprova a titularidade da conta.

## Persistência e arquivos

- `admin_profiles` relaciona o usuário Auth administrativo e a exigência de troca de senha.
- `residents` guarda cadastro e contato do morador.
- `incidents` armazena relatos, categoria, local, status e caminho opcional da foto.
- `comments` registra mensagens e distingue autor morador de autor administrativo.
- A exclusão de um morador remove ocorrências e comentários relacionados conforme as referências em cascata; a aplicação remove fotos do Storage antes de excluir os registros.
- O bucket `incident-photos` é privado e limita o conteúdo a JPEG, PNG ou WebP de até 5 MB. A aplicação verifica o conteúdo da imagem e entrega URLs assinadas temporárias.

As tabelas têm RLS habilitado e não concedem acesso direto às roles `anon` e `authenticated`. Operações de dados usam o cliente de service role apenas no servidor, depois das verificações de sessão e autorização. A migração também configura o armazenamento privado para as tentativas de acesso do morador.

## Configuração e comandos

Variáveis necessárias, definidas no servidor:

| Variável | Uso |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave publicável usada pela integração SSR |
| `SUPABASE_SERVICE_ROLE_KEY` | Operações privilegiadas no servidor |
| `RESIDENT_SESSION_SECRET` | Assinatura de sessão e derivação da chave de rate limit; mínimo de 32 caracteres |
| `ENABLE_LOCAL_ADMIN_BOOTSTRAP` | Habilita o bootstrap administrativo somente em desenvolvimento |

```sh
npm run dev
npm test
npm run build
npm start
```

Instruções de provisionamento, configuração do bucket e decisões de segurança estão em [`../supabase/README.md`](../supabase/README.md). O esquema está em [`../supabase/migrations/20261104130000_initial_schema.sql`](../supabase/migrations/20261104130000_initial_schema.sql).
