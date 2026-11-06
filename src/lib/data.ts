import "server-only";

import type { Comment, Incident, IncidentCategory, IncidentStatus, Resident } from "@/lib/domain";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type IncidentWithResident = Incident & { resident: Resident };
export type CommentWithAuthor = Comment & { authorName: string };

export async function listIncidents(filters?: {
  status?: IncidentStatus;
  category?: IncidentCategory;
}) {
  const supabase = createSupabaseAdminClient();
  let query = supabase.from("incidents").select("*").order("created_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.category) query = query.eq("category", filters.category);

  const { data: incidents, error } = await query;
  if (error) throw new Error(`Não foi possível carregar as ocorrências: ${error.message}`);
  if (!incidents.length) return [] satisfies IncidentWithResident[];

  const residentIds = Array.from(new Set(incidents.map((incident) => incident.resident_id)));
  const { data: residents, error: residentsError } = await supabase
    .from("residents")
    .select("id, full_name, email, tower, apartment, phone")
    .in("id", residentIds);

  if (residentsError) {
    throw new Error(`Não foi possível carregar os moradores: ${residentsError.message}`);
  }

  const residentsById = new Map(residents.map((resident) => [resident.id, resident]));
  return incidents.flatMap((incident) => {
    const resident = residentsById.get(incident.resident_id);
    return resident ? [{ ...incident, resident }] : [];
  }) as IncidentWithResident[];
}

export async function listResidents() {
  const { data, error } = await createSupabaseAdminClient()
    .from("residents")
    .select("id, full_name, email, tower, apartment, phone, created_at")
    .order("full_name", { ascending: true });

  if (error) throw new Error(`Não foi possível carregar os moradores: ${error.message}`);
  return data;
}

export async function getIncident(id: string) {
  const supabase = createSupabaseAdminClient();
  const { data: incident, error } = await supabase
    .from("incidents")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Não foi possível carregar a ocorrência: ${error.message}`);
  if (!incident) return null;

  const { data: resident, error: residentError } = await supabase
    .from("residents")
    .select("id, full_name, email, tower, apartment, phone")
    .eq("id", incident.resident_id)
    .maybeSingle();

  if (residentError) {
    throw new Error(`Não foi possível carregar os dados do morador: ${residentError.message}`);
  }
  if (!resident) return null;

  let photoUrl: string | null = null;
  if (incident.photo_path) {
    const { data, error: photoError } = await supabase.storage
      .from("incident-photos")
      .createSignedUrl(incident.photo_path, 600);

    if (photoError) {
      throw new Error(`Não foi possível carregar a foto da ocorrência: ${photoError.message}`);
    }
    photoUrl = data.signedUrl;
  }

  const { data: comments, error: commentsError } = await supabase
    .from("comments")
    .select("*")
    .eq("incident_id", id)
    .order("created_at", { ascending: true });

  if (commentsError) {
    throw new Error(`Não foi possível carregar os comentários: ${commentsError.message}`);
  }

  const residentAuthorIds = Array.from(
    new Set(
      comments
        .map((comment) => comment.resident_author_id)
        .filter((authorId): authorId is string => Boolean(authorId)),
    ),
  );
  const authorNames = new Map<string, string>();

  if (residentAuthorIds.length) {
    const { data: authors, error: authorsError } = await supabase
      .from("residents")
      .select("id, full_name")
      .in("id", residentAuthorIds);

    if (authorsError) {
      throw new Error(`Não foi possível carregar autores dos comentários: ${authorsError.message}`);
    }
    authors.forEach((author) => authorNames.set(author.id, author.full_name));
  }

  const commentRecords = comments.map((comment) => ({
    ...comment,
    authorName: comment.resident_author_id
      ? authorNames.get(comment.resident_author_id) ?? "Morador"
      : "Administração",
  })) as CommentWithAuthor[];

  return { incident: { ...incident, resident } as IncidentWithResident, comments: commentRecords, photoUrl };
}

export async function getResidentIncidents(residentId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("incidents")
    .select("*")
    .eq("resident_id", residentId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Não foi possível carregar suas ocorrências: ${error.message}`);
  return data as Incident[];
}

export async function getResidentIncident(id: string, residentId: string) {
  const result = await getIncident(id);
  if (!result || result.incident.resident_id !== residentId) return null;
  return result;
}
