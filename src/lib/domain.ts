export const INCIDENT_CATEGORIES = [
  { value: "manutencao", label: "Manutenção / infraestrutura" },
  { value: "limpeza", label: "Limpeza" },
  { value: "ruido", label: "Ruído / convivência" },
  { value: "seguranca", label: "Segurança" },
  { value: "areas_comuns", label: "Áreas comuns" },
  { value: "outro", label: "Outro" },
] as const;

export const INCIDENT_STATUSES = [
  { value: "aberta", label: "Aberta" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "resolvida", label: "Resolvida" },
] as const;

export type IncidentCategory = (typeof INCIDENT_CATEGORIES)[number]["value"];
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number]["value"];

export type Resident = {
  id: string;
  full_name: string;
  email: string;
  tower: string;
  apartment: string;
  phone: string | null;
};

export type Incident = {
  id: string;
  resident_id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  location: string;
  status: IncidentStatus;
  photo_path: string | null;
  created_at: string;
  updated_at: string;
};

export type Comment = {
  id: string;
  incident_id: string;
  resident_author_id: string | null;
  admin_author_id: string | null;
  body: string;
  created_at: string;
};
