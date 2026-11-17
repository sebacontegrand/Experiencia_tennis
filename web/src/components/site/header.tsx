import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { MobileMenu } from "@/components/site/mobile-menu";
import { LockKeyhole } from "lucide-react";
import { adminLink, headerCta, mainNav } from "@/content/nav";

export function SiteHeader() {
  return (
    // Fondo crema sólido a propósito: backdrop-filter convertiría al header en el contenedor
    // del menú móvil (position: fixed) y lo recortaría.
    <header className="sticky top-0 z-30 border-b border-forest-900/10 bg-cream">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-forest-900 focus:px-3 focus:py-2 focus:text-cream"
      >
        Saltar al contenido
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5 sm:h-20 sm:px-8">
        <Logo priority />
        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex h-11 items-center text-[0.9375rem] font-medium text-forest-900 transition hover:text-clay-deep"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={headerCta.href}
                className="btn-label inline-flex h-11 items-center rounded-sm bg-forest-900 px-5 text-cream transition hover:bg-forest-700"
              >
                {headerCta.label}
              </Link>
            </li>
          </ul>
        </nav>
        <div className="flex items-center gap-1 lg:-mr-2">
          <MobileMenu items={mainNav} cta={headerCta} />
          <Link
            href={adminLink.href}
            prefetch={false}
            aria-label={adminLink.label}
            title={adminLink.label}
            className="inline-flex size-11 items-center justify-center rounded-sm text-ink-muted transition hover:text-forest-900"
          >
            <LockKeyhole aria-hidden className="size-[18px]" />
          </Link>
        </div>
      </div>
    </header>
  );
}
