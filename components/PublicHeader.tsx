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
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(18px)",
        background:
          "linear-gradient(90deg, rgba(5,7,13,0.96), rgba(10,13,22,0.92))",
        borderBottom: "1px solid rgba(217,164,65,0.18)",
      }}
    >
      <div
        className="container"
        style={{
          minHeight: 92,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 24,
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div className="header-logo-frame">
              <Image
                src="/images/logo_rb.PNG"
                alt="Logo Roy Bondo Ministries"
                width={160}
                height={120}
                priority
                className="header-logo-img"
              />
            </div>

            <div>
              <span className="header-brand-name">Roy Bondo</span>
              <br />
              <span className="header-brand-ministry">Ministries</span>
            </div>
          </div>
        </Link>

        <nav
          style={{
            display: "flex",
            gap: 16,
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                color: "var(--cream)",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 900,
                opacity: 0.88,
                whiteSpace: "nowrap",
              }}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/appointment"
            className="btn btn-primary"
            style={{
              background:
                "linear-gradient(135deg, var(--gold-bright), var(--gold))",
              color: "#111827",
              borderColor: "rgba(217,164,65,0.55)",
              boxShadow: "0 14px 30px rgba(217,164,65,0.2)",
              whiteSpace: "nowrap",
            }}
          >
            Rendez-vous
          </Link>

          <Link
            href="/admin/login"
            className="btn btn-secondary"
            style={{
              color: "var(--cream)",
              borderColor: "rgba(217,164,65,0.28)",
              background: "rgba(255,255,255,0.035)",
              whiteSpace: "nowrap",
            }}
          >
            Espace privé
          </Link>
        </nav>
      </div>
    </header>
  );
}
