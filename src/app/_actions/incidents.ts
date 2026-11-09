"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminForAction } from "@/lib/auth";
import { getResidentSession } from "@/lib/resident-session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  ALLOWED_PHOTO_TYPES,
  getVerifiedPhotoType,
  MAX_PHOTO_BYTES,
} from "@/lib/image-validation";
import {
  commentSchema,
  idSchema,
  incidentSchema,
  statusSchema,
} from "@/lib/validation";
import type { ActionState } from "@/app/_actions/auth";

export async function createIncidentAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const resident = await getResidentSession();
  if (!resident)
    return { error: "Sua sessão terminou. Informe novamente seu e-mail." };

  const parsed = incidentSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    location: formData.get("location"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const file = formData.get("photo");
  if (file !== null && !(file instanceof File)) {
    return { error: "O arquivo enviado é inválido." };
  }

  let photoPath: string | null = null;
  const admin = createSupabaseAdminClient();

  if (file instanceof File && file.size > 0) {
    if (!(ALLOWED_PHOTO_TYPES as readonly string[]).includes(file.type)) {
      return { error: "A foto precisa ser JPEG, PNG ou WebP." };
    }
    if (file.size > MAX_PHOTO_BYTES) {
      return { error: "A foto deve ter no máximo 5 MB." };
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const verifiedType = getVerifiedPhotoType(bytes);
    if (!verifiedType || verifiedType !== file.type) {
      return {
        error:
          "O conteúdo do arquivo não corresponde a uma imagem JPEG, PNG ou WebP.",
      };
    }

    photoPath = `${resident.id}/${randomUUID()}`;
    const { error: uploadError } = await admin.storage
      .from("incident-photos")
      .upload(photoPath, bytes, {
        contentType: verifiedType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Falha ao enviar foto da ocorrência.", uploadError);
      return { error: "Não foi possível enviar a foto. Tente novamente." };
    }
  }

  const { data: incident, error } = await admin
    .from("incidents")
    .insert({
      resident_id: resident.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      location: parsed.data.location,
      photo_path: photoPath,
    })
    .select("id")
    .single();

  if (error || !incident) {
    console.error("Falha ao criar ocorrência.", error);
    if (photoPath) {
      const { error: cleanupError } = await admin.storage
        .from("incident-photos")
        .remove([photoPath]);
      if (cleanupError) {
        console.error(
          "Falha ao limpar foto após erro ao criar ocorrência.",
          cleanupError
        );
        return {
          error:
            "Não foi possível registrar a ocorrência nem limpar a foto enviada. Seus dados continuam no formulário; avise a administração sobre o arquivo pendente.",
        };
      }
    }
    return {
      error:
        "Não foi possível registrar a ocorrência. Seus dados continuam no formulário.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/incidents");
  revalidatePath("/resident/incidents");
  redirect(`/resident/incidents/${incident.id}`);
}

export async function addResidentCommentAction(
  incidentId: string,
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const resident = await getResidentSession();
  if (!resident)
    return { error: "Sua sessão terminou. Informe novamente seu e-mail." };
  const parsedId = idSchema.safeParse(incidentId);
  const parsedBody = commentSchema.safeParse({ body: formData.get("body") });
  if (!parsedId.success) return { error: "Ocorrência inválida." };
  if (!parsedBody.success)
    return { error: parsedBody.error.issues[0]?.message };

  const admin = createSupabaseAdminClient();
  const { data: incident, error: incidentError } = await admin
    .from("incidents")
    .select("id")
    .eq("id", parsedId.data)
    .maybeSingle();

  if (incidentError) {
    console.error(
      "Falha ao validar ocorrência para comentário.",
      incidentError
    );
    return { error: "Não foi possível enviar o comentário." };
  }
  if (!incident) return { error: "Esta ocorrência não está mais disponível." };

  const { error } = await admin.from("comments").insert({
    incident_id: incident.id,
    resident_author_id: resident.id,
    body: parsedBody.data.body,
  });

  if (error) {
    console.error("Falha ao salvar comentário de morador.", error);
    return { error: "Não foi possível enviar o comentário. Tente novamente." };
  }

  revalidatePath(`/resident/incidents/${incident.id}`);
  revalidatePath(`/admin/incidents/${incident.id}`);
  return { success: "Comentário adicionado." };
}

export async function addAdminCommentAction(
  incidentId: string,
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const adminSession = await requireAdminForAction();
  const parsedId = idSchema.safeParse(incidentId);
  const parsedBody = commentSchema.safeParse({ body: formData.get("body") });
  if (!parsedId.success) return { error: "Ocorrência inválida." };
  if (!parsedBody.success)
    return { error: parsedBody.error.issues[0]?.message };

  const client = createSupabaseAdminClient();
  const { data: incident, error: incidentError } = await client
    .from("incidents")
    .select("id")
    .eq("id", parsedId.data)
    .maybeSingle();

  if (incidentError) {
    console.error(
      "Falha ao validar ocorrência para comentário.",
      incidentError
    );
    return { error: "Não foi possível enviar o comentário." };
  }
  if (!incident) return { error: "Esta ocorrência não está mais disponível." };

  const { error } = await client.from("comments").insert({
    incident_id: incident.id,
    admin_author_id: adminSession.user.id,
    body: parsedBody.data.body,
  });

  if (error) {
    console.error("Falha ao salvar comentário administrativo.", error);
    return { error: "Não foi possível enviar o comentário. Tente novamente." };
  }

  revalidatePath(`/admin/incidents/${incident.id}`);
  revalidatePath(`/resident/incidents/${incident.id}`);
  return { success: "Comentário adicionado." };
}

export async function deleteResidentCommentAction(
  incidentId: string,
  commentId: string,
  _previousState: ActionState,
  _formData: FormData
): Promise<ActionState> {
  const resident = await getResidentSession();
  if (!resident)
    return { error: "Sua sessão terminou. Informe novamente seu e-mail." };

  const parsedIncidentId = idSchema.safeParse(incidentId);
  const parsedCommentId = idSchema.safeParse(commentId);
  if (!parsedIncidentId.success || !parsedCommentId.success) {
    return { error: "Comentário inválido." };
  }

  const { data: deletedComment, error } = await createSupabaseAdminClient()
    .from("comments")
    .delete()
    .eq("id", parsedCommentId.data)
    .eq("incident_id", parsedIncidentId.data)
    .eq("resident_author_id", resident.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Falha ao excluir comentário de morador.", error);
    return { error: "Não foi possível excluir o comentário. Tente novamente." };
  }
  if (!deletedComment) {
    return { error: "Este comentário não está mais disponível para exclusão." };
  }

  revalidatePath(`/admin/incidents/${parsedIncidentId.data}`);
  revalidatePath(`/resident/incidents/${parsedIncidentId.data}`);
  return { success: "Comentário excluído." };
}

export async function deleteAdminCommentAction(
  incidentId: string,
  commentId: string,
  _previousState: ActionState,
  _formData: FormData
): Promise<ActionState> {
  await requireAdminForAction();

  const parsedIncidentId = idSchema.safeParse(incidentId);
  const parsedCommentId = idSchema.safeParse(commentId);
  if (!parsedIncidentId.success || !parsedCommentId.success) {
    return { error: "Comentário inválido." };
  }

  const { data: deletedComment, error } = await createSupabaseAdminClient()
    .from("comments")
    .delete()
    .eq("id", parsedCommentId.data)
    .eq("incident_id", parsedIncidentId.data)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Falha ao excluir comentário administrativo.", error);
    return { error: "Não foi possível excluir o comentário. Tente novamente." };
  }
  if (!deletedComment) {
    return { error: "Este comentário não está mais disponível para exclusão." };
  }

  revalidatePath(`/admin/incidents/${parsedIncidentId.data}`);
  revalidatePath(`/resident/incidents/${parsedIncidentId.data}`);
  return { success: "Comentário excluído." };
}

export async function updateIncidentStatusAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdminForAction();
  const incidentId = idSchema.safeParse(
    String(formData.get("incidentId") ?? "")
  );
  const status = statusSchema.safeParse(String(formData.get("status") ?? ""));
  if (!incidentId.success || !status.success) {
    return { error: "Ocorrência ou status inválido." };
  }

  const { error } = await createSupabaseAdminClient()
    .from("incidents")
    .update({ status: status.data, updated_at: new Date().toISOString() })
    .eq("id", incidentId.data);

  if (error) {
    console.error("Falha ao atualizar status da ocorrência.", error);
    return {
      error:
        "Não foi possível atualizar o status. O valor anterior foi mantido.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/incidents");
  revalidatePath(`/admin/incidents/${incidentId.data}`);
  revalidatePath("/resident/incidents");
  revalidatePath(`/resident/incidents/${incidentId.data}`);
  return { success: "Status atualizado." };
}

export async function deleteResidentIncidentAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const resident = await getResidentSession();
  if (!resident)
    return { error: "Sua sessão terminou. Informe novamente seu e-mail." };

  const incidentId = idSchema.safeParse(
    String(formData.get("incidentId") ?? "")
  );
  if (!incidentId.success) return { error: "Ocorrência inválida." };
  const admin = createSupabaseAdminClient();
  const { data: incident, error: lookupError } = await admin
    .from("incidents")
    .select("id, resident_id, photo_path")
    .eq("id", incidentId.data)
    .maybeSingle();

  if (lookupError) {
    console.error("Falha ao validar exclusão da ocorrência.", lookupError);
    return { error: "Não foi possível excluir a ocorrência." };
  }
  if (!incident || incident.resident_id !== resident.id) {
    return { error: "Esta ocorrência não está disponível para exclusão." };
  }

  if (incident.photo_path) {
    const { error: storageError } = await admin.storage
      .from("incident-photos")
      .remove([incident.photo_path]);

    if (storageError) {
      console.error("Falha ao remover foto da ocorrência.", storageError);
      return {
        error:
          "A ocorrência foi mantida porque sua foto não pôde ser removida.",
      };
    }

    const { error: pathError } = await admin
      .from("incidents")
      .update({ photo_path: null })
      .eq("id", incident.id);

    if (pathError) {
      console.error("Falha ao atualizar caminho da foto removida.", pathError);
      return {
        error:
          "A foto foi removida, mas a ocorrência foi mantida. A exclusão não foi concluída.",
      };
    }
  }

  const { error } = await admin
    .from("incidents")
    .delete()
    .eq("id", incident.id);
  if (error) {
    console.error("Falha ao excluir ocorrência.", error);
    return {
      error:
        "Não foi possível excluir a ocorrência. Ela foi mantida e poderá ser excluída novamente.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/incidents");
  revalidatePath("/resident/incidents");
  redirect("/resident/incidents");
}
