import Link from "next/link";
import { Mail } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { InstagramIcon, WhatsappIcon } from "@/components/icons/brand-icons";
import { instagramLink, siteConfig, whatsappLink } from "@/config/site";
import { footerLinks } from "@/content/nav";

export function SiteFooter() {
  const instagram = instagramLink();
  return (
    <footer className="bg-navy-950 px-5 pt-16 pb-24 text-white/80 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-6 max-w-sm font-serif text-2xl leading-snug text-white">{siteConfig.tagline}</p>
          <p className="eyebrow mt-4 text-gold">{siteConfig.secondaryTagline}</p>
        </div>

        <nav aria-label="Pie de página">
          <p className="eyebrow text-gold">Sitio</p>
          <ul className="mt-3 text-[0.9375rem]">
            {footerLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-11 items-center transition hover:text-gold-light">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="eyebrow text-gold">Contacto</p>
          <ul className="mt-3 text-[0.9375rem]">
            <li>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-3 transition hover:text-gold-light"
              >
                <WhatsappIcon size={18} /> {siteConfig.contact.whatsappDisplay}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="inline-flex min-h-11 items-center gap-3 break-all transition hover:text-gold-light"
              >
                <Mail size={18} aria-hidden /> {siteConfig.contact.email}
              </a>
            </li>
            {instagram && (
              <li>
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-3 transition hover:text-gold-light"
                >
                  <InstagramIcon size={18} /> @{siteConfig.contact.instagramUser}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-14 max-w-6xl border-t border-white/10 pt-6 text-xs text-white/60">
        {siteConfig.name} · {siteConfig.brand}
      </div>
    </footer>
  );
}
