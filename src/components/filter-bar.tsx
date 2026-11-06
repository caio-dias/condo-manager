import { Filter } from "lucide-react";
import { INCIDENT_CATEGORIES, INCIDENT_STATUSES } from "@/lib/domain";

export function FilterBar({
  status,
  category,
}: {
  status?: string;
  category?: string;
}) {
  return (
    <form className="filter-bar" action="" method="get">
      <label className="filter-field">
        <span>Status</span>
        <select name="status" defaultValue={status ?? ""}>
          <option value="">Todos os status</option>
          {INCIDENT_STATUSES.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
      </label>
      <label className="filter-field">
        <span>Categoria</span>
        <select name="category" defaultValue={category ?? ""}>
          <option value="">Todas as categorias</option>
          {INCIDENT_CATEGORIES.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
      </label>
      <button className="button button-secondary filter-submit" type="submit">
        <Filter aria-hidden="true" size={17} />
        Filtrar
      </button>
    </form>
  );
}
