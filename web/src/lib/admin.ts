import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

/**
 * Data Access Layer del panel: devuelve el administrador logueado o redirige al login.
 * Se llama en cada página Y en cada Server Action del admin (no alcanza con proteger la página).
 */
export async function requireAdmin() {
  // Siempre en tiempo de request: Auth.js genera valores aleatorios y Cache Components
  // no los admite durante el prerender.
  await connection();
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email) redirect("/admin/ingresar");
  const user = await db.user.findUnique({ where: { email }, select: { id: true, email: true, name: true, role: true } });
  if (!user) redirect("/admin/ingresar?error=AccessDenied");
  return user;
}
