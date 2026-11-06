import { redirect } from "next/navigation";
import { connection } from "next/server";
import { PasswordForm } from "@/app/admin/change-password/_components/password-form";
import { getAdminSession } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export default async function ChangePasswordPage() {
  await connection();
  if (!isSupabaseConfigured()) redirect("/admin/login");
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (!session.profile.must_change_password) redirect("/admin");

  return (
    <main className="auth-page auth-page-simple">
      <section className="auth-main">
        <div className="auth-content">
          <div className="auth-heading">
            <h1>Crie sua senha pessoal</h1>
            <p>
              A senha temporária não pode ser usada no painel. Defina uma nova senha para
              concluir a configuração da conta.
            </p>
          </div>
          <PasswordForm />
        </div>
      </section>
    </main>
  );
}
