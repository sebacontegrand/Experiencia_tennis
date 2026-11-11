import type { Metadata } from "next";
import { PENDING_DATA, privacyCopy as c, privacyResponsible as r } from "@/content/privacy";

export const metadata: Metadata = {
  title: c.meta.title,
  description: c.meta.description,
  alternates: { canonical: "/privacidad" },
};

function Responsible() {
  return (
    <ul className="space-y-1">
      <li>
        <strong className="font-medium text-navy-900">Responsable:</strong> {r.name ?? PENDING_DATA}
      </li>
      <li>
        <strong className="font-medium text-navy-900">CUIT:</strong> {r.taxId ?? PENDING_DATA}
      </li>
      <li>
        <strong className="font-medium text-navy-900">Domicilio:</strong> {r.address ?? PENDING_DATA}
      </li>
    </ul>
  );
}

export default function PrivacyPage() {
  return (
    <article className="bg-white px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow text-gold-deep">Legal</p>
        <h1 className="mt-4 font-serif text-5xl text-navy-900">{c.title}</h1>
        <div className="gold-rule mt-6" />
        <p className="mt-6 text-sm text-ink-muted">{c.updated}</p>
        <div className="mt-12 space-y-12">
          {c.sections.map((s) => (
            <section key={s.title}>
              <h2 className="font-serif text-3xl text-navy-900">{s.title}</h2>
              <div className="mt-4 space-y-4 leading-relaxed text-ink">
                {s.body.map((p) => (p === "__RESPONSIBLE__" ? <Responsible key={p} /> : <p key={p}>{p}</p>))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
