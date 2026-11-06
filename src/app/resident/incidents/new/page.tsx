import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { IncidentForm } from "@/app/resident/incidents/new/_components/incident-form";
import { AppShell } from "@/components/app-shell";
import { getResidentSession } from "@/lib/resident-session";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export default async function NewIncidentPage() {
  await connection();
  if (!isSupabaseConfigured()) redirect("/resident/access");
  const resident = await getResidentSession();
  if (!resident) redirect("/resident/access");

  return (
    <AppShell audience="resident" active="incidents" residentName={resident.full_name}>
      <Link className="back-link" href="/resident/incidents">
        <ArrowLeft aria-hidden="true" size={16} /> Voltar às ocorrências
      </Link>
      <div className="page-heading">
        <div>
          <h1>Nova ocorrência</h1>
          <p>Descreva o problema com detalhes para ajudar a administração a agir.</p>
        </div>
      </div>
      <section className="content-panel">
        <IncidentForm />
      </section>
    </AppShell>
  );
}
