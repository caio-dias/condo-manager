"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminForAction } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { idSchema, residentSchema } from "@/lib/validation";
import type { ActionState } from "@/app/_actions/auth";

export async function createResidentAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdminForAction();
  const parsed = residentSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    tower: formData.get("tower"),
    apartment: formData.get("apartment"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const { error } = await createSupabaseAdminClient().from("residents").insert({
    full_name: parsed.data.fullName,
    email: parsed.data.email,
    tower: parsed.data.tower,
    apartment: parsed.data.apartment,
    phone: parsed.data.phone,
  });

  if (error?.code === "23505") {
    return { error: "Já existe um morador cadastrado com esse e-mail." };
  }
  if (error) {
    console.error("Falha ao cadastrar morador.", error);
    return { error: "Não foi possível cadastrar o morador. Tente novamente." };
  }

  revalidatePath("/admin/residents");
  redirect("/admin/residents");
}

export async function deleteResidentAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdminForAction();
  const parsedResidentId = idSchema.safeParse(String(formData.get("residentId") ?? ""));
  if (!parsedResidentId.success) return { error: "Morador inválido." };
  const residentId = parsedResidentId.data;
  const admin = createSupabaseAdminClient();
  const { data: incidents, error: incidentsError } = await admin
    .from("incidents")
    .select("id, photo_path")
    .eq("resident_id", residentId);

  if (incidentsError) {
    console.error("Falha ao preparar exclusão do morador.", incidentsError);
    return { error: "Não foi possível excluir o morador." };
  }

  for (const incident of incidents) {
    if (!incident.photo_path) continue;

    const { error: storageError } = await admin.storage
      .from("incident-photos")
      .remove([incident.photo_path]);

    if (storageError) {
      console.error("Falha ao remover foto de ocorrência do morador.", storageError);
      return {
        error: "O morador não foi excluído porque uma foto associada não pôde ser removida.",
      };
    }

    const { error: pathError } = await admin
      .from("incidents")
      .update({ photo_path: null })
      .eq("id", incident.id);

    if (pathError) {
      console.error("Falha ao atualizar caminho de foto removida.", pathError);
      return {
        error: "A foto foi removida, mas o cadastro foi mantido. A exclusão não foi concluída.",
      };
    }
  }

  const { error } = await admin.from("residents").delete().eq("id", residentId);
  if (error) {
    console.error("Falha ao excluir morador após remover suas fotos.", error);
    return {
      error: "As fotos foram removidas, mas o morador e suas ocorrências foram mantidos. Tente novamente.",
    };
  }

  revalidatePath("/admin/residents");
  revalidatePath("/admin");
  return { success: "Morador e registros associados excluídos." };
}
