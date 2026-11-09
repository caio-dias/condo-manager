import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createSupabaseAdminClient: vi.fn(),
  from: vi.fn(),
  getResidentSession: vi.fn(),
  requireAdminForAction: vi.fn(),
  revalidatePath: vi.fn(),
  query: {
    delete: vi.fn(),
    eq: vi.fn(),
    select: vi.fn(),
    maybeSingle: vi.fn(),
  },
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/auth", () => ({
  requireAdminForAction: mocks.requireAdminForAction,
}));
vi.mock("@/lib/resident-session", () => ({
  getResidentSession: mocks.getResidentSession,
}));
vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: mocks.createSupabaseAdminClient,
}));

import {
  deleteAdminCommentAction,
  deleteResidentCommentAction,
} from "@/app/_actions/incidents";

const incidentId = "11111111-1111-4111-8111-111111111111";
const commentId = "22222222-2222-4222-8222-222222222222";
const residentId = "33333333-3333-4333-8333-333333333333";
const formData = new FormData();

describe("ações de exclusão de comentários", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.query.delete.mockReturnValue(mocks.query);
    mocks.query.eq.mockReturnValue(mocks.query);
    mocks.query.select.mockReturnValue(mocks.query);
    mocks.from.mockReturnValue(mocks.query);
    mocks.createSupabaseAdminClient.mockReturnValue({ from: mocks.from });
    mocks.query.maybeSingle.mockResolvedValue({
      data: { id: commentId },
      error: null,
    });
    mocks.getResidentSession.mockResolvedValue({ id: residentId });
    mocks.requireAdminForAction.mockResolvedValue({
      user: { id: "admin-user" },
    });
  });

  it("permite ao morador excluir somente comentário próprio na ocorrência informada", async () => {
    const result = await deleteResidentCommentAction(
      incidentId,
      commentId,
      undefined,
      formData
    );

    expect(result).toEqual({ success: "Comentário excluído." });
    expect(mocks.query.eq).toHaveBeenNthCalledWith(1, "id", commentId);
    expect(mocks.query.eq).toHaveBeenNthCalledWith(
      2,
      "incident_id",
      incidentId
    );
    expect(mocks.query.eq).toHaveBeenNthCalledWith(
      3,
      "resident_author_id",
      residentId
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      `/admin/incidents/${incidentId}`
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      `/resident/incidents/${incidentId}`
    );
  });

  it("não acessa o banco quando a sessão do morador terminou", async () => {
    mocks.getResidentSession.mockResolvedValue(null);

    const result = await deleteResidentCommentAction(
      incidentId,
      commentId,
      undefined,
      formData
    );

    expect(result?.error).toMatch(/sessão terminou/i);
    expect(mocks.createSupabaseAdminClient).not.toHaveBeenCalled();
  });

  it("não informa sucesso quando o comentário não pertence ao morador ou já foi removido", async () => {
    mocks.query.maybeSingle.mockResolvedValue({ data: null, error: null });

    const result = await deleteResidentCommentAction(
      incidentId,
      commentId,
      undefined,
      formData
    );

    expect(result?.error).toMatch(/não está mais disponível/i);
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("permite à administração excluir qualquer comentário", async () => {
    const result = await deleteAdminCommentAction(
      incidentId,
      commentId,
      undefined,
      formData
    );

    expect(result).toEqual({ success: "Comentário excluído." });
    expect(mocks.requireAdminForAction).toHaveBeenCalledOnce();
    expect(mocks.query.eq).toHaveBeenNthCalledWith(1, "id", commentId);
    expect(mocks.query.eq).toHaveBeenNthCalledWith(
      2,
      "incident_id",
      incidentId
    );
    expect(mocks.query.eq).toHaveBeenCalledTimes(2);
  });

  it("não executa a exclusão administrativa sem autorização", async () => {
    mocks.requireAdminForAction.mockRejectedValue(
      new Error("Acesso restrito.")
    );

    await expect(
      deleteAdminCommentAction(incidentId, commentId, undefined, formData)
    ).rejects.toThrow("Acesso restrito.");
    expect(mocks.createSupabaseAdminClient).not.toHaveBeenCalled();
  });

  it("retorna erro explícito e registra falha de persistência", async () => {
    const databaseError = new Error("database unavailable");
    const logError = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.query.maybeSingle.mockResolvedValue({
      data: null,
      error: databaseError,
    });

    const result = await deleteAdminCommentAction(
      incidentId,
      commentId,
      undefined,
      formData
    );

    expect(result?.error).toMatch(/não foi possível excluir/i);
    expect(logError).toHaveBeenCalledWith(
      "Falha ao excluir comentário administrativo.",
      databaseError
    );
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
    logError.mockRestore();
  });

  it("rejeita identificadores inválidos antes de acessar o banco", async () => {
    const result = await deleteAdminCommentAction(
      "invalid",
      commentId,
      undefined,
      formData
    );

    expect(result?.error).toMatch(/comentário inválido/i);
    expect(mocks.createSupabaseAdminClient).not.toHaveBeenCalled();
  });
});
