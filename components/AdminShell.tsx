"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "../lib/supabase/browser";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  HeartHandshake,
  Home,
  LayoutDashboard,
  LogOut,
  Mail,
  Megaphone,
  MessageCircleHeart,
  Send,
  Video,
} from "lucide-react";

type AdminLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const adminLinks: AdminLink[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/prayers", label: "Prières", icon: HeartHandshake },
  { href: "/admin/testimonies", label: "Témoignages", icon: MessageCircleHeart },
  { href: "/admin/appointments", label: "Rendez-vous", icon: CalendarDays },
  { href: "/admin/invitations", label: "Invitations", icon: Send },
  { href: "/admin/encouragements", label: "Encouragements", icon: Mail },
  { href: "/admin/publications", label: "Publications", icon: Megaphone },
  { href: "/admin/teachings", label: "Enseignements", icon: Video },
  { href: "/admin/agenda", label: "Agenda", icon: ClipboardList },
  { href: "/admin/books", label: "Livres", icon: BookOpen },
];

export default function AdminShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <main className="admin-page">
      <style>{`
        @keyframes adminSidebarGlow {
          0% { transform: translateY(-12%); opacity: .45; }
          50% { transform: translateY(8%); opacity: .9; }
          100% { transform: translateY(-12%); opacity: .45; }
        }

        @keyframes adminFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        .admin-page {
          --text: #1f2937;
          --cream: #1f2937;
          --muted: #6b7280;
          --gold: #d9a441;
          --gold-bright: #c88a20;
          --line-gold: rgba(217, 164, 65, 0.22);
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(217,164,65,0.20), transparent 32%),
            radial-gradient(circle at top right, rgba(190,24,93,0.10), transparent 30%),
            linear-gradient(135deg, #fffdf7, #f8fafc 48%, #fff7e6);
          color: #1f2937;
        }

        .admin-page .card {
          background: rgba(255,255,255,0.84) !important;
          border: 1px solid rgba(217,164,65,0.22) !important;
          box-shadow: 0 22px 55px rgba(15,23,42,0.08) !important;
          color: #1f2937 !important;
        }

        .admin-page .input,
        .admin-page .select,
        .admin-page .textarea {
          background: #ffffff !important;
          color: #111827 !important;
          border: 1px solid rgba(148,163,184,0.42) !important;
        }

        .admin-page .label {
          color: #4b5563 !important;
        }

        .admin-shell-sidebar {
          position: fixed;
          inset: 0 auto 0 0;
          width: 318px;
          overflow: hidden;
          border-right: 1px solid rgba(217,164,65,0.25);
          background:
            linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,247,230,0.94)),
            radial-gradient(circle at top, rgba(217,164,65,0.22), transparent 38%);
          box-shadow: 18px 0 60px rgba(15,23,42,0.08);
          z-index: 30;
        }

        .admin-shell-sidebar::before {
          content: "";
          position: absolute;
          inset: -160px -80px auto auto;
          width: 230px;
          height: 520px;
          background: linear-gradient(180deg, rgba(217,164,65,0.20), rgba(190,24,93,0.08), transparent);
          filter: blur(12px);
          animation: adminSidebarGlow 8s ease-in-out infinite;
          pointer-events: none;
        }

        .admin-shell-inner {
          position: relative;
          z-index: 1;
          height: 100%;
          overflow-y: auto;
          padding: 24px;
        }

        .admin-brand-logo {
          animation: adminFloat 5s ease-in-out infinite;
        }

        .admin-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: #374151;
          border: 1px solid rgba(217,164,65,0.16);
          border-radius: 18px;
          padding: 14px 15px;
          background: rgba(255,255,255,0.64);
          font-weight: 900;
          transition: .2s ease;
          box-shadow: 0 8px 24px rgba(15,23,42,0.04);
        }

        .admin-nav-link:hover {
          transform: translateX(5px);
          background: rgba(255,247,230,0.95);
          border-color: rgba(217,164,65,0.36);
        }

        .admin-nav-link.active {
          color: #111827;
          background: linear-gradient(135deg, #f6c453, #d9a441);
          border-color: rgba(217,164,65,0.60);
          box-shadow: 0 14px 32px rgba(217,164,65,0.20);
        }

        .admin-shell-main {
          margin-left: 318px;
          min-height: 100vh;
        }

        .admin-topbar {
          min-height: 104px;
          border-bottom: 1px solid rgba(217,164,65,0.20);
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(18px);
          padding: 24px 36px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          position: sticky;
          top: 0;
          z-index: 20;
        }

        @media (max-width: 1050px) {
          .admin-shell-sidebar {
            position: relative;
            width: 100%;
            height: auto;
          }

          .admin-shell-inner {
            height: auto;
          }

          .admin-shell-main {
            margin-left: 0;
          }

          .admin-topbar {
            position: relative;
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      <aside className="admin-shell-sidebar">
        <div className="admin-shell-inner">
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                className="header-logo-frame admin-brand-logo"
                style={{ width: 86, height: 76 }}
              >
                <Image
                  src="/images/logo_rb.PNG"
                  alt="RB Ministries"
                  width={160}
                  height={120}
                  className="header-logo-img"
                  priority
                  style={{ width: 72, height: 62 }}
                />
              </div>

              <div>
                <strong
                  style={{
                    color: "#1f2937",
                    display: "block",
                    fontSize: 19,
                    lineHeight: 1.12,
                  }}
                >
                  RB Ministries
                </strong>
                <span
                  style={{
                    color: "#c88a20",
                    fontWeight: 950,
                    fontSize: 22,
                  }}
                >
                  Admin
                </span>
              </div>
            </div>
          </Link>

          <div
            style={{
              marginTop: 22,
              padding: 16,
              borderRadius: 20,
              background: "rgba(255,255,255,0.66)",
              border: "1px solid rgba(217,164,65,0.18)",
              color: "#6b7280",
              lineHeight: 1.55,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Centre de traitement pastoral : suivi, excellence et impact.
          </div>

          <nav style={{ display: "grid", gap: 10, marginTop: 24 }}>
            {adminLinks.map((link) => {
  const Icon = link.icon;
  const isActive = pathname === link.href;

  return (
    <Link
      key={link.href}
      href={link.href}
      className={`admin-nav-link ${isActive ? "active" : ""}`}
    >
      <Icon size={20} />
      {link.label}
    </Link>
  );
})}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              marginTop: 28,
              width: "100%",
              border: "1px solid rgba(239,68,68,0.28)",
              background: "rgba(254,242,242,0.92)",
              color: "#991b1b",
              borderRadius: 18,
              padding: "14px 16px",
              fontWeight: 950,
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 10,
            }}
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      <section className="admin-shell-main">
        <header className="admin-topbar">
          <div>
            <p
              style={{
                color: "#c88a20",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                fontSize: 12,
                fontWeight: 950,
                margin: "0 0 8px",
              }}
            >
              Espace privé du ministère
            </p>
            <h1 style={{ margin: 0, fontSize: 34, color: "#111827" }}>{title}</h1>
            <p style={{ margin: "9px 0 0", color: "#6b7280", lineHeight: 1.55 }}>
              {subtitle}
            </p>
          </div>

          <Link
            href="/"
            style={{
              textDecoration: "none",
              border: "1px solid rgba(217,164,65,0.28)",
              background: "rgba(255,255,255,0.78)",
              color: "#374151",
              padding: "12px 16px",
              borderRadius: 999,
              fontWeight: 900,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              whiteSpace: "nowrap",
            }}
          >
            <Home size={18} />
            Page publique
          </Link>
        </header>

        <div style={{ padding: 36 }}>{children}</div>
      </section>
    </main>
  );
}
