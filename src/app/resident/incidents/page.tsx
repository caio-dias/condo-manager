import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AppShell } from "@/components/app-shell";
import { FilterBar } from "@/components/filter-bar";
import { IncidentList } from "@/components/incident-list";
import { listIncidents } from "@/lib/data";
import { getResidentSession } from "@/lib/resident-session";
import { INCIDENT_CATEGORIES, INCIDENT_STATUSES } from "@/lib/domain";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

type SearchParams = Promise<{ status?: string; category?: string }>;

export default async function ResidentIncidentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await connection();
  if (!isSupabaseConfigured()) redirect("/resident/access");
  const resident = await getResidentSession();
  if (!resident) redirect("/resident/access");

  const params = await searchParams;
  const status = INCIDENT_STATUSES.find((item) => item.value === params.status)?.value;
  const category = INCIDENT_CATEGORIES.find((item) => item.value === params.category)?.value;
  const hasInvalidFilter =
    (params.status && !status) || (params.category && !category);
  const incidents = await listIncidents({ status, category });

  return (
    <AppShell audience="resident" active="incidents" residentName={resident.full_name}>
      <div className="page-heading">
        <div>
          <h1>Ocorrências do condomínio</h1>
          <p>Acompanhe os relatos e as atualizações da administração.</p>
        </div>
        <Link className="button button-primary" href="/resident/incidents/new">
          <Plus aria-hidden="true" size={17} />
          Nova ocorrência
        </Link>
      </div>
      {hasInvalidFilter && (
        <p className="notice" role="alert">Um dos filtros informados não é válido.</p>
      )}
      <FilterBar status={status} category={category} />
      <IncidentList incidents={incidents} audience="resident" />
    </AppShell>
  );
}
