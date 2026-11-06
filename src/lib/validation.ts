import { z } from "zod";
import { INCIDENT_CATEGORIES, INCIDENT_STATUSES } from "@/lib/domain";

const emailSchema = z
  .string()
  .trim()
  .email("Informe um e-mail válido.")
  .transform((email) => email.toLowerCase());

export const residentEmailSchema = emailSchema;

export const residentSchema = z.object({
  fullName: z.string().trim().min(2, "Informe o nome completo.").max(160),
  email: emailSchema,
  tower: z.string().trim().min(1, "Informe a torre.").max(80),
  apartment: z.string().trim().min(1, "Informe o apartamento.").max(80),
  phone: z
    .string()
    .trim()
    .max(40)
    .transform((phone) => phone || null),
});

export const incidentSchema = z.object({
  title: z.string().trim().min(3, "Informe um título com ao menos 3 caracteres.").max(160),
  description: z
    .string()
    .trim()
    .min(10, "Descreva a ocorrência com ao menos 10 caracteres.")
    .max(5000),
  category: z.enum(INCIDENT_CATEGORIES.map(({ value }) => value)),
  location: z.string().trim().min(2, "Informe o local.").max(160),
});

export const commentSchema = z.object({
  body: z.string().trim().min(1, "O comentário não pode ficar vazio.").max(2000),
});

export const statusSchema = z.enum(INCIDENT_STATUSES.map(({ value }) => value));

export const passwordSchema = z
  .string()
  .min(8, "A senha deve ter ao menos 8 caracteres.")
  .max(128);

export const idSchema = z.string().uuid("Identificador inválido.");
