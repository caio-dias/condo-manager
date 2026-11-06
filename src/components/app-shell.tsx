import Link from "next/link";
import {
  Building2,
  ClipboardList,
  House,
  LogOut,
  Plus,
  UsersRound,
} from "lucide-react";
import { adminLogoutAction, residentLogoutAction } from "@/app/_actions/auth";

type AppShellProps = {
  children: React.ReactNode;
  audience: "admin" | "resident";
  active?: "overview" | "incidents" | "residents";
  residentName?: string;
};

export function AppShell({ children, audience, active, residentName }: AppShellProps) {
  const isAdmin = audience === "admin";
  const navItems = isAdmin
    ? [
        { href: "/admin", label: "Visão geral", icon: House, key: "overview" },
        { href: "/admin/incidents", label: "Ocorrências", icon: ClipboardList, key: "incidents" },
        { href: "/admin/residents", label: "Moradores", icon: UsersRound, key: "residents" },
      ]
    : [
        { href: "/resident/incidents", label: "Ocorrências", icon: ClipboardList, key: "incidents" },
        { href: "/resident/incidents/new", label: "Nova ocorrência", icon: Plus, key: "new" },
      ];

  return (
    <div className={`app-frame app-frame-${audience}`}>
      <header className="topbar">
        <Link className="brand" href={isAdmin ? "/admin" : "/resident/incidents"}>
          <Building2 aria-hidden="true" size={25} strokeWidth={2.2} />
          <span>CondoManager</span>
        </Link>
        <div className="topbar-account">
          <span>{isAdmin ? "Administração" : residentName}</span>
          <form action={isAdmin ? adminLogoutAction : residentLogoutAction}>
            <button className="icon-button" type="submit" aria-label="Sair">
              <LogOut aria-hidden="true" size={19} />
            </button>
          </form>
        </div>
      </header>

      <div className="app-body">
        <aside className="sidebar">
          <div className="building-mark" aria-hidden="true">
            <Building2 size={26} />
          </div>
          <p className="building-name">Residencial Aurora</p>
          <p className="building-role">{isAdmin ? "Administração" : "Área do morador"}</p>
          {isAdmin ? (
            <Link className="button button-primary sidebar-cta" href="/admin/residents">
              <Plus aria-hidden="true" size={18} />
              Cadastrar morador
            </Link>
          ) : (
            <Link className="button button-primary sidebar-cta" href="/resident/incidents/new">
              <Plus aria-hidden="true" size={18} />
              Nova ocorrência
            </Link>
          )}

          <nav className="sidebar-nav" aria-label="Navegação principal">
            {navItems.map(({ href, label, icon: Icon, key }) => (
              <Link
                className={`nav-link ${active === key ? "nav-link-active" : ""}`}
                href={href}
                key={key}
              >
                <Icon aria-hidden="true" size={19} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          <div className="sidebar-bottom">
            <p>Um canal claro para cuidar do lugar onde vivemos.</p>
            <span>Residencial Aurora</span>
          </div>
        </aside>

        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
