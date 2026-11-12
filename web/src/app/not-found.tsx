import Link from "next/link";
import { notFoundCopy as c } from "@/content/pages";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="contenido" className="flex-1">
    <section className="bg-navy-900 px-5 py-28 text-center text-white sm:px-8">
      <p className="eyebrow text-gold">404</p>
      <h1 className="mx-auto mt-4 max-w-xl font-serif text-5xl">{c.title}</h1>
      <div className="gold-rule mx-auto mt-6" />
      <p className="mx-auto mt-6 max-w-md text-white/80">{c.text}</p>
      <Link
        href="/"
        className="btn-label mt-10 inline-flex h-12 items-center rounded-sm bg-gold px-6 text-navy-900 transition hover:bg-gold-light"
      >
        {c.cta}
      </Link>
    </section>
      </main>
      <SiteFooter />
    </>
  );
}
