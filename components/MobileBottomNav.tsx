"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookOpen,
  HeartHandshake,
  Home,
  LockKeyhole,
  MessageCircleHeart,
  PlayCircle,
} from "lucide-react";

const publicLinks = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/teachings", label: "Vidéos", icon: PlayCircle },
  { href: "/testimonies", label: "Témoins", icon: MessageCircleHeart },
  { href: "/prayer", label: "Prière", icon: HeartHandshake },
  { href: "/admin/login", label: "Privé", icon: LockKeyhole },
];

const adminLinks = [
  { href: "/admin", label: "Admin", icon: Home },
  { href: "/admin/publications", label: "Publier", icon: Bell },
  { href: "/admin/teachings", label: "Vidéos", icon: PlayCircle },
  { href: "/admin/testimonies", label: "Témoins", icon: MessageCircleHeart },
  { href: "/admin/books", label: "Livres", icon: BookOpen },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const links = pathname.startsWith("/admin") ? adminLinks : publicLinks;

  return (
    <nav className="mobile-bottom-nav" aria-label="Navigation mobile">
      {links.map((link) => {
        const Icon = link.icon;
        const active = isActive(pathname, link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`mobile-bottom-link ${active ? "active" : ""}`}
          >
            <Icon size={20} />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
