import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

/**
 * Auth.js: solo administradores, con Google. No hay registro abierto: una cuenta entra
 * únicamente si su email ya existe en la tabla User (alta con `npm run admin:add`).
 * Variables: AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  // Detrás del proxy de Vercel el host es confiable; también permite `next start` en local.
  trustHost: true,
  session: { strategy: "database", maxAge: 30 * 24 * 60 * 60 },
  providers: [
    Google({
      // Seguro acá: los User los damos de alta nosotros y Google verifica el email.
      // Permite vincular la cuenta de Google al User creado con admin:add.
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: { signIn: "/admin/ingresar", error: "/admin/ingresar" },
  callbacks: {
    async signIn({ profile, user }) {
      const email = (profile?.email ?? user.email)?.toLowerCase();
      if (!email || profile?.email_verified === false) return false;
      const admin = await db.user.findUnique({ where: { email }, select: { id: true } });
      return Boolean(admin);
    },
  },
});
