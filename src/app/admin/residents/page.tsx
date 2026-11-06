import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeft, UsersRound } from "lucide-react";
import { ConfirmDeleteForm } from "@/components/confirm-delete-form";
import { AppShell } from "@/components/app-shell";
import { ResidentForm } from "@/app/admin/residents/_components/resident-form";
import { requireAdmin } from "@/lib/auth";
import { listResidents } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export default async function AdminResidentsPage() {
  await connection();
  if (!isSupabaseConfigured()) {
    return (
      <main className="main-content">
        <p className="notice">Configure o Supabase para gerenciar moradores.</p>
        <Link className="text-link" href="/admin/login">Voltar ao acesso administrativo</Link>
      </main>
    );
  }

  await requireAdmin();
  const residents = await listResidents();

  return (
    <AppShell audience="admin" active="residents">
      <Link className="back-link" href="/admin/incidents">
        <ArrowLeft aria-hidden="true" size={16} /> Voltar às ocorrências
      </Link>
      <div className="page-heading">
        <div>
          <h1>Cadastro de moradores</h1>
          <p>Somente moradores cadastrados podem acessar o portal pelo e-mail.</p>
        </div>
      </div>

      <section className="content-panel">
        <div className="section-title">
          <h2>Novo morador</h2>
          <p>Nome, e-mail, torre e apartamento são obrigatórios.</p>
        </div>
        <ResidentForm />
      </section>

      <section className="content-panel">
        <div className="section-title">
          <h2>Moradores cadastrados</h2>
          <p>{residents.length} {residents.length === 1 ? "cadastro" : "cadastros"}</p>
        </div>
        {residents.length ? (
          <div className="resident-table-scroll">
            <table className="resident-table">
              <thead>
                <tr>
                  <th scope="col">Morador</th>
                  <th scope="col">Unidade</th>
                  <th scope="col">Telefone</th>
                  <th scope="col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {residents.map((resident) => (
                  <tr key={resident.id}>
                    <td>
                      <strong>{resident.full_name}</strong>
                      <small>{resident.email}</small>
                    </td>
                    <td>
                      Torre {resident.tower}, ap. {resident.apartment}
                    </td>
                    <td>{resident.phone ?? "Não informado"}</td>
                    <td>
                      <ConfirmDeleteForm
                        residentId={resident.id}
                        residentName={resident.full_name}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-mark"><UsersRound aria-hidden="true" size={21} /></div>
            <h2>Nenhum morador cadastrado</h2>
            <p>Cadastre o primeiro morador para liberar o acesso ao portal.</p>
          </div>
        )}
      </section>
    </AppShell>
  );
}
