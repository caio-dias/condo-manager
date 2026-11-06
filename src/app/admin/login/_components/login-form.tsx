"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  adminLoginAction,
  bootstrapLocalAdminAction,
} from "@/app/_actions/auth";
import { ActionFeedback } from "@/components/action-feedback";
import { SubmitButton } from "@/components/submit-button";

export function AdminLoginForm({
  isConfigured,
  canBootstrapLocally,
}: {
  isConfigured: boolean;
  canBootstrapLocally: boolean;
}) {
  const [loginState, loginAction] = useActionState(adminLoginAction, undefined);
  const [bootstrapState, bootstrapAction] = useActionState(
    bootstrapLocalAdminAction,
    undefined,
  );

  return (
    <div className="auth-card">
      <form action={loginAction} className="form-stack">
        <label className="field">
          <span>E-mail</span>
          <input autoComplete="username" name="email" type="email" required />
        </label>
        <label className="field">
          <span>Senha</span>
          <input autoComplete="current-password" name="password" type="password" required />
        </label>
        <ActionFeedback state={loginState} />
        <SubmitButton pendingLabel="Entrando...">Entrar no painel</SubmitButton>
      </form>

      {canBootstrapLocally && isConfigured && (
        <div className="local-bootstrap">
          <p>Primeiro acesso local: crie a conta temporária admin/admin.</p>
          <form action={bootstrapAction}>
            <ActionFeedback state={bootstrapState} />
            <SubmitButton variant="secondary" pendingLabel="Preparando acesso...">
              Preparar acesso local
            </SubmitButton>
          </form>
        </div>
      )}

      <p className="auth-switch">
        É morador? <Link href="/resident/access">Acessar portal do morador</Link>
      </p>
    </div>
  );
}
