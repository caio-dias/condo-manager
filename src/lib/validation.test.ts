import { describe, expect, it } from "vitest";
import { commentSchema, incidentSchema, passwordSchema, residentSchema, statusSchema } from "./validation";
import { ALLOWED_PHOTO_TYPES, getVerifiedPhotoType, MAX_PHOTO_BYTES } from "./image-validation";

describe("validações do domínio", () => {
  it("normaliza e-mails e aceita telefone opcional", () => {
    const resident = residentSchema.parse({
      fullName: " Maria Silva ",
      email: "  MARIA@EXEMPLO.COM ",
      tower: "A",
      apartment: "004",
      phone: "",
    });

    expect(resident.email).toBe("maria@exemplo.com");
    expect(resident.phone).toBeNull();
    expect(resident.apartment).toBe("004");
  });

  it("rejeita campos obrigatórios ausentes e e-mail inválido", () => {
    expect(
      residentSchema.safeParse({
        fullName: "",
        email: "not-an-email",
        tower: "",
        apartment: "",
        phone: "",
      }).success,
    ).toBe(false);
  });

  it("aceita categorias e status permitidos, rejeitando valores desconhecidos", () => {
    expect(
      incidentSchema.safeParse({
        title: "Lâmpada queimada",
        description: "A lâmpada do hall do segundo andar não acende.",
        category: "manutencao",
        location: "Hall da torre A",
      }).success,
    ).toBe(true);
    expect(statusSchema.safeParse("em_andamento").success).toBe(true);
    expect(statusSchema.safeParse("cancelada").success).toBe(false);
  });

  it("rejeita comentário vazio após remover espaços", () => {
    expect(commentSchema.safeParse({ body: "   " }).success).toBe(false);
  });

  it("exige senha própria com pelo menos oito caracteres", () => {
    expect(passwordSchema.safeParse("senha-curta").success).toBe(true);
    expect(passwordSchema.safeParse("1234567").success).toBe(false);
  });
});

describe("validação de fotos", () => {
  it("reconhece somente assinaturas JPEG, PNG e WebP", () => {
    expect(getVerifiedPhotoType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(
      getVerifiedPhotoType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    ).toBe("image/png");
    expect(
      getVerifiedPhotoType(
        new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]),
      ),
    ).toBe("image/webp");
    expect(getVerifiedPhotoType(new Uint8Array([0x25, 0x50, 0x44, 0x46]))).toBeNull();
  });

  it("mantém os formatos e limite aprovados no bucket", () => {
    expect(ALLOWED_PHOTO_TYPES).toEqual(["image/jpeg", "image/png", "image/webp"]);
    expect(MAX_PHOTO_BYTES).toBe(5 * 1024 * 1024);
  });
});
