"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  clearResidentSession,
  createResidentSession,
  hashRateLimitKey,
} from "@/lib/resident-session";
import { passwordSchema, residentEmailSchema } from "@/lib/validation";

export type ActionState = { error?: string; success?: string } | undefined;

export async function adminLoginAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Informe o e-mail e a senha." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: "E-mail ou senha inválidos." };

  const { data: profile, error: profileError } = await createSupabaseAdminClient()
    .from("admin_profiles")
    .select("must_change_password")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (profileError) {
    await supabase.auth.signOut();
    console.error("Falha ao validar perfil administrativo.", profileError);
    return { error: "Não foi possível validar o acesso. Tente novamente." };
  }

  if (!profile) {
    await supabase.auth.signOut();
    return { error: "Esta conta não tem acesso ao painel administrativo." };
  }

  redirect(profile.must_change_password ? "/admin/change-password" : "/admin");
}

export async function bootstrapLocalAdminAction(
  _previousState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  if (
    process.env.NODE_ENV !== "development" ||
    process.env.ENABLE_LOCAL_ADMIN_BOOTSTRAP !== "true"
  ) {
    return { error: "A configuração inicial local não está habilitada." };
  }

  const admin = createSupabaseAdminClient();
  const { data: existingProfile, error: lookupError } = await admin
    .from("admin_profiles")
    .select("user_id")
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    console.error("Falha ao verificar a conta administrativa inicial.", lookupError);
    return { error: "Não foi possível verificar a configuração do Supabase." };
  }
  if (existingProfile) {
    return { error: "A conta administrativa inicial já foi configurada." };
  }

  const email = "admin@example.com";
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: "admin",
    email_confirm: true,
  });

  if (createError || !created.user) {
    console.error("Falha ao criar a conta administrativa local.", createError);
    return { error: "Não foi possível criar a conta inicial. Verifique a configuração local." };
  }

  const { error: profileError } = await admin.from("admin_profiles").insert({
    user_id: created.user.id,
    must_change_password: true,
  });

  if (profileError) {
    const { error: rollbackError } = await admin.auth.admin.deleteUser(created.user.id);
    if (rollbackError) {
      console.error("Falha ao remover usuário após erro no perfil inicial.", rollbackError);
    }
    console.error("Falha ao criar o perfil administrativo local.", profileError);
    return { error: "Não foi possível concluir a configuração inicial do administrador." };
  }

  const supabase = await createSupabaseServerClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: "admin",
  });
  if (signInError) {
    console.error("Conta local criada, mas o login automático falhou.", signInError);
    return { error: "Conta criada. Entre com admin@example.com e a senha temporária admin." };
  }

  redirect("/admin/change-password");
}

export async function changeAdminPasswordAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const password = passwordSchema.safeParse(String(formData.get("password") ?? ""));
  const confirmation = String(formData.get("confirmation") ?? "");
  if (!password.success) return { error: password.error.issues[0]?.message };
  if (password.data !== confirmation) return { error: "As senhas não coincidem." };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return { error: "Sua sessão expirou. Entre novamente." };

  const admin = createSupabaseAdminClient();
  const { data: profile, error: profileError } = await admin
    .from("admin_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Falha ao validar administrador na troca de senha.", profileError);
    return { error: "Não foi possível validar sua conta." };
  }
  if (!profile) return { error: "Esta conta não tem acesso administrativo." };

  const { error: passwordError } = await supabase.auth.updateUser({
    password: password.data,
  });
  if (passwordError) {
    console.error("Falha ao atualizar a senha administrativa.", passwordError);
    return { error: "Não foi possível atualizar a senha. Tente novamente." };
  }

  const { error: updateError } = await admin
    .from("admin_profiles")
    .update({ must_change_password: false })
    .eq("user_id", user.id);

  if (updateError) {
    console.error("Falha ao concluir a troca obrigatória de senha.", updateError);
    return {
      error:
        "A senha foi alterada, mas não foi possível concluir a configuração. Entre novamente e repita a troca.",
    };
  }

  redirect("/admin");
}

export async function adminLogoutAction() {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Falha ao encerrar sessão administrativa.", error);
    throw new Error("Não foi possível encerrar a sessão.");
  }
  redirect("/");
}

export async function residentAccessAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsedEmail = residentEmailSchema.safeParse(String(formData.get("email") ?? ""));
  if (!parsedEmail.success) return { error: "Informe um e-mail válido." };

  const requestHeaders = await headers();
  const clientIp =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    requestHeaders.get("x-real-ip") ??
    "unknown";
  const attemptKey = hashRateLimitKey(clientIp);
  const admin = createSupabaseAdminClient();
  const { data: allowed, error: rateLimitError } = await admin.rpc(
    "consume_resident_access_attempt",
    {
      p_attempt_key: attemptKey,
      p_max_attempts: 5,
      p_window_seconds: 900,
    },
  );

  if (rateLimitError) {
    console.error("Falha ao limitar tentativas de acesso do morador.", rateLimitError);
    return { error: "Não foi possível validar o acesso. Tente novamente." };
  }
  if (!allowed) {
    return { error: "Muitas tentativas. Aguarde 15 minutos e tente novamente." };
  }

  const { data: resident, error } = await admin
    .from("residents")
    .select("id")
    .eq("email", parsedEmail.data)
    .maybeSingle();

  if (error) {
    console.error("Falha ao localizar o cadastro do morador.", error);
    return { error: "Não foi possível validar o acesso. Tente novamente." };
  }
  if (!resident) {
    return { error: "E-mail não cadastrado. Procure a administração do condomínio." };
  }

  await createResidentSession(resident.id);
  redirect("/resident/incidents");
}

export async function residentLogoutAction() {
  await clearResidentSession();
  redirect("/");
}
