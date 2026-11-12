import Link from "next/link";
import { adminCopy } from "@/content/admin";
import { cn } from "@/lib/utils";

/** Pestañas de la sección Experiencias: lista y tablero de control. */
export function ExperiencesTabs({ active }: { active: "list" | "board" }) {
  const tabs = [
    { key: "list", href: "/admin/experiencias", label: adminCopy.board.tabList },
    { key: "board", href: "/admin/experiencias/tablero", label: adminCopy.board.tabBoard },
  ] as const;
  return (
    <nav aria-label="Secciones de experiencias" className="mt-4 border-b border-border">
      <ul className="flex gap-6">
        {tabs.map((t) => (
          <li key={t.key}>
            <Link
              href={t.href}
              aria-current={active === t.key ? "page" : undefined}
              className={cn(
                "-mb-px inline-flex h-12 items-center border-b-2 text-sm font-semibold",
                active === t.key ? "border-navy-900 text-navy-900" : "border-transparent text-ink-muted hover:text-navy-900",
              )}
            >
              {t.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
