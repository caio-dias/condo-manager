"use client";

import Link from "next/link";
import { useActionState } from "react";
import { residentAccessAction } from "@/app/_actions/auth";
import { ActionFeedback } from "@/components/action-feedback";
import { SubmitButton } from "@/components/submit-button";

export function ResidentAccessForm({ isConfigured }: { isConfigured: boolean }) {
  const [state, formAction] = useActionState(residentAccessAction, undefined);

  return (
    <div className="auth-card">
      <form action={formAction} className="form-stack">
        <label className="field">
          <span>E-mail cadastrado pela administração</span>
          <input
            autoComplete="email"
            name="email"
            placeholder="voce@exemplo.com"
            type="email"
            required
          />
        </label>
        <p className="field-note">
          O acesso é feito pelo endereço informado, sem senha ou confirmação por e-mail.
        </p>
        <ActionFeedback state={state} />
        <SubmitButton disabled={!isConfigured} pendingLabel="Verificando...">
          Acessar ocorrências
        </SubmitButton>
      </form>
      <p className="auth-switch">
        Faz parte da equipe? <Link href="/admin/login">Acessar administração</Link>
      </p>
      {!isConfigured && (
        <p className="form-feedback form-feedback-error" role="status">
          O acesso ao portal será liberado após configurar o Supabase no ambiente.
        </p>
      )}
    </div>
  );
}
