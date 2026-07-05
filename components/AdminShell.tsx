"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
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
import { createClient } from "../lib/supabase/browser";

type AdminLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const adminLinks: AdminLink[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/publications", label: "Publications", icon: Megaphone },
  { href: "/admin/prayers", label: "Prières", icon: HeartHandshake },
  { href: "/admin/testimonies", label: "Témoignages", icon: MessageCircleHeart },
  { href: "/admin/appointments", label: "Rendez-vous", icon: CalendarDays },
  { href: "/admin/invitations", label: "Invitations", icon: Send },
  { href: "/admin/encouragements", label: "Encouragements", icon: Mail },
  { href: "/admin/teachings", label: "Enseignements", icon: Video },
  { href: "/admin/agenda", label: "Agenda", icon: ClipboardList },
  { href: "/admin/books", label: "Livres", icon: BookOpen },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
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
    <main className="admin-page admin-mobile-ready">
      <aside className="admin-shell-sidebar">
        <div className="admin-shell-inner">
          <Link href="/" className="admin-brand">
            <div className="header-logo-frame admin-brand-logo">
              <Image
                src="/images/logo_rb.png"
                alt="RB Ministries"
                width={160}
                height={120}
                className="header-logo-img"
                priority
              />
            </div>

            <div>
              <strong>RB Ministries</strong>
              <span>Admin</span>
            </div>
          </Link>

          <div className="admin-context-card">
            Centre de traitement pastoral : suivi, excellence et impact.
          </div>

          <nav className="admin-nav-list" aria-label="Navigation admin">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const isActive = isActivePath(pathname, link.href);

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
            className="admin-logout-btn"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      <section className="admin-shell-main">
        <header className="admin-topbar">
          <div>
            <p>Espace privé du ministère</p>
            <h1>{title}</h1>
            <span>{subtitle}</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <ThemeToggle />

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
          </div>

          <details className="admin-mobile-details">
            <summary>Menu admin complet</summary>

            <nav>
              {adminLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <Link key={link.href} href={link.href}>
                    <Icon size={18} />
                    {link.label}
                  </Link>
                );
              })}

              <button type="button" onClick={handleLogout}>
                <LogOut size={18} />
                Déconnexion
              </button>
            </nav>
          </details>
        </header>

        <div className="admin-content-wrap">{children}</div>
      </section>
    </main>
  );
}
