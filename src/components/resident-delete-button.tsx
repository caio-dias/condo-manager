"use client";

import { useActionState } from "react";
import { deleteResidentIncidentAction } from "@/app/_actions/incidents";
import { ActionFeedback } from "@/components/action-feedback";
import { SubmitButton } from "@/components/submit-button";

export function ResidentDeleteButton({ incidentId }: { incidentId: string }) {
  const [state, formAction] = useActionState(deleteResidentIncidentAction, undefined);

  return (
    <form
      action={formAction}
      className="delete-form"
      onSubmit={(event) => {
        if (!window.confirm("Excluir esta ocorrência e todos os comentários? Esta ação não pode ser desfeita.")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="incidentId" value={incidentId} />
      <ActionFeedback state={state} />
      <SubmitButton variant="danger">Excluir ocorrência</SubmitButton>
    </form>
  );
}
