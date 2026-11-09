"use client";

import { useActionState } from "react";
import type { ActionState } from "@/app/_actions/auth";
import { ActionFeedback } from "@/components/action-feedback";
import { SubmitButton } from "@/components/submit-button";

type CommentDeleteAction = (
  previousState: ActionState,
  formData: FormData
) => Promise<ActionState>;

export function CommentDeleteForm({ action }: { action: CommentDeleteAction }) {
  const [state, formAction] = useActionState(action, undefined);

  return (
    <form
      action={formAction}
      className="comment-delete-form"
      onSubmit={(event) => {
        if (
          !window.confirm(
            "Excluir permanentemente este comentário? Esta ação não pode ser desfeita."
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <SubmitButton variant="danger" pendingLabel="Excluindo...">
        Excluir
      </SubmitButton>
      <ActionFeedback state={state} />
    </form>
  );
}
