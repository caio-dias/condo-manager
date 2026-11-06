"use client";

import { useActionState } from "react";
import { deleteResidentAction } from "@/app/_actions/residents";
import { ActionFeedback } from "@/components/action-feedback";
import { SubmitButton } from "@/components/submit-button";

export function ConfirmDeleteForm({
  residentId,
  residentName,
}: {
  residentId: string;
  residentName: string;
}) {
  const [state, formAction] = useActionState(deleteResidentAction, undefined);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Excluir ${residentName} e também todas as ocorrências, fotos e comentários associados? Esta ação não pode ser desfeita.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input name="residentId" type="hidden" value={residentId} />
      <ActionFeedback state={state} />
      <SubmitButton variant="danger" pendingLabel="Excluindo...">Excluir</SubmitButton>
    </form>
  );
}
