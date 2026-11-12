import type { Metadata } from "next";
import { B2BPage } from "@/components/site/b2b-page";
import { companiesCopy as c } from "@/content/b2b";

export const metadata: Metadata = {
  title: c.meta.title,
  description: c.meta.description,
  alternates: { canonical: c.path },
  openGraph: { title: c.meta.title, description: c.meta.description, url: c.path },
};

export default function CompaniesPage() {
  return <B2BPage copy={c} />;
}
