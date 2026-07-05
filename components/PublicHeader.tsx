import Image from "next/image";
import Link from "next/link";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/about", label: "À propos" },
  { href: "/teachings", label: "Enseignements" },
  { href: "/books", label: "Livres" },
  { href: "/agenda", label: "Agenda" },
  { href: "/testimonies", label: "Témoignages" },
];

export default function PublicHeader() {
  return (
    <header className="public-header">
      <div className="container public-header-inner">
        <Link href="/" className="public-brand-link">
          <div className="public-brand-logo header-logo-frame">
            <Image
              src="/images/logo_rb.png"
              alt="Logo Roy Bondo Ministries"
              width={160}
              height={120}
              priority
              className="header-logo-img"
            />
          </div>

          <div className="public-brand-text">
            <strong>Roy Bondo</strong>
            <span>Ministries</span>
          </div>
        </Link>

        <nav className="public-desktop-nav" aria-label="Navigation principale">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}

          <Link href="/appointment" className="public-header-btn primary">
            Rendez-vous
          </Link>

          <Link href="/admin/login" className="public-header-btn secondary">
            Espace privé
          </Link>
        </nav>
      </div>
    </header>
  );
}
