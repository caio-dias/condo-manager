import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Building2, HeartHandshake } from "lucide-react";
import { ResidentAccessForm } from "@/app/resident/access/_components/access-form";
import { getResidentSession } from "@/lib/resident-session";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export default async function ResidentAccessPage() {
  await connection();
  const isConfigured = isSupabaseConfigured();
  if (isConfigured && (await getResidentSession())) redirect("/resident/incidents");

  return (
    <main className="auth-page">
      <aside className="auth-aside">
        <Link className="brand" href="/">
          <Building2 aria-hidden="true" size={25} />
          <span>CondoManager</span>
        </Link>
        <div className="auth-aside-copy">
          <HeartHandshake aria-hidden="true" size={34} />
          <h2>Cuidar do condomínio é uma tarefa de todos.</h2>
          <p>Conte o que aconteceu. A administração acompanha e mantém você por dentro.</p>
        </div>
        <p className="auth-aside-footer">Residencial Aurora · Portal do morador</p>
      </aside>
      <section className="auth-main">
        <div className="auth-content">
          <div className="auth-heading">
            <h1>Área do morador</h1>
            <p>Informe o e-mail cadastrado pela administração para ver as ocorrências.</p>
          </div>
          <ResidentAccessForm isConfigured={isConfigured} />
        </div>
      </section>
    </main>
  );
}
