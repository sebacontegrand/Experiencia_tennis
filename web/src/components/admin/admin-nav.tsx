"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ExternalLink, LayoutDashboard, Users } from "lucide-react";
import { adminCopy } from "@/content/admin";
import { cn } from "@/lib/utils";

const c = adminCopy.nav;

const items = [
  { href: "/admin/experiencias/tablero", label: c.board, icon: LayoutDashboard, match: (p: string) => p === "/admin" || p.startsWith("/admin/experiencias/tablero") },
  {
    href: "/admin/experiencias",
    label: c.experiences,
    icon: CalendarDays,
    match: (p: string) => (p.startsWith("/admin/experiencias") && !p.startsWith("/admin/experiencias/tablero")) || p.startsWith("/admin/inscripciones"),
  },
  { href: "/admin/jugadores", label: c.players, icon: Users, match: (p: string) => p.startsWith("/admin/jugadores") },
  { href: "/", label: c.site, icon: ExternalLink, match: () => false, external: true },
] as const;

/**
 * Navegación del panel. En el celular es una barra fija abajo (al alcance del pulgar);
 * desde `sm` vive en el header.
 */
export function AdminNav({ variant }: { variant: "top" | "bottom" }) {
  return <AdminNavView variant={variant} pathname={usePathname()} />;
}

/** Misma barra sin sección activa: se muestra mientras se resuelve la ruta (Suspense). */
export function AdminNavView({ variant, pathname }: { variant: "top" | "bottom"; pathname: string }) {

  if (variant === "top") {
    return (
      <nav aria-label={c.label} className="hidden sm:block">
        <ul className="flex items-center gap-6">
          {items.map((it) => {
            const active = it.match(pathname);
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  aria-current={active ? "page" : undefined}
                  target={"external" in it ? "_blank" : undefined}
                  className={cn(
                    "inline-flex h-14 items-center gap-1.5 border-b-2 text-[0.9375rem] font-medium transition-colors",
                    active ? "border-gold text-white" : "border-transparent text-white/75 hover:text-white",
                  )}
                >
                  {it.label}
                  {"external" in it && <ExternalLink aria-hidden className="size-3.5" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav
      aria-label={c.label}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white pb-[env(safe-area-inset-bottom)] sm:hidden"
    >
      <ul className="grid grid-cols-4">
        {items.map((it) => {
          const active = it.match(pathname);
          const Icon = it.icon;
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                target={"external" in it ? "_blank" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-[0.8125rem] font-medium transition-colors",
                  active ? "text-navy-900" : "text-ink-muted hover:text-navy-900",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                    active && "bg-cream-200",
                  )}
                >
                  <Icon aria-hidden className="size-5" strokeWidth={active ? 2.25 : 1.75} />
                </span>
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
