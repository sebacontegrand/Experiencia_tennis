import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { MobileMenu } from "@/components/site/mobile-menu";
import { LockKeyhole } from "lucide-react";
import { adminLink, headerCta, mainNav } from "@/content/nav";

export function SiteHeader() {
  return (
    // Fondo sólido a propósito: backdrop-filter convertiría al header en el contenedor
    // del menú móvil (position: fixed) y lo recortaría.
    <header className="sticky top-0 z-30 border-b border-gold/25 bg-navy-900">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-navy-900"
      >
        Saltar al contenido
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5 sm:h-20 sm:px-8">
        <Logo priority />
        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-8">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="eyebrow text-[0.7rem] text-white/85 transition hover:text-gold-light"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={headerCta.href}
                className="eyebrow inline-flex h-10 items-center rounded-sm border border-gold px-5 text-[0.7rem] text-gold-light transition hover:bg-gold hover:text-navy-900"
              >
                {headerCta.label}
              </Link>
            </li>
          </ul>
        </nav>
        <div className="flex items-center gap-1 md:-mr-2">
          <MobileMenu items={mainNav} cta={headerCta} />
          <Link
            href={adminLink.href}
            prefetch={false}
            aria-label={adminLink.label}
            title={adminLink.label}
            className="inline-flex size-11 items-center justify-center rounded-sm text-white/60 transition hover:text-gold-light"
          >
            <LockKeyhole aria-hidden className="size-[18px]" />
          </Link>
        </div>
      </div>
    </header>
  );
}
