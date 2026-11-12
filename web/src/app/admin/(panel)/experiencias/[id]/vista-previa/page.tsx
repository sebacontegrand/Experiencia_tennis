import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { getExperienceForPreview } from "@/lib/data/public";
import { ExperienceDetailView } from "@/components/experiences/experience-detail";
import { StatusBadge } from "@/components/admin/status-badge";

export const metadata: Metadata = { title: "Vista previa" };

export default async function PreviewPage({ params }: PageProps<"/admin/experiencias/[id]/vista-previa">) {
  await requireAdmin();
  const { id } = await params;
  const row = await db.experience.findUnique({ where: { id }, select: { slug: true, status: true } });
  const experience = row && (await getExperienceForPreview(row.slug));
  if (!row || !experience) notFound();
  return (
    <div className="-mx-4 -my-8">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <span className="flex items-center gap-2">
          Vista previa: así se va a ver en el sitio. <StatusBadge status={row.status} />
        </span>
        <Link href={`/admin/experiencias/${id}`} className="font-semibold underline underline-offset-4">
          Volver a editar
        </Link>
      </div>
      <ExperienceDetailView experience={experience} preview />
    </div>
  );
}
