"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ExternalLink, Inbox, LayoutDashboard, Users } from "lucide-react";
import { adminCopy } from "@/content/admin";
import { cn } from "@/lib/utils";

const c = adminCopy.nav;

type Item = {
  key: string;
  href: string;
  label: string;
  icon: typeof Inbox;
  match: (p: string) => boolean;
  external?: boolean;
};

const items: Item[] = [
  { key: "board", href: "/admin/experiencias/tablero", label: c.board, icon: LayoutDashboard, match: (p) => p === "/admin" || p.startsWith("/admin/experiencias/tablero") },
  {
    key: "experiences",
    href: "/admin/experiencias",
    label: c.experiences,
    icon: CalendarDays,
    match: (p) => (p.startsWith("/admin/experiencias") && !p.startsWith("/admin/experiencias/tablero")) || p.startsWith("/admin/inscripciones"),
  },
  { key: "players", href: "/admin/jugadores", label: c.players, icon: Users, match: (p) => p.startsWith("/admin/jugadores") },
  { key: "leads", href: "/admin/consultas", label: c.leads, icon: Inbox, match: (p) => p.startsWith("/admin/consultas") },
  { key: "site", href: "/", label: c.site, icon: ExternalLink, match: () => false, external: true },
];

/** Cantidad para la burbuja de un ítem (p. ej. consultas sin responder). */
export type NavBadges = Partial<Record<string, number>>;

/**
 * Navegación del panel. En el celular es una barra fija abajo (al alcance del pulgar);
 * desde `md` vive en el header.
 */
export function AdminNav({ variant, badges }: { variant: "top" | "bottom"; badges?: NavBadges }) {
  return <AdminNavView variant={variant} pathname={usePathname()} badges={badges} />;
}

/** Misma barra sin sección activa: se muestra mientras se resuelve la ruta (Suspense). */
export function AdminNavView({ variant, pathname, badges = {} }: { variant: "top" | "bottom"; pathname: string; badges?: NavBadges }) {
  const badgeLabel = (n: number) => (n > 99 ? "99+" : String(n));

  if (variant === "top") {
    return (
      <nav aria-label={c.label} className="hidden md:block">
        <ul className="flex items-center gap-5 lg:gap-6">
          {items.map((it) => {
            const active = it.match(pathname);
            const n = badges[it.key] ?? 0;
            return (
              <li key={it.key}>
                <Link
                  href={it.href}
                  aria-current={active ? "page" : undefined}
                  target={it.external ? "_blank" : undefined}
                  className={cn(
                    "inline-flex h-14 items-center gap-1.5 border-b-2 text-[0.9375rem] font-medium whitespace-nowrap transition-colors",
                    active ? "border-gold text-white" : "border-transparent text-white/75 hover:text-white",
                  )}
                >
                  {it.label}
                  {n > 0 && (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-xs font-semibold text-navy-900">
                      {badgeLabel(n)}
                      <span className="sr-only"> sin responder</span>
                    </span>
                  )}
                  {it.external && <ExternalLink aria-hidden className="size-3.5" />}
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
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-5">
        {items.map((it) => {
          const active = it.match(pathname);
          const Icon = it.icon;
          const n = badges[it.key] ?? 0;
          return (
            <li key={it.key}>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                target={it.external ? "_blank" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                  active ? "text-navy-900" : "text-ink-muted hover:text-navy-900",
                )}
              >
                <span className={cn("relative flex h-7 w-11 items-center justify-center rounded-full transition-colors", active && "bg-cream-200")}>
                  <Icon aria-hidden className="size-5" strokeWidth={active ? 2.25 : 1.75} />
                  {n > 0 && (
                    <span className="absolute -top-1 right-0 inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-gold px-1 text-[0.6875rem] leading-none font-semibold text-navy-900">
                      {badgeLabel(n)}
                      <span className="sr-only"> sin responder</span>
                    </span>
                  )}
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
