"use client";

import { useActionState } from "react";
import { createIncidentAction } from "@/app/_actions/incidents";
import { ActionFeedback } from "@/components/action-feedback";
import { SubmitButton } from "@/components/submit-button";
import { INCIDENT_CATEGORIES } from "@/lib/domain";

export function IncidentForm() {
  const [state, formAction] = useActionState(createIncidentAction, undefined);

  return (
    <form action={formAction} className="resident-form" encType="multipart/form-data">
      <label className="field">
        <span>Título</span>
        <input name="title" placeholder="Ex.: Vazamento no corredor" maxLength={160} required />
      </label>
      <label className="field">
        <span>O que aconteceu?</span>
        <textarea
          name="description"
          placeholder="Conte os detalhes que ajudam a administração a entender o problema."
          rows={5}
          maxLength={5000}
          required
        />
      </label>
      <label className="field">
        <span>Categoria</span>
        <select name="category" defaultValue="" required>
          <option value="" disabled>Escolha uma categoria</option>
          {INCIDENT_CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>{category.label}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Local</span>
        <input name="location" placeholder="Ex.: Hall da torre B" maxLength={160} required />
      </label>
      <label className="field">
        <span>Foto <small>(opcional)</small></span>
        <input
          accept="image/jpeg,image/png,image/webp"
          name="photo"
          type="file"
        />
        <small>JPEG, PNG ou WebP. Tamanho máximo de 5 MB.</small>
      </label>
      <ActionFeedback state={state} />
      <div className="form-actions">
        <SubmitButton pendingLabel="Registrando ocorrência...">Registrar ocorrência</SubmitButton>
      </div>
    </form>
  );
}
