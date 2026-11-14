import type { Metadata } from "next";
import { RacketAnatomy } from "@/components/site/racket-anatomy";
import { racketCopy } from "@/content/racket";

// Página aparte, sin lugar en el menú: se llega desde «Mirá cómo se arma» en la home.
export const metadata: Metadata = {
  title: racketCopy.title,
  description: racketCopy.lead,
};

export default function HowItsBuiltPage() {
  return <RacketAnatomy />;
}
