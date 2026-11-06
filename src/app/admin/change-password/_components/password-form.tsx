"use client";

import { useActionState } from "react";
import { changeAdminPasswordAction } from "@/app/_actions/auth";
import { ActionFeedback } from "@/components/action-feedback";
import { SubmitButton } from "@/components/submit-button";

export function PasswordForm() {
  const [state, formAction] = useActionState(changeAdminPasswordAction, undefined);

  return (
    <form action={formAction} className="form-stack">
      <label className="field">
        <span>Nova senha</span>
        <input autoComplete="new-password" name="password" type="password" minLength={8} required />
        <small>Use ao menos 8 caracteres.</small>
      </label>
      <label className="field">
        <span>Confirme a nova senha</span>
        <input
          autoComplete="new-password"
          name="confirmation"
          type="password"
          minLength={8}
          required
        />
      </label>
      <ActionFeedback state={state} />
      <SubmitButton pendingLabel="Atualizando senha...">Salvar nova senha</SubmitButton>
    </form>
  );
}
