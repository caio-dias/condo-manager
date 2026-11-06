# Configuração do Supabase

Todos os arquivos SQL do sistema ficam nesta pasta. As alterações versionadas de banco ficam em `migrations/`; o exemplo de provisionamento administrativo é um script SQL separado e deve ser executado apenas uma vez.

## Ambiente local

1. Crie um projeto Supabase de desenvolvimento e copie a URL, a chave anon/publicável e a service-role key para um arquivo `.env.local` na raiz do projeto. Nunca exponha a service-role key ao navegador ou a versiona.
2. Gere um segredo aleatório de pelo menos 32 caracteres para `RESIDENT_SESSION_SECRET`.
3. Configure `ENABLE_LOCAL_ADMIN_BOOTSTRAP=true` somente no ambiente local.
4. Execute a migração `migrations/20261104130000_initial_schema.sql` pelo SQL Editor do Supabase.
5. Inicie o app e use **Preparar acesso local** na tela de administração. Isso cria uma única conta `admin@example.com` com a senha temporária `admin`, vinculada à tabela de perfis e com troca de senha obrigatória.
6. Desative `ENABLE_LOCAL_ADMIN_BOOTSTRAP` depois de criar a conta.

O bootstrap só está habilitado em `NODE_ENV=development`; a aplicação recusa a ação em produção.

## Produção

1. Configure as mesmas variáveis de ambiente em um gerenciador de segredos do ambiente de publicação. Use uma `RESIDENT_SESSION_SECRET` forte e exclusiva.
2. Execute as migrações SQL versionadas em `/supabase/migrations` em uma janela controlada.
3. Crie exatamente uma conta de administrador no Supabase Auth com e-mail e senha próprios. Confirmação de e-mail deve seguir a decisão atual do produto: não é exigida.
4. Substitua o endereço de exemplo em `bootstrap-admin.example.sql` pelo e-mail da conta criada e execute o script uma única vez no SQL Editor. O script falha se já houver administrador ou se a conta Auth não existir.
5. Mantenha `ENABLE_LOCAL_ADMIN_BOOTSTRAP` ausente ou falso. Não use `admin/admin` em produção.
6. Verifique que o bucket `incident-photos` é privado, aceita apenas JPEG/PNG/WebP e limita uploads a 5 MB; esses valores também são definidos pela migração.

## Limites e segurança

- O cliente com service-role key existe apenas no servidor e executa as operações depois de verificar a sessão e a autorização. Não a configure com prefixo `NEXT_PUBLIC_`.
- As tabelas da aplicação têm RLS habilitado e não concedem operações diretas às roles `anon` e `authenticated`; as políticas de negócio são aplicadas no servidor.
- O acesso do morador é um e-mail autodeclarado, sem comprovação de titularidade, e a sessão não expira automaticamente por decisão confirmada. O cookie é `HttpOnly`, `SameSite=Lax` e `Secure` em produção.
- O rate limit do portal usa uma chave derivada por HMAC; o endereço IP original não é persistido.
- Exclusões removem as fotos antes dos registros. Se a remoção da foto falhar, o registro é mantido. Se a foto for removida e a alteração/exclusão no banco falhar, o registro é mantido sem foto quando possível e a falha é informada.
