import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import { INCIDENT_CATEGORIES, INCIDENT_STATUSES, type IncidentStatus } from "@/lib/domain";
import type { IncidentWithResident } from "@/lib/data";

function getCategoryLabel(value: string) {
  return INCIDENT_CATEGORIES.find((category) => category.value === value)?.label ?? value;
}

function getStatusLabel(value: IncidentStatus) {
  return INCIDENT_STATUSES.find((status) => status.value === value)?.label ?? value;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function IncidentList({
  incidents,
  audience,
}: {
  incidents: IncidentWithResident[];
  audience: "admin" | "resident";
}) {
  if (!incidents.length) {
    return (
      <div className="empty-state">
        <div className="empty-mark" aria-hidden="true">
          <MapPin size={22} />
        </div>
        <h2>Nenhuma ocorrência por aqui</h2>
        <p>Quando um morador registrar um problema, ele aparecerá nesta lista.</p>
        {audience === "resident" && (
          <Link className="text-link" href="/resident/incidents/new">
            Registrar uma ocorrência
          </Link>
        )}
      </div>
    );
  }

  const basePath = audience === "admin" ? "/admin/incidents" : "/resident/incidents";

  return (
    <div className="incident-table-wrap">
      <table className="incident-table">
        <thead>
          <tr>
            <th scope="col">Ocorrência</th>
            <th scope="col">Local</th>
            <th scope="col">Morador</th>
            <th scope="col">Data</th>
            <th scope="col">Status</th>
            <th scope="col"><span className="sr-only">Abrir</span></th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((incident) => (
            <tr key={incident.id}>
              <td>
                <Link className="incident-title-link" href={`${basePath}/${incident.id}`}>
                  <strong>{incident.title}</strong>
                  <span>{getCategoryLabel(incident.category)}</span>
                </Link>
              </td>
              <td className="table-location">{incident.location}</td>
              <td>
                <span className="table-resident">{incident.resident.full_name}</span>
                <span className="table-unit">
                  Torre {incident.resident.tower}, ap. {incident.resident.apartment}
                </span>
              </td>
              <td className="table-date">{formatDate(incident.created_at)}</td>
              <td>
                <span className={`status-pill status-${incident.status}`}>
                  {getStatusLabel(incident.status)}
                </span>
              </td>
              <td>
                <Link
                  className="row-link"
                  href={`${basePath}/${incident.id}`}
                  aria-label={`Abrir ${incident.title}`}
                >
                  <ChevronRight aria-hidden="true" size={18} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="incident-cards">
        {incidents.map((incident) => (
          <Link
            className="incident-mobile-card"
            href={`${basePath}/${incident.id}`}
            key={incident.id}
          >
            <div className="mobile-card-heading">
              <span className={`status-pill status-${incident.status}`}>
                {getStatusLabel(incident.status)}
              </span>
              <ChevronRight aria-hidden="true" size={18} />
            </div>
            <strong>{incident.title}</strong>
            <span>{getCategoryLabel(incident.category)}</span>
            <small>
              Torre {incident.resident.tower}, ap. {incident.resident.apartment} ·{" "}
              {incident.location}
            </small>
          </Link>
        ))}
      </div>
      <div className="table-footer">
        <span>
          {incidents.length} {incidents.length === 1 ? "ocorrência" : "ocorrências"}
        </span>
        <span>Mais recentes primeiro</span>
      </div>
    </div>
  );
}
