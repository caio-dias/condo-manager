import Link from "next/link";
import { ArrowUpRight, Building2, ClipboardList, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <main className="landing-page">
      <header className="landing-topbar">
        <Link className="brand" href="/">
          <Building2 aria-hidden="true" size={25} strokeWidth={2.2} />
          <span>CondoManager</span>
        </Link>
        <span className="landing-place">Residencial Aurora</span>
      </header>
      <section className="landing-content">
        <div className="landing-intro">
          <span className="landing-symbol"><Building2 aria-hidden="true" size={24} /></span>
          <p className="eyebrow">Residencial Aurora</p>
          <h1>Um lugar melhor começa com uma conversa.</h1>
          <p className="landing-description">
            Registre um problema, acompanhe o andamento e ajude a administração a cuidar do que
            importa no condomínio.
          </p>
        </div>
        <div className="portal-options">
          <Link className="portal-option" href="/resident/access">
            <span className="portal-option-icon"><ClipboardList aria-hidden="true" size={21} /></span>
            <span>
              <strong>Sou morador</strong>
              <small>Registrar ou acompanhar uma ocorrência</small>
            </span>
            <ArrowUpRight aria-hidden="true" size={20} />
          </Link>
          <Link className="portal-option" href="/admin/login">
            <span className="portal-option-icon"><ShieldCheck aria-hidden="true" size={21} /></span>
            <span>
              <strong>Sou da administração</strong>
              <small>Acessar o painel do condomínio</small>
            </span>
            <ArrowUpRight aria-hidden="true" size={20} />
          </Link>
        </div>
        <p className="landing-footnote">Um canal direto para cuidar da vida em comunidade.</p>
      </section>
    </main>
  );
}
