import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getAdminSession() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data: profile, error } = await createSupabaseAdminClient()
    .from("admin_profiles")
    .select("user_id, must_change_password")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Não foi possível validar o acesso administrativo: ${error.message}`);
  }

  return profile ? { user, profile } : null;
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (session.profile.must_change_password) redirect("/admin/change-password");
  return session;
}

export async function requireAdminForAction() {
  const session = await getAdminSession();
  if (!session) throw new Error("Acesso restrito à administração.");
  if (session.profile.must_change_password) {
    throw new Error("Defina uma nova senha antes de usar o painel.");
  }
  return session;
}
