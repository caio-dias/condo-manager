"use client";

import { useActionState } from "react";
import { createResidentAction } from "@/app/_actions/residents";
import { ActionFeedback } from "@/components/action-feedback";
import { SubmitButton } from "@/components/submit-button";

export function ResidentForm() {
  const [state, formAction] = useActionState(createResidentAction, undefined);

  return (
    <form action={formAction} className="resident-form">
      <label className="field">
        <span>Nome completo</span>
        <input autoComplete="name" name="fullName" maxLength={160} required />
      </label>
      <label className="field">
        <span>E-mail</span>
        <input autoComplete="email" name="email" type="email" maxLength={254} required />
      </label>
      <div className="field-row">
        <label className="field">
          <span>Torre</span>
          <input name="tower" maxLength={80} required />
        </label>
        <label className="field">
          <span>Apartamento</span>
          <input name="apartment" maxLength={80} required />
        </label>
      </div>
      <label className="field">
        <span>Telefone <small>(opcional)</small></span>
        <input autoComplete="tel" name="phone" type="tel" maxLength={40} />
      </label>
      <ActionFeedback state={state} />
      <div className="form-actions">
        <SubmitButton pendingLabel="Cadastrando...">Cadastrar morador</SubmitButton>
      </div>
    </form>
  );
}
