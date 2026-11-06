import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Building2, ShieldCheck } from "lucide-react";
import { AdminLoginForm } from "@/app/admin/login/_components/login-form";
import { getAdminSession } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export default async function AdminLoginPage() {
  await connection();
  const isConfigured = isSupabaseConfigured();
  if (isConfigured) {
    const session = await getAdminSession();
    if (session) {
      redirect(session.profile.must_change_password ? "/admin/change-password" : "/admin");
    }
  }

  const canBootstrapLocally =
    process.env.NODE_ENV === "development" &&
    process.env.ENABLE_LOCAL_ADMIN_BOOTSTRAP === "true";

  return (
    <main className="auth-page">
      <aside className="auth-aside">
        <Link className="brand" href="/">
          <Building2 aria-hidden="true" size={25} />
          <span>CondoManager</span>
        </Link>
        <div className="auth-aside-copy">
          <ShieldCheck aria-hidden="true" size={34} />
          <h2>Cuidado compartilhado começa com organização.</h2>
          <p>Administre moradores e acompanhe cada solicitação do Residencial Aurora.</p>
        </div>
        <p className="auth-aside-footer">Residencial Aurora · Administração</p>
      </aside>
      <section className="auth-main">
        <div className="auth-content">
          <div className="auth-heading">
            <h1>Acesso da administração</h1>
            <p>Entre com o e-mail e a senha da conta autorizada.</p>
          </div>
          {!isConfigured && (
            <p className="notice" role="status">
              Para habilitar o painel, configure as variáveis do Supabase conforme o arquivo
              <code> .env.example</code>.
            </p>
          )}
          <AdminLoginForm
            canBootstrapLocally={canBootstrapLocally}
            isConfigured={isConfigured}
          />
        </div>
      </section>
    </main>
  );
}
