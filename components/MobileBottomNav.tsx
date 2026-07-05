"use client";

import Link from "next/link";
import { Bell, BookOpen, Home, LockKeyhole, MessageCircleHeart, PlayCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useLanguage } from "./LanguageProvider";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/admin") return pathname.startsWith("/admin");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const adminMode = pathname.startsWith("/admin");

  const publicLinks = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/teachings", label: t("videos"), icon: PlayCircle },
    { href: "/testimonies", label: t("testimonies"), icon: MessageCircleHeart },
    { href: "/prayer", label: t("prayerShort"), icon: Bell },
    { href: "/admin/login", label: t("privateShort"), icon: LockKeyhole },
  ];

  const adminLinks = [
    { href: "/admin", label: t("admin"), icon: Home },
    { href: "/admin/publications", label: t("publish"), icon: Bell },
    { href: "/admin/teachings", label: t("videos"), icon: PlayCircle },
    { href: "/admin/testimonies", label: t("testimonies"), icon: MessageCircleHeart },
    { href: "/admin/books", label: t("books"), icon: BookOpen },
  ];

  const links = adminMode ? adminLinks : publicLinks;

  return (
    <nav className="mobile-bottom-nav" aria-label="Navigation mobile">
      {links.map((link) => {
        const Icon = link.icon;
        const active = isActive(pathname, link.href);

        return (
          <Link key={link.href} href={link.href} className={active ? "active" : ""}>
            <Icon size={21} />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
