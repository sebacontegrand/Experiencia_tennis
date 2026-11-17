import { whatsappLink } from "@/config/site";
import { WhatsappIcon } from "@/components/icons/brand-icons";

/** Botón flotante de WhatsApp con mensaje prearmado. */
export function WhatsappButton() {
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp (se abre en una nueva pestaña)"
      data-whatsapp-fab
      className="fixed right-4 bottom-4 z-40 inline-flex size-14 items-center justify-center rounded-full border border-ball/60 bg-forest-900 text-ball-light shadow-lg shadow-forest-900/30 transition hover:bg-forest-800 hover:text-white sm:right-6 sm:bottom-6"
    >
      <WhatsappIcon size={28} />
    </a>
  );
}
