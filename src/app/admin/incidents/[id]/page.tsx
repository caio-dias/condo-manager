import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import {
  addAdminCommentAction,
  deleteAdminCommentAction,
} from "@/app/_actions/incidents";
import { CommentForm } from "@/components/comment-form";
import { CommentDeleteForm } from "@/components/comment-delete-form";
import { AppShell } from "@/components/app-shell";
import { StatusForm } from "@/components/status-form";
import { getIncident } from "@/lib/data";
import { INCIDENT_CATEGORIES, INCIDENT_STATUSES } from "@/lib/domain";
import { requireAdmin } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminIncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  if (!isSupabaseConfigured()) redirect("/admin/login");
  await requireAdmin();
  const { id } = await params;
  const result = await getIncident(id);
  if (!result) notFound();

  const { incident, comments, photoUrl } = result;
  const category = INCIDENT_CATEGORIES.find(
    (item) => item.value === incident.category
  )?.label;
  const status = INCIDENT_STATUSES.find(
    (item) => item.value === incident.status
  );
  const commentAction = addAdminCommentAction.bind(null, incident.id);

  return (
    <AppShell audience="admin" active="incidents">
      <Link className="back-link" href="/admin/incidents">
        <ArrowLeft aria-hidden="true" size={16} /> Voltar às ocorrências
      </Link>
      <div className="detail-columns">
        <div>
          <section className="content-panel">
            <div className="incident-detail-head">
              <div>
                <h1>{incident.title}</h1>
                <p className="incident-meta">
                  <span>{category}</span>
                  <span>{incident.location}</span>
                  <span>{formatDate(incident.created_at)}</span>
                </p>
              </div>
              <span className={`status-pill status-${incident.status}`}>
                {status?.label}
              </span>
            </div>
            <p className="incident-description">{incident.description}</p>
            {photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="incident-photo"
                src={photoUrl}
                alt={`Foto da ocorrência: ${incident.title}`}
              />
            )}
            <dl className="resident-contact">
              <div>
                <dt>Morador</dt>
                <dd>{incident.resident.full_name}</dd>
              </div>
              <div>
                <dt>Unidade</dt>
                <dd>
                  Torre {incident.resident.tower}, ap.{" "}
                  {incident.resident.apartment}
                </dd>
              </div>
              <div>
                <dt>E-mail</dt>
                <dd>{incident.resident.email}</dd>
              </div>
              <div>
                <dt>Telefone</dt>
                <dd>{incident.resident.phone ?? "Não informado"}</dd>
              </div>
            </dl>
          </section>
          <section className="content-panel">
            <div className="section-title">
              <h2>Conversa</h2>
              <p>
                {comments.length}{" "}
                {comments.length === 1 ? "comentário" : "comentários"}
              </p>
            </div>
            <div className="comment-list">
              {comments.length ? (
                comments.map((comment) => (
                  <article className="comment-item" key={comment.id}>
                    <div className="comment-heading">
                      <div className="comment-author">
                        <strong>{comment.authorName}</strong>
                        <time dateTime={comment.created_at}>
                          {formatDate(comment.created_at)}
                        </time>
                      </div>
                      <CommentDeleteForm
                        action={deleteAdminCommentAction.bind(
                          null,
                          incident.id,
                          comment.id
                        )}
                      />
                    </div>
                    <p>{comment.body}</p>
                  </article>
                ))
              ) : (
                <div className="comment-empty-state">
                  <h3>Nenhum comentário ainda</h3>
                  <p>Adicione o primeiro comentário para iniciar a conversa.</p>
                </div>
              )}
            </div>
            <CommentForm action={commentAction} />
          </section>
        </div>
        <aside className="content-panel">
          <div className="section-title">
            <h2>Acompanhamento</h2>
            <p>Atualize o andamento para os moradores.</p>
          </div>
          <StatusForm
            incidentId={incident.id}
            currentStatus={incident.status}
          />
        </aside>
      </div>
    </AppShell>
  );
}
