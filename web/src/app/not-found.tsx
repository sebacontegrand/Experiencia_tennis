import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { NotFoundContent } from "@/components/site/not-found-content";

/** URL inexistente: fuera del layout del sitio, así que suma header y footer. */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="contenido" className="flex-1">
        <NotFoundContent />
      </main>
      <SiteFooter />
    </>
  );
}
