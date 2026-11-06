"use client";

import { useActionState } from "react";
import { ActionFeedback } from "@/components/action-feedback";
import { SubmitButton } from "@/components/submit-button";
import type { ActionState } from "@/app/_actions/auth";

type CommentAction = (
  previousState: ActionState,
  formData: FormData,
) => Promise<ActionState>;

export function CommentForm({ action }: { action: CommentAction }) {
  const [state, formAction] = useActionState(action, undefined);
  return (
    <form action={formAction} className="comment-form">
      <label className="field">
        <span>Escreva uma atualização ou comentário</span>
        <textarea name="body" rows={3} maxLength={2000} required />
      </label>
      <ActionFeedback state={state} />
      <div className="form-actions">
        <SubmitButton pendingLabel="Enviando...">Adicionar comentário</SubmitButton>
      </div>
    </form>
  );
}
