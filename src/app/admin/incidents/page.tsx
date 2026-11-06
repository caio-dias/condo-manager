import Link from "next/link";
import { connection } from "next/server";
import { Plus } from "lucide-react";
import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { FilterBar } from "@/components/filter-bar";
import { IncidentList } from "@/components/incident-list";
import { requireAdmin } from "@/lib/auth";
import { listIncidents } from "@/lib/data";
import { INCIDENT_CATEGORIES, INCIDENT_STATUSES } from "@/lib/domain";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

type SearchParams = Promise<{ status?: string; category?: string }>;

export default function AdminIncidentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense
      fallback={
        <main className="main-content">
          <p className="notice" role="status">Carregando ocorrências...</p>
        </main>
      }
    >
      <AdminIncidentsContent searchParams={searchParams} />
    </Suspense>
  );
}

async function AdminIncidentsContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await connection();
  if (!isSupabaseConfigured()) {
    return (
      <main className="main-content">
        <p className="notice">Configure o Supabase para abrir a lista de ocorrências.</p>
        <Link className="text-link" href="/admin/login">Voltar ao acesso administrativo</Link>
      </main>
    );
  }

  await requireAdmin();
  const params = await searchParams;
  const status = INCIDENT_STATUSES.find((item) => item.value === params.status)?.value;
  const category = INCIDENT_CATEGORIES.find((item) => item.value === params.category)?.value;
  const hasInvalidFilter =
    (params.status && !status) || (params.category && !category);
  const incidents = await listIncidents({ status, category });

  return (
    <AppShell audience="admin" active="incidents">
      <div className="page-heading">
        <div>
          <h1>Ocorrências</h1>
          <p>Acompanhe os relatos e atualizações do Residencial Aurora.</p>
        </div>
        <Link className="button button-primary" href="/admin/residents">
          <Plus aria-hidden="true" size={17} />
          Cadastrar morador
        </Link>
      </div>
      {hasInvalidFilter && (
        <p className="notice" role="alert">Um dos filtros informados não é válido.</p>
      )}
      <FilterBar status={status} category={category} />
      <IncidentList incidents={incidents} audience="admin" />
    </AppShell>
  );
}
