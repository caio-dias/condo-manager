import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { createHmac } from "node:crypto";
import type { Resident } from "@/lib/domain";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const RESIDENT_COOKIE = "condominio_resident";

function getSessionSecret() {
  const secret = process.env.RESIDENT_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("RESIDENT_SESSION_SECRET precisa ter ao menos 32 caracteres.");
  }
  return new TextEncoder().encode(secret);
}

export async function createResidentSession(residentId: string) {
  const token = await new SignJWT({ residentId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(residentId)
    .sign(getSessionSecret());

  const cookieStore = await cookies();
  cookieStore.set(RESIDENT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function clearResidentSession() {
  const cookieStore = await cookies();
  cookieStore.delete(RESIDENT_COOKIE);
}

export async function getResidentSession(): Promise<Resident | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(RESIDENT_COOKIE)?.value;
  if (!token) return null;

  let residentId: string;
  const secret = getSessionSecret();
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    if (typeof payload.residentId !== "string" || payload.sub !== payload.residentId) {
      return null;
    }
    residentId = payload.residentId;
  } catch {
    return null;
  }

  const { data, error } = await createSupabaseAdminClient()
    .from("residents")
    .select("id, full_name, email, tower, apartment, phone")
    .eq("id", residentId)
    .maybeSingle();

  if (error) {
    throw new Error(`Não foi possível validar a sessão do morador: ${error.message}`);
  }

  return data;
}

export function hashRateLimitKey(value: string) {
  const secret = process.env.RESIDENT_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("RESIDENT_SESSION_SECRET precisa ter ao menos 32 caracteres.");
  }
  return createHmac("sha256", secret).update(value).digest("hex");
}
