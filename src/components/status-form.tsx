"use client";

import { useActionState } from "react";
import { updateIncidentStatusAction } from "@/app/_actions/incidents";
import { ActionFeedback } from "@/components/action-feedback";
import { SubmitButton } from "@/components/submit-button";
import { INCIDENT_STATUSES } from "@/lib/domain";

export function StatusForm({
  incidentId,
  currentStatus,
}: {
  incidentId: string;
  currentStatus: string;
}) {
  const [state, formAction] = useActionState(updateIncidentStatusAction, undefined);
  return (
    <form action={formAction} className="status-form">
      <input name="incidentId" type="hidden" value={incidentId} />
      <label className="field">
        <span>Status da ocorrência</span>
        <select name="status" defaultValue={currentStatus}>
          {INCIDENT_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>
      </label>
      <ActionFeedback state={state} />
      <SubmitButton pendingLabel="Atualizando...">Atualizar status</SubmitButton>
    </form>
  );
}
