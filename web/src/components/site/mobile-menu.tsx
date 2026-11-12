"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Menu, X } from "lucide-react";

type Item = { readonly href: string; readonly label: string };

export function MobileMenu({ items, cta }: { items: readonly Item[]; cta: Item }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();

  // Cerrar al cambiar de ruta (con Cache Components la ruta anterior queda montada en <Activity>)
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-11 items-center justify-center rounded-sm text-gold-light"
      >
        {open ? <X aria-hidden /> : <Menu aria-hidden />}
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="fixed inset-x-0 top-16 bottom-0 z-30 overflow-y-auto bg-navy-900 px-5 pt-8 pb-24"
      >
        <nav aria-label="Principal (móvil)">
          <ul className="flex flex-col">
            {items.map((item) => (
              <li key={item.href} className="border-b border-white/10">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-5 font-serif text-3xl text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={cta.href}
            onClick={() => setOpen(false)}
            className="btn-label mt-10 flex h-14 items-center justify-center rounded-sm bg-gold text-navy-900"
          >
            {cta.label} a la comunidad
          </Link>
        </nav>
      </div>
    </div>
  );
}
